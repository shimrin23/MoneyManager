// In-app replacements for the browser's alert(), confirm() and prompt().
// Call these from anywhere; <SystemMessages /> (mounted once in App) displays them.
//
//   notify.success('Goal updated');
//   if (await confirmDialog({ title: 'Delete goal?', message: '...', danger: true })) { ... }
//   const amount = await promptDialog({ title: 'Add contribution', inputType: 'number' });

export type MessageType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
    id: number;
    type: MessageType;
    message: string;
}

export interface ConfirmOptions {
    title: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    danger?: boolean; // red confirm button, for deletes
}

export interface PromptOptions extends ConfirmOptions {
    label?: string;
    inputType?: 'text' | 'number';
    placeholder?: string;
    defaultValue?: string;
    // Return an error message to keep the dialog open, or null when the value is OK
    validate?: (value: string) => string | null;
}

export type DialogRequest =
    | (ConfirmOptions & { id: number; kind: 'confirm'; resolve: (ok: boolean) => void })
    | (PromptOptions & { id: number; kind: 'prompt'; resolve: (value: string | null) => void });

interface State {
    toasts: Toast[];
    dialog: DialogRequest | null;
}

const TOAST_DURATION_MS: Record<MessageType, number> = { success: 4000, info: 4000, warning: 6000, error: 6000 };

let nextId = 1;
let state: State = { toasts: [], dialog: null };
const dialogQueue: DialogRequest[] = [];
const listeners = new Set<() => void>();

const setState = (next: Partial<State>) => {
    state = { ...state, ...next };
    listeners.forEach((listener) => listener());
};

export const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => { listeners.delete(listener); };
};

export const getSnapshot = () => state;

const dismiss = (id: number) => setState({ toasts: state.toasts.filter((t) => t.id !== id) });

const show = (type: MessageType, message: string) => {
    const id = nextId++;
    setState({ toasts: [...state.toasts, { id, type, message }] });
    setTimeout(() => dismiss(id), TOAST_DURATION_MS[type]);
};

export const notify = {
    success: (message: string) => show('success', message),
    error: (message: string) => show('error', message),
    warning: (message: string) => show('warning', message),
    info: (message: string) => show('info', message),
    dismiss,
};

// Dialogs open one at a time; later ones wait their turn
const openDialog = (request: DialogRequest) => {
    if (state.dialog) dialogQueue.push(request);
    else setState({ dialog: request });
};

export const closeDialog = () => setState({ dialog: dialogQueue.shift() ?? null });

export const confirmDialog = (options: ConfirmOptions) =>
    new Promise<boolean>((resolve) => openDialog({ ...options, id: nextId++, kind: 'confirm', resolve }));

export const promptDialog = (options: PromptOptions) =>
    new Promise<string | null>((resolve) => openDialog({ ...options, id: nextId++, kind: 'prompt', resolve }));
