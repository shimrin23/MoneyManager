// Password rules shared by sign-up, reset password and change password.
// Must match the server rule in auth.controller.ts (AUT-002).

export const passwordRules = (password: string) => [
    { label: 'At least 8 characters', ok: password.length >= 8 },
    { label: 'Contains a letter', ok: /[A-Za-z]/.test(password) },
    { label: 'Contains a number', ok: /\d/.test(password) },
];

export const isPasswordValid = (password: string): boolean =>
    passwordRules(password).every(rule => rule.ok);

interface PasswordRulesProps {
    password: string;
}

// Rule list with a green tick when each rule is met, and an error under it when not all are met.
export const PasswordRules = ({ password }: PasswordRulesProps) => (
    <>
        <ul style={{ listStyle: 'none', padding: 0, margin: '0.6rem 0 0', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            {passwordRules(password).map(rule => (
                <li key={rule.label} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8rem', color: rule.ok ? '#059669' : '#6b7280' }}>
                    <span aria-hidden="true" style={{ display: 'inline-flex', width: '16px', height: '16px', borderRadius: '50%', alignItems: 'center', justifyContent: 'center', border: rule.ok ? 'none' : '1px solid #9ca3af', background: rule.ok ? '#10b981' : 'transparent', color: '#fff', fontSize: '0.7rem' }}>
                        {rule.ok ? '✓' : ''}
                    </span>
                    {rule.label}
                </li>
            ))}
        </ul>
        {password.length > 0 && !isPasswordValid(password) && (
            <p role="alert" style={{ color: '#ef4444', fontSize: '0.8rem', margin: '0.5rem 0 0' }}>
                Password does not meet all the requirements above.
            </p>
        )}
    </>
);
