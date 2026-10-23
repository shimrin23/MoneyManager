// Help & Support Page
import { useState } from 'react';
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

const GUIDE_LINKS = ['#getting-started', '#budgets', '#health-score', '#ai-recommendations', '#security', '#data-export'];
const GUIDE_ICONS = ['', '', '', '', '', '📥'];

export const HelpPage = () => {
    const t = USER_T[useAdminLang()];
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

    const faqs = t.faqQ.map((question, i) => ({
        id: i + 1,
        question,
        answer: t.faqA[i],
        category: FAQ_CATEGORIES[i],
    }));

    const guides = t.guideTitle.map((title, i) => ({
        title,
        description: t.guideDesc[i],
        icon: GUIDE_ICONS[i],
        link: GUIDE_LINKS[i],
    }));

    const filteredFAQs = faqs.filter(faq =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleTicketSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setTicketSubmitting(true);
        setTicketStatus('');

        try {
            await apiClient.post('/support/tickets', supportTicket);
            setTicketStatus('ok');
            setSupportTicket({
                subject: '',
                message: '',
                category: 'general',
                priority: 'medium'
            });
        } catch {
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
                                    <div className="guide-icon">{guide.icon}</div>
                                    <h3>{guide.title}</h3>
                                    <p>{guide.description}</p>
                                    <button className="guide-btn">
                                        {t.helpReadGuide}
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="help-resources">
                            <h3>{t.helpResources}</h3>
                            <div className="resource-links">
                                <a href="#" className="resource-link">
                                    📄 {t.helpTerms}
                                </a>
                                <a href="#" className="resource-link">
                                    🔒 {t.helpPrivacy}
                                </a>
                                <a href="#" className="resource-link">
                                    🔗 {t.helpApi}
                                </a>
                                <a href="#" className="resource-link">
                                    📱 {t.helpMobile}
                                </a>
                            </div>
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
                                <button className="btn-primary">{t.helpStartChat}</button>
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
                                    {ticketStatus === 'fail' ? t.helpTicketFail : t.helpTicketOk}
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
                                        required
                                        placeholder={t.helpPlaceSubject}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>{t.helpMessage}</label>
                                    <textarea
                                        value={supportTicket.message}
                                        onChange={(e) => setSupportTicket(prev => ({
                                            ...prev,
                                            message: e.target.value
                                        }))}
                                        required
                                        rows={6}
                                        placeholder={t.helpPlaceMessage}
                                    />
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
