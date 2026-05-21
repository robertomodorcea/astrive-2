import { useState, useRef, useEffect } from 'react';
import { useBuilder } from './BuilderContext';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send, Sparkles, Bot, User, Loader2 } from 'lucide-react';

export function AIChatPanel() {
  const { state, sendChatMessage } = useBuilder();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [state.chatMessages]);

  useEffect(() => {
    const lastMessage = state.chatMessages[state.chatMessages.length - 1];
    if (lastMessage?.role === 'user') {
      setIsTyping(true);
      const timer = setTimeout(() => setIsTyping(false), 800);
      return () => clearTimeout(timer);
    }
  }, [state.chatMessages]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendChatMessage(input.trim());
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <aside className="ai-chat-panel">
      <div className="ai-chat-header">
        <div className="ai-chat-header-left">
          <div className="ai-chat-header-icon">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="ai-chat-header-title">AI Assistant</h3>
            <p className="ai-chat-header-subtitle">Describe what you want to build</p>
          </div>
        </div>
      </div>

      <div className="ai-chat-messages" ref={scrollRef}>
        {state.chatMessages.map((message) => (
          <div key={message.id} className={`ai-chat-message ${message.role}`}>
            <div className="ai-chat-message-avatar">
              {message.role === 'assistant' ? (
                <Bot className="h-4 w-4" />
              ) : (
                <User className="h-4 w-4" />
              )}
            </div>
            <div className="ai-chat-message-content">
              <div className="ai-chat-message-role">
                {message.role === 'assistant' ? 'AI Assistant' : 'You'}
              </div>
              <div className="ai-chat-message-text">{message.content}</div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="ai-chat-message assistant">
            <div className="ai-chat-message-avatar">
              <Bot className="h-4 w-4" />
            </div>
            <div className="ai-chat-message-content">
              <div className="ai-chat-typing">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="ai-chat-input-area">
        <div className="ai-chat-input-wrapper">
          <Textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe what you want to build..."
            className="ai-chat-input"
            rows={1}
          />
          <Button
            size="sm"
            className="ai-chat-send"
            onClick={handleSend}
            disabled={!input.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
