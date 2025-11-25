import { useState } from 'react';
import { apiClient } from '../api/client';

interface AIAssistantProps {
    className?: string;
}

export const AIAssistant = ({ className = '' }: AIAssistantProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [question, setQuestion] = useState('');
    const [research, setResearch] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAskQuestion = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!question.trim()) return;

        setLoading(true);
        try {
            const response = await apiClient.post('/transactions/ai-research', { question });
            setResearch(response.data.research);
        } catch (error) {
            console.error('Error asking AI:', error);
            setResearch('Sorry, I encountered an error while processing your question. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const clearResponse = () => {
        setResearch('');
    };

    const closeModal = () => {
        setIsOpen(false);
        setQuestion('');
        setResearch('');
    };

    const sampleQuestions = [
        "How can I improve my credit score?",
        "What's the best debt repayment strategy?",
        "How much should I save for an emergency fund?",
        "What are the benefits of diversifying investments?",
        "How can I reduce my monthly expenses?"
    ];

    return (
        <>
            {/* AI Assistant Floating Button */}
            <button 
                className={`ai-assistant-trigger ${className}`}
                onClick={() => setIsOpen(!isOpen)}
                title="Ask AI Financial Assistant"
            >
                🤖 Ask AI
            </button>

            {/* AI Chat Modal */}
            {isOpen && (
                <div className="ai-modal-overlay" onClick={() => setIsOpen(false)}>
                    <div className="ai-modal-content" onClick={e => e.stopPropagation()}>
                        <div className="ai-modal-header">
                            <h3>🤖 AI Financial Research Assistant</h3>
                            <div className="ai-modal-actions">
                                {research && (
                                    <button 
                                        className="btn-secondary btn-sm" 
                                        onClick={clearResponse}
                                        title="Clear response and ask new question"
                                    >
                                        🔄 New
                                    </button>
                                )}
                                <button 
                                    className="modal-close" 
                                    onClick={closeModal}
                                    aria-label="Close AI Assistant"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        <div className="ai-modal-body">
                            {!research ? (
                                <div className="ai-welcome">
                                    <p className="ai-intro">
                                        💡 Ask me anything about personal finance, investing, budgeting, or financial planning!
                                    </p>
                                    <div className="sample-questions">
                                        <p className="sample-title">Sample questions:</p>
                                        {sampleQuestions.map((sample, index) => (
                                            <button
                                                key={index}
                                                className="sample-question"
                                                onClick={() => setQuestion(sample)}
                                            >
                                                {sample}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="ai-response">
                                    <div className="ai-response-header">
                                        <h4>🤖 AI Response</h4>
                                        <button 
                                            className="response-close-btn"
                                            onClick={clearResponse}
                                            title="Close response and ask new question"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                    <div className="user-question">
                                        <strong>You asked:</strong> "{question}"
                                    </div>
                                    <div className="ai-answer">
                                        <strong>📊 Coach Analysis:</strong>
                                        <div className="ai-content">
                                            {research.split('\\n').map((line, index) => (
                                                <p key={index}>{line}</p>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="ai-modal-footer">
                            <form onSubmit={handleAskQuestion} className="ai-question-form">
                                <div className="question-input-group">
                                    <input
                                        type="text"
                                        value={question}
                                        onChange={(e) => setQuestion(e.target.value)}
                                        placeholder="Ask me about financial strategies, investment advice, budgeting tips..."
                                        disabled={loading}
                                        className="ai-question-input"
                                    />
                                    <button 
                                        type="submit" 
                                        disabled={loading || !question.trim()}
                                        className="ai-ask-button"
                                    >
                                        {loading ? '🔄' : '📤'} {loading ? 'Researching...' : 'Ask'}
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