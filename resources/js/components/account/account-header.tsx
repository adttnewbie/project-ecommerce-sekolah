import { ChevronRight, Mail, Phone } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';

export function AccountHeader({
    name,
    email,
    phone,
    avatar,
    onOpen,
}: {
    name: string;
    email: string;
    phone?: string | null;
    avatar?: string | null;
    onOpen: () => void;
}) {
    const getInitials = useInitials();

    return (
        <button
            type="button"
            onClick={onOpen}
            className="w-full overflow-hidden rounded-[14px] border border-slate-200 bg-white text-left shadow-[0_1px_2px_rgba(15,23,42,0.05)] focus-visible:ring-2 focus-visible:ring-[#0080FF] focus-visible:outline-none"
        >
            <div className="bg-gradient-to-r from-[#0080FF] to-[#0059B8] px-4 pt-5 pb-10 sm:px-5">
                <div className="flex items-center gap-3">
                    <Avatar className="size-14 shrink-0 rounded-full border-2 border-white/70 bg-white">
                        <AvatarImage src={avatar ?? undefined} alt={name} />
                        <AvatarFallback className="rounded-full bg-[#EFF8FF] text-base font-semibold text-[#0080FF]">
                            {getInitials(name)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-base font-bold text-white">
                            {name}
                        </p>
                        <p className="flex items-center gap-1 truncate text-xs text-blue-100">
                            <Mail className="size-3 shrink-0" />
                            {email}
                        </p>
                        {phone && (
                            <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-blue-100">
                                <Phone className="size-3 shrink-0" />
                                {phone}
                            </p>
                        )}
                    </div>
                    <span className="hidden shrink-0 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold text-white ring-1 ring-white/30 sm:inline-flex">
                        Buyer
                    </span>
                    <ChevronRight
                        className="size-5 shrink-0 text-white/80"
                        aria-hidden
                    />
                </div>
            </div>
            <div className="px-4 py-3 sm:px-5">
                <p className="text-xs font-medium text-slate-500">
                    Ketuk untuk lihat & ubah profil
                </p>
            </div>
        </button>
    );
}
