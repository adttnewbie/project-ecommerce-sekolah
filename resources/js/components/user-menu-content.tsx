import { Link, router, usePage } from '@inertiajs/react';
import { LayoutDashboard, LogOut, Settings } from 'lucide-react';
import { useState } from 'react';
import {
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Spinner } from '@/components/ui/spinner';
import { UserInfo } from '@/components/user-info';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { logout } from '@/routes';
import { edit } from '@/routes/profile';
import { leave as leaveShoppingMode } from '@/routes/shopping-mode';
import type { User } from '@/types';

type Props = {
    user: User;
};

export function UserMenuContent({ user }: Props) {
    const cleanup = useMobileNavigation();
    const { shoppingMode } = usePage().props;
    const [processing, setProcessing] = useState(false);
    const isSellerShopping = user.role === 'seller' && shoppingMode === 'buyer';

    const handleLogout = () => {
        if (processing) {
            return;
        }

        cleanup();
        router.flushAll();

        setProcessing(true);
        router.post(
            logout().url,
            {},
            {
                onFinish: () => setProcessing(false),
            },
        );
    };

    return (
        <>
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <UserInfo user={user} showEmail={true} />
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                {isSellerShopping && (
                    <DropdownMenuItem asChild>
                        <button
                            type="button"
                            className="block w-full cursor-pointer"
                            onClick={() =>
                                router.post(leaveShoppingMode().url)
                            }
                        >
                            <LayoutDashboard className="mr-2" />
                            Dashboard Seller
                        </button>
                    </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                    <Link
                        className="block w-full cursor-pointer"
                        href={edit()}
                        prefetch
                        onClick={cleanup}
                    >
                        <Settings className="mr-2" />
                        Settings
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <button
                    type="button"
                    className="block w-full cursor-pointer"
                    onClick={handleLogout}
                    disabled={processing}
                    data-test="logout-button"
                >
                    {processing ? (
                        <Spinner className="mr-2" />
                    ) : (
                        <LogOut className="mr-2" />
                    )}
                    {processing ? 'Logout...' : 'Log out'}
                </button>
            </DropdownMenuItem>
        </>
    );
}
