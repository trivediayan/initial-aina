import type { QuickSuggestion } from '@/types/dashboard.types'

export const quickSuggestions: QuickSuggestion[] = [
  { id: '1', text: 'Nearby Heritage', icon: '🏛️' },
  { id: '2', text: 'Best Local Food', icon: '🍛' },
  { id: '3', text: 'Hidden Gems', icon: '💎' },
  { id: '4', text: "What's Nearby?", icon: '📍' },
  { id: '5', text: 'What should I explore next?', icon: '✨' },
]

export const chatService = {
  getQuickSuggestions: (): QuickSuggestion[] => {
    return quickSuggestions
  },

  getMockResponse: (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase()
    
    if (lowerMessage.includes('heritage') || lowerMessage.includes('historical')) {
      return "I found several heritage sites nearby! The Taj Mahal and Red Fort are must-visit destinations. Would you like me to create an itinerary for these sites?"
    }
    
    if (lowerMessage.includes('food') || lowerMessage.includes('eat') || lowerMessage.includes('restaurant')) {
      return "For authentic local cuisine, I recommend Paranthe Wali Gali for traditional parathas. There are also several hidden gems serving regional specialties. What type of cuisine interests you?"
    }
    
    if (lowerMessage.includes('hidden') || lowerMessage.includes('gem') || lowerMessage.includes('secret')) {
      return "I've discovered some amazing hidden gems! Agrasen ki Baoli is an ancient stepwell that many tourists miss. Would you like directions to these off-the-beaten-path locations?"
    }
    
    if (lowerMessage.includes('nearby') || lowerMessage.includes('close') || lowerMessage.includes('around')) {
      return "Based on your current location, there are several interesting places within walking distance. I can show you heritage sites, spiritual places, and local food spots. What would you like to explore first?"
    }
    
    return "I'd be happy to help you explore! You can ask me about heritage sites, local food, hidden gems, or what to see next in Vadodara. What interests you most?"
  },
}
