import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { closeDialog, getSnapshot, notify, subscribe, type DialogRequest, type MessageType } from '../utils/systemMessages';
import { IconAlertTriangle, IconCheckCircle, IconInfo, IconXCircle } from './Icons';
import '../styles/SystemMessages.css';

const TOAST_ICONS: Record<MessageType, typeof IconInfo> = {
    success: IconCheckCircle,
    error: IconXCircle,
    warning: IconAlertTriangle,
    info: IconInfo,
};

const SystemDialog = ({ dialog }: { dialog: DialogRequest }) => {
    const [value, setValue] = useState(dialog.kind === 'prompt' ? dialog.defaultValue ?? '' : '');
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const confirmRef = useRef<HTMLButtonElement>(null);

    const cancel = () => {
        if (dialog.kind === 'prompt') dialog.resolve(null);
        else dialog.resolve(false);
        closeDialog();
    };

    const submit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (dialog.kind === 'prompt') {
            const problem = dialog.validate?.(value) ?? null;
            if (problem) {
                setError(problem);
                inputRef.current?.focus();
                return;
            }
            dialog.resolve(value);
        } else {
            dialog.resolve(true);
        }
        closeDialog();
    };

    useEffect(() => {
        (dialog.kind === 'prompt' ? inputRef.current : confirmRef.current)?.focus();
        const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') cancel(); };
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="modal-overlay sm-dialog-overlay" onClick={cancel}>
            <div
                className="modal-content sm-dialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby={`sm-dialog-title-${dialog.id}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-header">
                    <h2 className="modal-title" id={`sm-dialog-title-${dialog.id}`}>{dialog.title}</h2>
                    <button type="button" className="modal-close" onClick={cancel} aria-label="Close">×</button>
                </div>

                <form onSubmit={submit}>
                    {dialog.message && <p className="sm-dialog-message">{dialog.message}</p>}

                    {dialog.kind === 'prompt' && (
                        <div className="form-group sm-dialog-field">
                            {dialog.label && <label htmlFor={`sm-dialog-input-${dialog.id}`}>{dialog.label}</label>}
                            <input
                                id={`sm-dialog-input-${dialog.id}`}
                                ref={inputRef}
                                type={dialog.inputType ?? 'text'}
                                step={dialog.inputType === 'number' ? 'any' : undefined}
                                inputMode={dialog.inputType === 'number' ? 'decimal' : undefined}
                                placeholder={dialog.placeholder}
                                value={value}
                                aria-invalid={!!error}
                                onChange={(e) => { setValue(e.target.value); setError(null); }}
                            />
                            {error && <p className="sm-dialog-error" role="alert">{error}</p>}
                        </div>
                    )}

                    <div className="sm-dialog-actions">
                        <button type="button" className="btn-secondary" onClick={cancel}>
                            {dialog.cancelText ?? 'Cancel'}
                        </button>
                        <button
                            type="submit"
                            ref={confirmRef}
                            className={`btn-primary ${dialog.danger ? 'sm-btn-danger' : ''}`}
                        >
                            {dialog.confirmText ?? 'OK'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Mounted once in App: shows toasts (success / error / warning / info) and confirm / prompt dialogs
export const SystemMessages = () => {
    const { toasts, dialog } = useSyncExternalStore(subscribe, getSnapshot);

    return (
        <>
            <div className="sm-toasts" aria-live="polite">
                {toasts.map((toast) => {
                    const Icon = TOAST_ICONS[toast.type];
                    return (
                        <div
                            key={toast.id}
                            className={`sm-toast sm-toast-${toast.type}`}
                            role={toast.type === 'error' ? 'alert' : 'status'}
                        >
                            <span className="sm-toast-icon"><Icon size={18} /></span>
                            <p className="sm-toast-message">{toast.message}</p>
                            <button
                                type="button"
                                className="sm-toast-close"
                                onClick={() => notify.dismiss(toast.id)}
                                aria-label="Dismiss message"
                            >
                                ×
                            </button>
                        </div>
                    );
                })}
            </div>

            {dialog && <SystemDialog key={dialog.id} dialog={dialog} />}
        </>
    );
};
