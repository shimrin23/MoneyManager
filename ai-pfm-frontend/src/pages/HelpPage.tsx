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

    const icon = (d: string, size = 18) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d={d} />
        </svg>
    );

    return (
        <div className="page-container hp-page">
            <div className="hp-tabs" role="tablist">
                <button
                    role="tab"
                    aria-selected={activeSection === 'faq'}
                    className={`hp-tab ${activeSection === 'faq' ? 'on' : ''}`}
                    onClick={() => setActiveSection('faq')}
                >
                    {t.helpNavFaq}
                </button>
                <button
                    role="tab"
                    aria-selected={activeSection === 'guides'}
                    className={`hp-tab ${activeSection === 'guides' ? 'on' : ''}`}
                    onClick={() => setActiveSection('guides')}
                >
                    {t.helpNavGuides}
                </button>
                <button
                    role="tab"
                    aria-selected={activeSection === 'contact'}
                    className={`hp-tab ${activeSection === 'contact' ? 'on' : ''}`}
                    onClick={() => setActiveSection('contact')}
                >
                    {t.helpNavContact}
                </button>
            </div>

            {activeSection === 'faq' && (
                <div className="hp-section">
                    <div className="hp-search">
                        <span className="hp-search-icon">{icon('M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3')}</span>
                        <input
                            type="text"
                            placeholder={t.helpSearchPlaceholder}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="hp-input hp-search-input"
                            aria-label={t.helpSearchPlaceholder}
                        />
                    </div>

                    <section className="hp-card hp-faq">
                        {filteredFAQs.map((faq) => {
                            const open = expandedFAQ === faq.id;
                            return (
                                <div key={faq.id} className={`hp-faq-item ${open ? 'open' : ''}`}>
                                    <button
                                        className="hp-faq-q"
                                        aria-expanded={open}
                                        onClick={() => setExpandedFAQ(open ? null : faq.id)}
                                    >
                                        <span>{faq.question}</span>
                                        <span className="hp-faq-toggle" aria-hidden="true">{open ? '−' : '+'}</span>
                                    </button>
                                    {open && (
                                        <div className="hp-faq-a">
                                            {faq.answer}
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {filteredFAQs.length === 0 && (
                            <div className="hp-empty">
                                <h3>{t.helpNoResults}</h3>
                                <p>{t.helpNoResultsSub}</p>
                            </div>
                        )}
                    </section>
                </div>
            )}

            {activeSection === 'guides' && (
                <div className="hp-section">
                    <h2 className="hp-section-title">{t.helpGuidesTitle}</h2>
                    <div className="hp-guides">
                        {guides.map((guide, index) => (
                            <article key={index} className="hp-card hp-guide">
                                <span className="hp-icon">{icon(guide.iconPath)}</span>
                                <h3>{guide.title}</h3>
                                <p>{guide.description}</p>
                                <button
                                    className="btn-secondary hp-btn-sm"
                                    aria-expanded={openGuide === index}
                                    onClick={() => setOpenGuide(openGuide === index ? null : index)}
                                >
                                    {t.helpReadGuide}
                                </button>
                                {openGuide === index && (
                                    <div className="hp-guide-steps">
                                        <ul>
                                            {GUIDE_STEPS[index].map(step => (
                                                <li key={step}>{step}</li>
                                            ))}
                                        </ul>
                                        <button type="button" className="btn-primary hp-btn-sm" onClick={() => navigate(guide.link)}>
                                            Open this page
                                        </button>
                                    </div>
                                )}
                            </article>
                        ))}
                    </div>
                </div>
            )}

            {activeSection === 'contact' && (
                <div className="hp-section">
                    <div className="hp-contacts">
                        <div className="hp-card hp-contact">
                            <span className="hp-icon">{icon('M4 4h16v16H4zM22 6l-10 7L2 6')}</span>
                            <h3>{t.helpEmailSupport}</h3>
                            <p className="hp-contact-value">support@moneymanager.com</p>
                            <span className="hp-hint">{t.helpResponse}</span>
                        </div>

                        <div className="hp-card hp-contact">
                            <span className="hp-icon">{icon('M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z')}</span>
                            <h3>{t.helpLiveChat}</h3>
                            <p>{t.helpLiveChatSub}</p>
                            <button className="btn-primary hp-btn-sm" onClick={() => window.dispatchEvent(new Event('open-ai-assistant'))}>
                                {t.helpStartChat}
                            </button>
                        </div>

                        <div className="hp-card hp-contact">
                            <span className="hp-icon">{icon('M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z')}</span>
                            <h3>{t.helpPhoneSupport}</h3>
                            <p className="hp-contact-value">+94 11 123 4567</p>
                            <span className="hp-hint">{t.helpPhoneHours}</span>
                        </div>
                    </div>

                    <section className="hp-card hp-ticket">
                        <h3 className="hp-section-title">{t.helpSubmitTitle}</h3>
                        {ticketStatus && (
                            <div className={`alert ${ticketStatus === 'fail' ? 'alert-error' : 'alert-success'}`}>
                                {ticketStatus === 'fail'
                                    ? (ticketError || t.helpTicketFail)
                                    : `${t.helpTicketOk}${ticketNumber ? ` ${t.helpTicketNumber}: ${ticketNumber}` : ''}`}
                            </div>
                        )}

                        <form onSubmit={handleTicketSubmit} className="hp-form">
                            <div className="hp-field">
                                <label htmlFor="hpCategory">{t.helpCategory}</label>
                                <select
                                    id="hpCategory"
                                    className="hp-input hp-select"
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

                            <div className="hp-field">
                                <label htmlFor="hpPriority">{t.helpPriority}</label>
                                <select
                                    id="hpPriority"
                                    className="hp-input hp-select"
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

                            <div className="hp-field hp-full">
                                <label htmlFor="hpSubject">{t.helpSubject}</label>
                                <input
                                    id="hpSubject"
                                    className="hp-input"
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
                                    <span role="alert" className="hp-error">{fieldErrors.subject}</span>
                                )}
                            </div>

                            <div className="hp-field hp-full">
                                <label htmlFor="hpMessage">{t.helpMessage}</label>
                                <textarea
                                    id="hpMessage"
                                    className="hp-textarea"
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
                                    <span role="alert" className="hp-error">{fieldErrors.message}</span>
                                )}
                                <span className="hp-hint hp-count">{supportTicket.message.length}/5000</span>
                            </div>

                            <div className="hp-form-actions">
                                <button
                                    type="submit"
                                    className="btn-primary"
                                    disabled={ticketSubmitting}
                                >
                                    {ticketSubmitting ? t.helpSubmitting : t.helpSubmit}
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            )}
        </div>
    );
};
