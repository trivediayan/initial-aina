import { useState, useEffect } from 'react'
import {
  Send, Mic, Square, Trash2, RotateCcw, X,
} from 'lucide-react'
import { useChatbot } from '@/hooks/useChatbot'
import './Chat.css'

interface ChatProps {
  isOpen?: boolean
  onClose?: () => void
}

export function Chat({ isOpen = true, onClose }: ChatProps) {
  const {
    messages,
    status,
    isRecording,
    recognitionError,
    messagesEndRef,
    sendMessage,
    retryMessage,
    clearConversation,
    startRecording,
    stopRecording,
    scrollToBottom,
  } = useChatbot()

  const [inputValue, setInputValue] = useState('')

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return
    await sendMessage(inputValue)
    setInputValue('')
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  return (
    <aside className={`chat-panel ${isOpen ? 'open' : ''}`}>
      <div className="chat-header">
        <div className="chat-identity">
          <div className="avatar-container">
            <img className="chat-avatar-mark" src="/ayna-logo.png" alt="AINA" />
            <div className={`status-indicator ${status.isConnected ? 'online' : 'offline'}`} />
          </div>
          <div className="chat-info">
            <h2 className="chat-title">AINA</h2>
            <p className="chat-subtitle">Your companion for cultural discovery</p>
          </div>
        </div>
        <div className="chat-header-actions">
          <button className="clear-button" onClick={clearConversation} title="Clear conversation" type="button">
            <Trash2 size={15} />
          </button>
          {onClose && (
            <button className="chat-close-btn" onClick={onClose} aria-label="Close chat" type="button">
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="empty-state">
            <h3>Namaste</h3>
            <p>Ask about heritage, food, hidden gems, or what to see next in Vadodara.</p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div key={message.id} className={`message ${message.role === 'user' ? 'user-message' : 'assistant-message'}`}>
                <div className="message-content">{message.content}</div>
                <div className="message-meta">
                  <span className="message-time">
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {message.status === 'error' && (
                    <button className="retry-button" type="button" onClick={() => retryMessage(message.id)}>
                      <RotateCcw size={12} /> Retry
                    </button>
                  )}
                </div>
              </div>
            ))}
            {status.isTyping && (
              <div className="message assistant-message typing">
                <div className="typing-indicator"><span /><span /><span /></div>
              </div>
            )}
            {status.error && !status.isTyping && <div className="error-message">{status.error}</div>}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <div className="chat-input-area">
        {recognitionError && <div className="voice-error">{recognitionError}</div>}

        <div className="input-container">
          <button
            className={`voice-button ${isRecording ? 'recording' : ''}`}
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            disabled={status.isTyping}
            title={isRecording ? 'Stop recording' : 'Voice input'}
          >
            {isRecording ? <Square size={16} /> : <Mic size={16} />}
          </button>
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                void handleSendMessage()
              }
            }}
            placeholder="Ask AINA…"
            className="chat-input"
            rows={1}
            disabled={status.isTyping}
          />
          <button
            type="button"
            onClick={() => void handleSendMessage()}
            className="send-button"
            disabled={!inputValue.trim() || status.isTyping}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </aside>
  )
}

