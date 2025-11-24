// Help & Support Page
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client.ts';

interface FAQ {
    id: number;
    question: string;
    answer: string;
    category: string;
}

interface SupportTicket {
    subject: string;
    message: string;
    category: string;
    priority: 'low' | 'medium' | 'high';
}

export const HelpPage = () => {
    const [activeSection, setActiveSection] = useState<'faq' | 'contact' | 'guides'>('faq');
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
    const [supportTicket, setSupportTicket] = useState<SupportTicket>({
        subject: '',
        message: '',
        category: 'general',
        priority: 'medium'
    });
    const [ticketSubmitting, setTicketSubmitting] = useState(false);
    const [ticketMessage, setTicketMessage] = useState('');
    const navigate = useNavigate();

    const faqs: FAQ[] = [
        {
            id: 1,
            question: "How do I add my bank account?",
            answer: "You can add transactions manually using the 'Add Transaction' form on your dashboard. For automatic bank integration, contact our support team.",
            category: "account"
        },
        {
            id: 2,
            question: "How is my Financial Health Score calculated?",
            answer: "Your score is based on 5 factors: liquidity ratio (25%), savings habits (20%), debt management (25%), fee frequency (15%), and income stability (15%). The score updates automatically as you add new transactions.",
            category: "features"
        },
        {
            id: 3,
            question: "Is my financial data secure?",
            answer: "Yes! We use bank-level encryption (AES-256) for all data. Your information is never shared with third parties and is stored securely on our servers.",
            category: "security"
        },
        {
            id: 4,
            question: "How do I set up budget alerts?",
            answer: "Go to your Dashboard and look for budget recommendations from our AI coach. You can accept these to automatically create budget alerts, or manually set them in Account Settings.",
            category: "features"
        },
        {
            id: 5,
            question: "Can I export my data?",
            answer: "Yes! Go to Account Settings > Data & Privacy > Export My Data to download all your financial information in JSON format.",
            category: "account"
        },
        {
            id: 6,
            question: "What types of recommendations does the AI provide?",
            answer: "Our AI analyzes your spending patterns to suggest budget optimizations, debt consolidation opportunities, subscription cleanups, savings goals, and investment recommendations.",
            category: "features"
        },
        {
            id: 7,
            question: "How do I cancel my account?",
            answer: "Go to Account Settings > Danger Zone > Delete Account. Note that this action is permanent and cannot be undone.",
            category: "account"
        },
        {
            id: 8,
            question: "Why aren't my transactions showing up?",
            answer: "Make sure you're logged in and adding transactions with the correct date format. If you're still having issues, try refreshing the page or contact support.",
            category: "troubleshooting"
        }
    ];

    const guides = [
        {
            title: "Getting Started Guide",
            description: "Learn the basics of MoneyManager",
            icon: "🚀",
            link: "#getting-started"
        },
        {
            title: "Setting Up Budgets",
            description: "Create and manage your budgets effectively",
            icon: "💰",
            link: "#budgets"
        },
        {
            title: "Understanding Your Health Score",
            description: "How to improve your financial health",
            icon: "📊",
            link: "#health-score"
        },
        {
            title: "AI Recommendations",
            description: "Making the most of AI-powered insights",
            icon: "🤖",
            link: "#ai-recommendations"
        },
        {
            title: "Security & Privacy",
            description: "Keeping your data safe and secure",
            icon: "🔐",
            link: "#security"
        },
        {
            title: "Data Export & Backup",
            description: "Exporting and backing up your data",
            icon: "📥",
            link: "#data-export"
        }
    ];

    const filteredFAQs = faqs.filter(faq =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleTicketSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setTicketSubmitting(true);
        setTicketMessage('');

        try {
            await apiClient.post('/support/tickets', supportTicket);
            setTicketMessage('Support ticket submitted successfully! We\'ll get back to you within 24 hours.');
            setSupportTicket({
                subject: '',
                message: '',
                category: 'general',
                priority: 'medium'
            });
        } catch (err) {
            setTicketMessage('Failed to submit ticket. Please try again or email support@moneymanager.com');
        } finally {
            setTicketSubmitting(false);
        }
    };

    return (
        <div className="help-page">
            <div className="help-header">
                <button className="back-button" onClick={() => navigate('/dashboard')}>
                    ← Back to Dashboard
                </button>
                <h1>Help & Support</h1>
                <p>Find answers to your questions or get in touch with our support team</p>
            </div>

            <div className="help-navigation">
                <button
                    className={`nav-btn ${activeSection === 'faq' ? 'active' : ''}`}
                    onClick={() => setActiveSection('faq')}
                >
                    ❓ FAQ
                </button>
                <button
                    className={`nav-btn ${activeSection === 'guides' ? 'active' : ''}`}
                    onClick={() => setActiveSection('guides')}
                >
                    📚 Guides
                </button>
                <button
                    className={`nav-btn ${activeSection === 'contact' ? 'active' : ''}`}
                    onClick={() => setActiveSection('contact')}
                >
                    📞 Contact Support
                </button>
            </div>

            <div className="help-content">
                {activeSection === 'faq' && (
                    <div className="faq-section">
                        <div className="faq-search">
                            <input
                                type="text"
                                placeholder="Search frequently asked questions..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="search-input"
                            />
                        </div>

                        <div className="faq-list">
                            {filteredFAQs.map((faq) => (
                                <div key={faq.id} className="faq-item">
                                    <button
                                        className={`faq-question ${expandedFAQ === faq.id ? 'expanded' : ''}`}
                                        onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                                    >
                                        <span>{faq.question}</span>
                                        <span className="faq-arrow">
                                            {expandedFAQ === faq.id ? '−' : '+'}
                                        </span>
                                    </button>
                                    {expandedFAQ === faq.id && (
                                        <div className="faq-answer">
                                            {faq.answer}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {filteredFAQs.length === 0 && (
                            <div className="no-results">
                                <h3>No results found</h3>
                                <p>Try different keywords or contact our support team</p>
                            </div>
                        )}
                    </div>
                )}

                {activeSection === 'guides' && (
                    <div className="guides-section">
                        <h2>User Guides & Tutorials</h2>
                        <div className="guides-grid">
                            {guides.map((guide, index) => (
                                <div key={index} className="guide-card">
                                    <div className="guide-icon">{guide.icon}</div>
                                    <h3>{guide.title}</h3>
                                    <p>{guide.description}</p>
                                    <button className="guide-btn">
                                        Read Guide →
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="help-resources">
                            <h3>Additional Resources</h3>
                            <div className="resource-links">
                                <a href="#" className="resource-link">
                                    📄 Terms of Service
                                </a>
                                <a href="#" className="resource-link">
                                    🔒 Privacy Policy
                                </a>
                                <a href="#" className="resource-link">
                                    🔗 API Documentation
                                </a>
                                <a href="#" className="resource-link">
                                    📱 Mobile App Guide
                                </a>
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === 'contact' && (
                    <div className="contact-section">
                        <div className="contact-options">
                            <div className="contact-method">
                                <h3>📧 Email Support</h3>
                                <p>support@moneymanager.com</p>
                                <span className="response-time">Response time: 4-6 hours</span>
                            </div>

                            <div className="contact-method">
                                <h3>💬 Live Chat</h3>
                                <p>Available 24/7 for urgent issues</p>
                                <button className="btn-primary">Start Chat</button>
                            </div>

                            <div className="contact-method">
                                <h3>📞 Phone Support</h3>
                                <p>+94 11 123 4567</p>
                                <span className="response-time">Mon-Fri: 9AM-6PM</span>
                            </div>
                        </div>

                        <div className="support-ticket-form">
                            <h3>Submit a Support Ticket</h3>
                            {ticketMessage && (
                                <div className={`alert ${ticketMessage.includes('Failed') ? 'alert-error' : 'alert-success'}`}>
                                    {ticketMessage}
                                </div>
                            )}

                            <form onSubmit={handleTicketSubmit}>
                                <div className="form-group">
                                    <label>Category</label>
                                    <select
                                        value={supportTicket.category}
                                        onChange={(e) => setSupportTicket(prev => ({
                                            ...prev,
                                            category: e.target.value
                                        }))}
                                    >
                                        <option value="general">General Question</option>
                                        <option value="technical">Technical Issue</option>
                                        <option value="billing">Billing</option>
                                        <option value="feature">Feature Request</option>
                                        <option value="security">Security Concern</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Priority</label>
                                    <select
                                        value={supportTicket.priority}
                                        onChange={(e) => setSupportTicket(prev => ({
                                            ...prev,
                                            priority: e.target.value as 'low' | 'medium' | 'high'
                                        }))}
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Subject</label>
                                    <input
                                        type="text"
                                        value={supportTicket.subject}
                                        onChange={(e) => setSupportTicket(prev => ({
                                            ...prev,
                                            subject: e.target.value
                                        }))}
                                        required
                                        placeholder="Brief description of your issue"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Message</label>
                                    <textarea
                                        value={supportTicket.message}
                                        onChange={(e) => setSupportTicket(prev => ({
                                            ...prev,
                                            message: e.target.value
                                        }))}
                                        required
                                        rows={6}
                                        placeholder="Please provide detailed information about your issue or question"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="btn-primary"
                                    disabled={ticketSubmitting}
                                >
                                    {ticketSubmitting ? 'Submitting...' : 'Submit Ticket'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};