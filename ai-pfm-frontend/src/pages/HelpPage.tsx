// Help & Support Page
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client.ts';
import { useAdminLang } from '../i18n/adminText';
import { USER_T } from '../i18n/userPagesText';

interface SupportTicket {
    subject: string;
    message: string;
    category: string;
    priority: 'low' | 'medium' | 'high';
}

// Category keys stay in English because they are sent to the server.
const FAQ_CATEGORIES = ['account', 'features', 'security', 'features', 'account', 'features', 'account', 'troubleshooting'];

// Each guide opens the page it describes
const GUIDE_LINKS = ['/dashboard', '/smart-budgets', '/financial-health', '/recommendations', '/account-settings', '/account-settings'];

// SVG paths for the six guide cards (drawn in the same style as the rest of the app icons)
const GUIDE_ICON_PATHS = [
    'M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
    'M3 6h18v14H3zM3 10h18M16 15h2',
    'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z',
    'M12 2l2.4 7.4H22l-6.2 4.5L18.2 22 12 17.3 5.8 22l2.4-8.1L2 9.4h7.6z',
    'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
    'M12 3v12m0 0l-4-4m4 4l4-4M4 17v3h16v-3'
];

// Steps shown when a guide is opened (English; translations pending)
const GUIDE_STEPS = [
    [
        'Your dashboard shows your income, expenses and balance at a glance.',
        'Use the cards at the top to see this month\'s totals.',
        'Add a transaction with the + button in the header.'
    ],
    [
        'Create a budget for a category such as Food & Dining.',
        'Set an alert percentage, for example 90%, to get a warning before you reach the limit.',
        'You get a notification when a budget is reached or passed.'
    ],
    [
        'The health score combines your savings, debt and spending habits.',
        'Open Financial Health to see which factors drive the score.',
        'Work on the lowest factor first.'
    ],
    [
        'Recommendations are suggestions based on your spending.',
        'Review each one, then act on it or dismiss it.'
    ],
    [
        'Keep your account safe with a strong password of at least 8 characters, with letters and numbers.',
        'Account Settings lets you change your password and notification choices.',
        'Never share your password or verification links.'
    ],
    [
        'Export your data from Account Settings or Settings > Advanced.',
        'The file is a PDF with your profile, settings, transactions, budgets and goals.'
    ]
];

export const HelpPage = () => {
    const t = USER_T[useAdminLang()];
    const navigate = useNavigate();
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
    const [ticketStatus, setTicketStatus] = useState<'ok' | 'fail' | ''>('');
    const [ticketNumber, setTicketNumber] = useState('');
    const [ticketError, setTicketError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({ subject: '', message: '' });
    const [openGuide, setOpenGuide] = useState<number | null>(null);

    const faqs = t.faqQ.map((question, i) => ({
        id: i + 1,
        question,
        answer: t.faqA[i],
        category: FAQ_CATEGORIES[i],
    }));

    const guides = t.guideTitle.map((title, i) => ({
        title,
        description: t.guideDesc[i],
        iconPath: GUIDE_ICON_PATHS[i],
        link: GUIDE_LINKS[i],
    }));

    const filteredFAQs = faqs.filter(faq =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleTicketSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setTicketStatus('');
        setTicketNumber('');

        const subject = supportTicket.subject.trim();
        const message = supportTicket.message.trim();
        const errors = {
            subject: subject ? '' : t.helpErrSubject,
            message: message ? '' : t.helpErrMessage
        };
        setFieldErrors(errors);
        if (errors.subject || errors.message) return;

        setTicketSubmitting(true);
        try {
            const response = await apiClient.post('/support/tickets', { ...supportTicket, subject, message });
            setTicketNumber(response.data.ticket?.ticketNumber || '');
            setTicketStatus('ok');
            setFieldErrors({ subject: '', message: '' });
            setSupportTicket({
                subject: '',
                message: '',
                category: 'general',
                priority: 'medium'
            });
        } catch (err: any) {
            setTicketError(err.response?.data?.error || t.helpTicketFail);
            setTicketStatus('fail');
        } finally {
            setTicketSubmitting(false);
        }
    };

    return (
        <div className="help-page">
            <div className="help-header">
                <h1>{t.hdrHelp}</h1>
                <p>{t.hdrHelpSub}</p>
            </div>

            <div className="help-navigation">
                <button
                    className={`nav-btn ${activeSection === 'faq' ? 'active' : ''}`}
                    onClick={() => setActiveSection('faq')}
                >
                    ❓ {t.helpNavFaq}
                </button>
                <button
                    className={`nav-btn ${activeSection === 'guides' ? 'active' : ''}`}
                    onClick={() => setActiveSection('guides')}
                >
                    📚 {t.helpNavGuides}
                </button>
                <button
                    className={`nav-btn ${activeSection === 'contact' ? 'active' : ''}`}
                    onClick={() => setActiveSection('contact')}
                >
                    📞 {t.helpNavContact}
                </button>
            </div>

            <div className="help-content">
                {activeSection === 'faq' && (
                    <div className="faq-section">
                        <div className="faq-search">
                            <input
                                type="text"
                                placeholder={t.helpSearchPlaceholder}
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
                                <h3>{t.helpNoResults}</h3>
                                <p>{t.helpNoResultsSub}</p>
                            </div>
                        )}
                    </div>
                )}

                {activeSection === 'guides' && (
                    <div className="guides-section">
                        <h2>{t.helpGuidesTitle}</h2>
                        <div className="guides-grid">
                            {guides.map((guide, index) => (
                                <div key={index} className="guide-card">
                                    <div className="guide-icon">
                                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                            <path d={guide.iconPath} />
                                        </svg>
                                    </div>
                                    <h3>{guide.title}</h3>
                                    <p>{guide.description}</p>
                                    <button
                                        className="guide-btn"
                                        aria-expanded={openGuide === index}
                                        onClick={() => setOpenGuide(openGuide === index ? null : index)}
                                    >
                                        {t.helpReadGuide}
                                    </button>
                                    {openGuide === index && (
                                        <div style={{ marginTop: '0.75rem', textAlign: 'left' }}>
                                            <ul style={{ paddingLeft: '1.25rem', margin: '0 0 0.75rem' }}>
                                                {GUIDE_STEPS[index].map(step => (
                                                    <li key={step} style={{ marginBottom: '0.4rem' }}>{step}</li>
                                                ))}
                                            </ul>
                                            <button type="button" className="btn-secondary" onClick={() => navigate(guide.link)}>
                                                Open this page
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeSection === 'contact' && (
                    <div className="contact-section">
                        <div className="contact-options">
                            <div className="contact-method">
                                <h3>📧 {t.helpEmailSupport}</h3>
                                <p>support@moneymanager.com</p>
                                <span className="response-time">{t.helpResponse}</span>
                            </div>

                            <div className="contact-method">
                                <h3>💬 {t.helpLiveChat}</h3>
                                <p>{t.helpLiveChatSub}</p>
                                <button className="btn-primary" onClick={() => window.dispatchEvent(new Event('open-ai-assistant'))}>
                                    {t.helpStartChat}
                                </button>
                            </div>

                            <div className="contact-method">
                                <h3>📞 {t.helpPhoneSupport}</h3>
                                <p>+94 11 123 4567</p>
                                <span className="response-time">{t.helpPhoneHours}</span>
                            </div>
                        </div>

                        <div className="support-ticket-form">
                            <h3>{t.helpSubmitTitle}</h3>
                            {ticketStatus && (
                                <div className={`alert ${ticketStatus === 'fail' ? 'alert-error' : 'alert-success'}`}>
                                    {ticketStatus === 'fail'
                                        ? (ticketError || t.helpTicketFail)
                                        : `${t.helpTicketOk}${ticketNumber ? ` ${t.helpTicketNumber}: ${ticketNumber}` : ''}`}
                                </div>
                            )}

                            <form onSubmit={handleTicketSubmit}>
                                <div className="form-group">
                                    <label>{t.helpCategory}</label>
                                    <select
                                        value={supportTicket.category}
                                        onChange={(e) => setSupportTicket(prev => ({
                                            ...prev,
                                            category: e.target.value
                                        }))}
                                    >
                                        <option value="general">{t.helpCatGeneral}</option>
                                        <option value="technical">{t.helpCatTechnical}</option>
                                        <option value="billing">{t.helpCatBilling}</option>
                                        <option value="feature">{t.helpCatFeature}</option>
                                        <option value="security">{t.helpCatSecurity}</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>{t.helpPriority}</label>
                                    <select
                                        value={supportTicket.priority}
                                        onChange={(e) => setSupportTicket(prev => ({
                                            ...prev,
                                            priority: e.target.value as 'low' | 'medium' | 'high'
                                        }))}
                                    >
                                        <option value="low">{t.helpPriLow}</option>
                                        <option value="medium">{t.helpPriMedium}</option>
                                        <option value="high">{t.helpPriHigh}</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>{t.helpSubject}</label>
                                    <input
                                        type="text"
                                        value={supportTicket.subject}
                                        onChange={(e) => setSupportTicket(prev => ({
                                            ...prev,
                                            subject: e.target.value
                                        }))}
                                        maxLength={200}
                                        placeholder={t.helpPlaceSubject}
                                    />
                                    {fieldErrors.subject && (
                                        <span role="alert" style={{ color: '#dc2626', fontSize: '0.85rem' }}>{fieldErrors.subject}</span>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label>{t.helpMessage}</label>
                                    <textarea
                                        value={supportTicket.message}
                                        onChange={(e) => setSupportTicket(prev => ({
                                            ...prev,
                                            message: e.target.value
                                        }))}
                                        rows={6}
                                        maxLength={5000}
                                        placeholder={t.helpPlaceMessage}
                                    />
                                    {fieldErrors.message && (
                                        <span role="alert" style={{ color: '#dc2626', fontSize: '0.85rem' }}>{fieldErrors.message}</span>
                                    )}
                                    <span className="response-time">{supportTicket.message.length}/5000</span>
                                </div>

                                <button
                                    type="submit"
                                    className="btn-primary"
                                    disabled={ticketSubmitting}
                                >
                                    {ticketSubmitting ? t.helpSubmitting : t.helpSubmit}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
