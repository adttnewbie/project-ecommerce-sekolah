import { useEffect } from 'react';

interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
}

let listeners: Array<(toast: Toast) => void> = [];

export function showToast(message: string, type: Toast['type'] = 'info') {
    const id = Math.random().toString(36).substring(7);
    const toast = { id, message, type };

    listeners.forEach((cb) => cb(toast));

    setTimeout(() => {
        listeners = listeners.filter((l) => l !== undefined);
    }, 4000);
}

export function useToastListener(callback: (toast: Toast) => void) {
    useEffect(() => {
        listeners.push(callback);

        return () => {
            listeners = listeners.filter((l) => l !== callback);
        };
    }, [callback]);
}

export function NotificationToast({ toasts }: { toasts: Toast[] }) {
    return (
        <div className="fixed right-4 bottom-4 z-50 space-y-2">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`max-w-sm rounded-lg px-4 py-3 shadow-lg transition-all duration-300 ${
                        toast.type === 'success'
                            ? 'bg-green-600 text-white'
                            : toast.type === 'error'
                              ? 'bg-red-600 text-white'
                              : 'bg-blue-600 text-white'
                    }`}
                >
                    <p className="text-sm font-medium">{toast.message}</p>
                </div>
            ))}
        </div>
    );
}
