import { AlertCircle, CheckCircle2, X } from 'lucide-react';
import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type FlashAlertProps = {
    success?: string;
    error?: string;
    className?: string;
    dismissible?: boolean;
};

export function FlashAlert({
    success,
    error,
    className,
    dismissible = true,
}: FlashAlertProps) {
    const [visible, setVisible] = useState(true);
    const message = error || success;
    const isError = Boolean(error);

    // Re-show the alert whenever a new flash message arrives by adjusting
    // state during render (React-recommended alternative to an effect).
    const [lastMessage, setLastMessage] = useState(message);

    if (message !== lastMessage) {
        setLastMessage(message);
        setVisible(true);
    }

    if (!message || !visible) {
        return null;
    }

    return (
        <Alert
            variant={isError ? 'destructive' : 'default'}
            className={cn(
                'rounded-xl border shadow-sm',
                isError
                    ? 'border-rose-200 bg-rose-50 text-rose-700 *:data-[slot=alert-description]:text-rose-700/90'
                    : 'border-emerald-200 bg-emerald-50 text-emerald-800 *:data-[slot=alert-description]:text-emerald-700',
                className,
            )}
        >
            {isError ? (
                <AlertCircle className="size-4" />
            ) : (
                <CheckCircle2 className="size-4" />
            )}
            <AlertTitle
                className={cn(isError ? 'text-rose-800' : 'text-emerald-800')}
            >
                {isError ? 'Gagal' : 'Berhasil'}
            </AlertTitle>
            <AlertDescription
                className={cn(isError ? 'text-rose-700' : 'text-emerald-700')}
            >
                {message}
            </AlertDescription>
            {dismissible && (
                <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setVisible(false)}
                    className={cn(
                        'absolute top-2 right-2 size-7 rounded-full',
                        isError
                            ? 'text-rose-600 hover:bg-rose-100'
                            : 'text-emerald-600 hover:bg-emerald-100',
                    )}
                    aria-label="Tutup notifikasi"
                >
                    <X className="size-3.5" />
                </Button>
            )}
        </Alert>
    );
}
