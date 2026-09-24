import { Link } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { authCardClassName } from '@/components/auth-ui';
import { cn } from '@/lib/utils';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="flex min-h-svh flex-col bg-[#F8FAFC] text-slate-900">
            <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
                <Link
                    href={home()}
                    className="flex items-center gap-2.5 rounded-xl focus-visible:ring-2 focus-visible:ring-[#0080FF]/40 focus-visible:outline-none"
                    aria-label="Kembali ke beranda EduCart"
                >
                    <span className="grid size-9 place-items-center rounded-xl bg-[#EFF8FF] ring-1 ring-[#BCE0FF]">
                        <AppLogoIcon className="size-6" />
                    </span>
                    <span className="text-[17px] font-bold tracking-tight">
                        EduCart
                    </span>
                </Link>
                <p className="hidden text-[13px] text-slate-500 sm:block">
                    Jual beli aman di lingkungan sekolah
                </p>
            </header>

            <main className="mx-auto flex w-full max-w-5xl flex-1 items-start justify-center px-4 pt-4 pb-10 sm:items-center sm:px-6 sm:pt-6">
                <div className="w-full max-w-md">
                    <section
                        className={cn(authCardClassName, 'flex flex-col gap-6')}
                        aria-labelledby="auth-title"
                    >
                        <div className="flex flex-col items-center gap-3 text-center">
                            <span className="grid size-12 place-items-center rounded-2xl bg-[#EFF8FF] ring-1 ring-[#BCE0FF]">
                                <AppLogoIcon className="size-7" />
                            </span>
                            <div className="space-y-1.5">
                                <h1
                                    id="auth-title"
                                    className="text-[22px] leading-7 font-semibold tracking-tight text-slate-900"
                                >
                                    {title}
                                </h1>
                                {description ? (
                                    <p className="mx-auto max-w-sm text-sm leading-6 text-balance text-slate-500">
                                        {description}
                                    </p>
                                ) : null}
                            </div>
                        </div>

                        {children}
                    </section>

                    <div className="mt-5 flex flex-col items-center gap-2 text-center">
                        <Link
                            href={home()}
                            className="text-xs font-medium text-slate-500 transition-colors hover:text-slate-700 hover:underline hover:underline-offset-4"
                        >
                            ← Kembali belanja
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
