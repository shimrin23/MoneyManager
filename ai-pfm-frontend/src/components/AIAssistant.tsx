import { useState, useRef, useEffect } from 'react';
import { apiClient } from '../api/client';
import { IconBrain, IconUser, IconLogOut, IconRefreshCw } from './Icons';

interface Message {
    id: string;
    type: 'user' | 'ai';
    content: string;
    timestamp: Date;
}

interface AIAssistantProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export const AIAssistant = ({ open = false, onOpenChange }: AIAssistantProps) => {
    const [isOpen, setIsOpen] = useState(open);
    const [question, setQuestion] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [sessionId] = useState(() => `session-${Date.now()}`);
    const [userId] = useState(() => localStorage.getItem('userId') || `user-${Date.now()}`);

    useEffect(() => {
        setIsOpen(open);
    }, [open]);

    const handleOpenChange = (newOpen: boolean) => {
        setIsOpen(newOpen);
        onOpenChange?.(newOpen);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleAskQuestion = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!question.trim() || loading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            type: 'user',
            content: question,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setQuestion('');
        setLoading(true);

        try {
            const response = await apiClient.post('/coach/chat', { 
                userId,
                sessionId,
                message: question,
                includeFinancialContext: false
            });
            
            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                type: 'ai',
                content: response.data.data.message.content,
                timestamp: new Date()
            };
            
            setMessages(prev => [...prev, aiMessage]);
        } catch (error: any) {
            console.error('Error asking AI:', error);
            
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                type: 'ai',
                content: error?.response?.data?.error || 'Sorry, I encountered an error while processing your question. Please try again.',
                timestamp: new Date()
            };
            
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const clearChat = () => {
        setMessages([]);
    };

    const closeModal = () => {
        handleOpenChange(false);
    };

    const sampleQuestions = [
        "How can I improve my credit score?",
        "What's the best debt repayment strategy?",
        "How much should I save for an emergency fund?",
        "What are the benefits of diversifying investments?"
    ];

    const handleSampleQuestion = (sample: string) => {
        setQuestion(sample);
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
        });
    };

    return (
        <>
            {isOpen && (
                <div className="ai-modal-overlay fade-in" onClick={() => handleOpenChange(false)}>
                    <div className="ai-modal-content drop-in" onClick={e => e.stopPropagation()}>
                        <div className="ai-modal-header">
                            <div className="ai-header-info">
                                <div className="ai-avatar">
                                    <IconBrain size={20} />
                                </div>
                                <div className="ai-header-text">
                                    <h3>AI Financial Coach</h3>
                                    <span className="ai-status">
                                        <span className="status-dot"></span>
                                        Online
                                    </span>
                                </div>
                            </div>
                            <div className="ai-modal-actions">
                                {messages.length > 0 && (
                                    <button 
                                        className="modal-close" 
                                        onClick={clearChat}
                                        title="Clear conversation"
                                    >
                                        <IconRefreshCw size={16} />
                                    </button>
                                )}
                                <button 
                                    className="modal-close" 
                                    onClick={closeModal}
                                    aria-label="Close AI Assistant"
                                    title="Close"
                                >
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                </button>
                            </div>
                        </div>

                        <div className="ai-chat-container">
                            {messages.length === 0 ? (
                                <div className="ai-welcome">
                                    <div className="ai-welcome-icon">
                                        <IconBrain size={48} />
                                    </div>
                                    <h4 className="welcome-title">Your Personal Financial Guide</h4>
                                    <p className="ai-intro">
                                        Ask me anything about budgeting, saving, or investment strategies. I'm here to help you make smarter financial decisions.
                                    </p>
                                    <div className="ai-sample-grid">
                                        {sampleQuestions.map((sample, index) => (
                                            <button
                                                key={index}
                                                className="ai-sample-card"
                                                onClick={() => handleSampleQuestion(sample)}
                                            >
                                                {sample}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="ai-messages">
                                    {messages.map((message) => (
                                        <div 
                                            key={message.id} 
                                            className={`message-wrapper ${message.type}-message`}
                                        >
                                            <div className="message-bubble">
                                                {message.type === 'ai' && (
                                                    <div className="message-avatar ai-bg">
                                                        <IconBrain size={16} />
                                                    </div>
                                                )}
                                                <div className="message-content">
                                                    <div className="message-text">
                                                        {message.content.split('\n').map((line, index) => (
                                                            <p key={index}>{line}</p>
                                                        ))}
                                                    </div>
                                                    <div className="message-time">
                                                        {formatTime(message.timestamp)}
                                                    </div>
                                                </div>
                                                {message.type === 'user' && (
                                                    <div className="message-avatar user-bg">
                                                        <IconUser size={16} />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {loading && (
                                        <div className="message-wrapper ai-message">
                                            <div className="message-bubble">
                                                <div className="message-avatar ai-bg">
                                                    <IconBrain size={16} />
                                                </div>
                                                <div className="message-content">
                                                    <div className="typing-indicator">
                                                        <span></span>
                                                        <span></span>
                                                        <span></span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>
                            )}
                        </div>

                        <div className="ai-modal-footer">
                            <form onSubmit={handleAskQuestion} className="ai-question-form">
                                <div className="ai-input-wrapper">
                                    <input
                                        type="text"
                                        value={question}
                                        onChange={(e) => setQuestion(e.target.value)}
                                        placeholder="Ask me anything..."
                                        disabled={loading}
                                        className="ai-question-input"
                                        autoFocus
                                    />
                                    <button 
                                        type="submit" 
                                        disabled={loading || !question.trim()}
                                        className="ai-ask-button"
                                        title="Send message"
                                    >
                                        {loading ? (
                                            <div className="ai-spinner"></div>
                                        ) : (
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};