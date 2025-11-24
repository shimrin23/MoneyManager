import { Link } from 'react-router-dom';

export const FinancialNavigation = () => {
    const navItems = [
        {
            path: '/financial-health',
            icon: '💚',
            title: 'Financial Health',
            description: 'AI-powered financial analysis and scoring'
        },
        {
            path: '/goals',
            icon: '🎯',
            title: 'Financial Goals',
            description: 'Track and achieve your financial objectives'
        },
        {
            path: '/loans',
            icon: '💳',
            title: 'Loans & Debt',
            description: 'Manage debts and payoff strategies'
        },
        {
            path: '/credit-cards',
            icon: '💎',
            title: 'Credit Cards',
            description: 'Track spending and manage payments'
        }
    ];

    return (
        <div className="card financial-navigation">
            <h3>📊 Financial Management</h3>
            <div className="nav-grid">
                {navItems.map((item) => (
                    <Link 
                        key={item.path} 
                        to={item.path} 
                        className="nav-card"
                    >
                        <div className="nav-icon">{item.icon}</div>
                        <div className="nav-content">
                            <h4>{item.title}</h4>
                            <p>{item.description}</p>
                        </div>
                        <div className="nav-arrow">→</div>
                    </Link>
                ))}
            </div>
        </div>
    );
};