import type { ChatMessage, QuickSuggestion, ChatbotContext } from '@/types/dashboard.types'
import { userService } from './user.service'
import { mapService } from './map.service'

const chatbotApiUrl =
  import.meta.env.VITE_CHATBOT_API_URL ||
  import.meta.env.VITE_BACKEND_API_URL ||
  'https://aina-backend.trivediayn.workers.dev'

interface ChatbotRequest {
  message: string
  context?: ChatbotContext
  conversationHistory?: ChatMessage[]
}

interface ChatbotResponse {
  response?: string
  message?: string
  conversation_id?: string
  context?: ChatbotContext
  suggestions?: string[]
}

class ChatbotService {
  private mockResponses: Record<string, string> = {
    'heritage': "I found several heritage sites nearby! Laxmi Vilas Palace is a must-visit — it's one of the largest private residences in the world. The EME Temple is unique with its geodesic dome architecture. Ask me to show nearby heritage on the map.",
    'historical': "Vadodara has rich historical significance! Champaner-Pavagadh Archaeological Park is a UNESCO World Heritage site with ancient ruins dating back to the 8th century. The Sayaji Baug gardens were built by Maharaja Sayajirao Gaekwad III in 1879.",
    'food': "For authentic Gujarati cuisine, try Sev Usal at Mandvi - it's a Vadodara specialty! For breakfast, Fafda-Jalebi is traditional, especially on Saturdays. I can recommend specific restaurants based on your preferences.",
    'eat': "Gujarati thali is a complete meal experience! I recommend trying it at Sayajigunj for authentic flavors. For street food, Mandvi area has excellent options like Bhaji Pav and local snacks.",
    'restaurant': "Based on your location, I can suggest several great restaurants! For traditional Gujarati food, try places in Alkapuri or Mandvi. For modern cuisine, there are options in Gotri and Fatehgunj areas.",
    'hidden': "I've discovered some amazing hidden gems! Muzumdar Wada is a historic wooden mansion, Hazira Maqbara showcases exquisite Mughal architecture, and Sevasi Vav (Vidhyadhar ni Vav) is a breathtaking ancient stepwell.",
    'gem': "Hidden gems abound in Vadodara! Explore Gendi Gate, Gulab Baug Bungalow, and the Akota Historical Site for rich local culture off the beaten path.",
    'secret': "Let me share some local secrets! Hazira Maqbara offers tranquil gardens and detailed stone carvings. The Raopura heritage area has remarkable historic streetscapes.",

    'plan': "For trip planning, I recommend starting with major heritage sites in the morning, local food for lunch, and hidden gems in the afternoon. Vadodara is well-connected, so travel between places is convenient. Would you like me to suggest the best route?",
    'schedule': "I can help you build a practical visit plan! Most heritage sites are open from 9 AM to 5 PM, except on Mondays. Food places typically operate from 8 AM to 10 PM. Hidden gems can be visited any time during daylight hours.",
    'nearby': "Based on your current location, there are several interesting places within walking distance! I can show you heritage sites, spiritual places, and local food spots. The Sayaji Baug area has multiple attractions clustered together.",
    'close': "You're in a great area! Within 2km, you have access to several heritage sites, the Baroda Museum, and excellent food options in Mandvi. Would you like specific directions to any of these?",
    'around': "Your surroundings have plenty to explore! The central area has Laxmi Vilas Palace, Sayaji Baug, and the museum. For food, Mandvi is nearby. I can guide you to the most interesting places based on your current interests.",
    'next': "Based on your exploration history, I recommend visiting the EME Temple next - it's unique and won't take much time. After that, the Nazarbaug Palace has an incredible royal jewelry collection. Both are close to your current location!",
    'recommend': "For personalized recommendations, I can suggest places based on what you've enjoyed so far! Since you've shown interest in heritage, I'd recommend the Kirti Mandir and Sursagar Lake. Both offer cultural significance and peaceful experiences.",
  }

  private enhancedQuickSuggestions: QuickSuggestion[] = []

  getQuickSuggestions(): QuickSuggestion[] {
    return this.enhancedQuickSuggestions
  }

  async sendMessage(message: string, context?: ChatbotContext): Promise<ChatMessage> {
    try {
      if (chatbotApiUrl) {
        return await this.sendToRealApi(message, context)
      } else {
        return await this.sendToMockApi(message, context)
      }
    } catch (error) {
      throw new Error('Failed to send message')
    }
  }

  private async sendToMockApi(message: string, context?: ChatbotContext): Promise<ChatMessage> {
    await this.simulateTypingDelay()
    
    const lowerMessage = message.toLowerCase()
    let response = this.getMockResponse(lowerMessage)
    
    // Add context-aware responses
    if (context?.savedPlaces && context.savedPlaces.length > 0) {
      response += " I see you have some saved places. Would you like me to help you plan a route through them?"
    }
    
    if (context?.visitedPlaces && context.visitedPlaces.length > 0) {
      response += " Based on your exploration history, I can suggest new places that align with your interests."
    }

    return {
      id: Date.now().toString(),
      role: 'assistant',
      content: response,
      timestamp: new Date(),
      status: 'sent',
    }
  }

  private async sendToRealApi(message: string, context?: ChatbotContext): Promise<ChatMessage> {
    const request: ChatbotRequest = {
      message,
      context,
      conversationHistory: [], // Could be enhanced with session history
    }

    const response = await fetch(`${chatbotApiUrl}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      throw new Error('Chatbot API request failed')
    }

    const data: ChatbotResponse = await response.json()

    return {
      id: Date.now().toString(),
      role: 'assistant',
      content: data.response || data.message || '',
      timestamp: new Date(),
      status: 'sent',
    }
  }

  private getMockResponse(message: string): string {
    for (const [key, response] of Object.entries(this.mockResponses)) {
      if (message.includes(key)) {
        return response
      }
    }
    
    return "I'd be happy to help you explore Vadodara! Ask me about heritage sites, local food, hidden gems, or what to see next."
  }

  private async simulateTypingDelay(): Promise<void> {
    const delay = 800 + Math.random() * 1200
    await new Promise(resolve => setTimeout(resolve, delay))
  }

  getContext(): ChatbotContext {
    const savedPlaces = userService.getSavedPlaces()
    const visitedPlaces = userService.getVisitedPlaces()
    const allPlaces = mapService.getPlaces()

    return {
      currentLocation: {
        latitude: 22.3076,
        longitude: 73.1812,
        address: 'Vadodara, Gujarat',
      },
      nearbyPlaces: allPlaces.slice(0, 3).map(p => p.id),
      savedPlaces: savedPlaces.map(sp => sp.placeId),
      visitedPlaces: visitedPlaces.map(vp => vp.placeId),
      userPreferences: {
        interests: ['heritage', 'food', 'culture'],
        language: 'english',
        accessibility: [],
      },
    }
  }

  clearConversation(): void {
    // This would clear the conversation history in a real implementation
    console.log('Conversation cleared')
  }
}

export const chatbotService = new ChatbotService()
