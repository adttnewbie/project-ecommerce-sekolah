export type User = {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
    role: 'admin' | 'seller' | 'buyer' | 'admin_jurusan' | 'picket_officer';
    avatar?: string;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
};

export type Auth = {
    user: User | null;
};

export type TwoFactorSetupData = {
    svg: string;
    url: string;
};

export type TwoFactorSecretKey = {
    secretKey: string;
};
