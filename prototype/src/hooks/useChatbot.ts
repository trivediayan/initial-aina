import { useState, useCallback, useRef } from 'react'
import { chatbotService } from '@/services/chatbot.service'
import type { ChatMessage, ChatStatus } from '@/types/dashboard.types'

export function useChatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [status, setStatus] = useState<ChatStatus>({
    isTyping: false,
    error: null,
    isConnected: !import.meta.env.VITE_CHATBOT_API_URL, // Connected to mock if no API URL
  })
  const [isRecording, setIsRecording] = useState(false)
  const [recognitionError, setRecognitionError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const scrollToBottomIfNeeded = useCallback(() => {
    const container = messagesEndRef.current?.parentElement
    if (container) {
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100
      if (isNearBottom) {
        scrollToBottom()
      }
    }
  }, [scrollToBottom])

  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim() || status.isTyping) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date(),
      status: 'sending',
    }

    setMessages(prev => [...prev, userMessage])
    setStatus(prev => ({ ...prev, isTyping: true, error: null }))

    try {
      const context = chatbotService.getContext()
      const aiResponse = await chatbotService.sendMessage(message, context)
      
      setMessages(prev => [...prev.map(msg => 
        msg.id === userMessage.id ? { ...msg, status: 'sent' as const } : msg
      ), aiResponse])
      
      setStatus(prev => ({ ...prev, isTyping: false }))
      setTimeout(scrollToBottom, 100)
    } catch (error) {
      setMessages(prev => [...prev.map(msg => 
        msg.id === userMessage.id ? { ...msg, status: 'error' as const, error: 'Failed to send message' } : msg
      )])
      setStatus(prev => ({ ...prev, isTyping: false, error: 'Failed to send message. Please try again.' }))
    }
  }, [status.isTyping, scrollToBottom])

  const retryMessage = useCallback(async (messageId: string) => {
    const message = messages.find(m => m.id === messageId)
    if (message && message.role === 'user') {
      setMessages(prev => prev.filter(m => m.id !== messageId))
      await sendMessage(message.content)
    }
  }, [messages, sendMessage])

  const clearConversation = useCallback(() => {
    setMessages([])
    setStatus(prev => ({ ...prev, error: null }))
    chatbotService.clearConversation()
  }, [])

  const quickSuggestions = chatbotService.getQuickSuggestions()

  // Voice input functionality
  const startRecording = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setRecognitionError('Voice input not supported in this browser')
      return
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      sendMessage(transcript)
      setIsRecording(false)
    }

    recognition.onerror = (event: any) => {
      setRecognitionError(event.error)
      setIsRecording(false)
    }

    recognition.onend = () => {
      setIsRecording(false)
    }

    try {
      recognition.start()
      setIsRecording(true)
      setRecognitionError(null)
    } catch (error) {
      setRecognitionError('Failed to start voice recognition')
      setIsRecording(false)
    }
  }, [sendMessage])

  const stopRecording = useCallback(() => {
    // Recognition stops automatically on result
    setIsRecording(false)
  }, [])

  return {
    messages,
    status,
    isRecording,
    recognitionError,
    messagesEndRef,
    sendMessage,
    retryMessage,
    clearConversation,
    quickSuggestions,
    startRecording,
    stopRecording,
    scrollToBottom,
    scrollToBottomIfNeeded,
  }
}
