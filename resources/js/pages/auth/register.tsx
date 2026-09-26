import { Form, Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    BriefcaseBusiness,
    Check,
    GraduationCap,
    KeyRound,
    Lock,
    Mail,
    Phone,
    School,
    ShieldCheck,
    User,
    UserRound,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import {
    authErrorClassName,
    authFieldClassName,
    authGhostButtonClassName,
    authIconClassName,
    authInputClassName,
    authLabelClassName,
    authMutedLinkClassName,
    authPrimaryButtonClassName,
    authSelectTriggerClassName,
} from '@/components/auth-ui';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { login } from '@/routes';
import { store } from '@/routes/register';

type PositionOption = {
    id: number;
    code: string;
    name: string;
};

type ClassOption = {
    id: number;
    name: string;
    grade_level: number;
    major_code: string;
    major_name: string;
    major_group_name: string;
};

type Props = {
    passwordRules: string;
    positions: PositionOption[];
    classes: ClassOption[];
};

type RegisterTheme = CSSProperties & Record<`--${string}`, string>;

const selectPortalTheme: RegisterTheme = {
    '--foreground': '#0F172A',
    '--popover': '#FFFFFF',
    '--popover-foreground': '#0F172A',
    '--muted-foreground': '#64748B',
    '--accent': '#EFF8FF',
    '--accent-foreground': '#0059B8',
    '--border': '#E2E8F0',
};

const steps = [
    { id: 'diri', label: 'Data diri', icon: UserRound },
    { id: 'sekolah', label: 'Status sekolah', icon: GraduationCap },
    { id: 'keamanan', label: 'Kata sandi', icon: ShieldCheck },
] as const;

const stepErrorFields: Record<number, string[]> = {
    0: ['name', 'email', 'phone'],
    1: ['position_id', 'class_id'],
    2: ['password', 'password_confirmation'],
};

export default function Register({ passwordRules, positions, classes }: Props) {
    const [step, setStep] = useState(0);
    const [direction, setDirection] = useState(1);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [positionId, setPositionId] = useState('');
    const [gradeLevel, setGradeLevel] = useState('');
    const [classId, setClassId] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [localErrors, setLocalErrors] = useState<Record<string, string>>({});
    const focusRafRef = useRef<number>(0);

    useEffect(() => {
        return () => cancelAnimationFrame(focusRafRef.current);
    }, []);

    const selectedPosition = positions.find(
        (position) => String(position.id) === positionId,
    );
    const isStudent = selectedPosition?.code === 'student';
    const gradeLevels = useMemo(
        () =>
            Array.from(
                new Set(classes.map((schoolClass) => schoolClass.grade_level)),
            ).sort((a, b) => a - b),
        [classes],
    );
    const filteredClasses = classes.filter(
        (schoolClass) => String(schoolClass.grade_level) === gradeLevel,
    );
    const selectedClass = classes.find(
        (schoolClass) => String(schoolClass.id) === classId,
    );

    const handlePositionChange = (value: string) => {
        setPositionId(value);
        setLocalErrors((prev) => ({ ...prev, position_id: '' }));

        const nextPosition = positions.find(
            (position) => String(position.id) === value,
        );

        if (nextPosition?.code !== 'student') {
            setGradeLevel('');
            setClassId('');
        }
    };

    const handleGradeLevelChange = (value: string) => {
        setGradeLevel(value);
        setClassId('');
        setLocalErrors((prev) => ({ ...prev, class_id: '' }));
    };

    function validateStep(nextStep: number) {
        const found: Record<string, string> = {};

        if (nextStep === 0) {
            if (name.trim().length < 3) {
                found.name = 'Isi nama lengkap, minimal 3 karakter.';
            }

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
                found.email = 'Isi email yang valid, contoh nama@email.com.';
            }

            if (!/^(\+?62|0)[0-9]{8,14}$/.test(phone.trim())) {
                found.phone =
                    'Isi nomor WhatsApp yang valid, contoh 081234567890.';
            }
        }

        if (nextStep === 1) {
            if (!positionId) {
                found.position_id = 'Pilih jabatan kamu di sekolah.';
            }

            if (selectedPosition?.code === 'student') {
                if (!gradeLevel) {
                    found.class_id = 'Pilih kelas dulu, baru pilih jurusan.';
                } else if (!classId) {
                    found.class_id = 'Pilih jurusan kelas kamu.';
                }
            }
        }

        if (nextStep === 2) {
            if (password.length < 8) {
                found.password = 'Kata sandi minimal 8 karakter.';
            }

            if (passwordConfirmation !== password || !passwordConfirmation) {
                found.password_confirmation =
                    'Konfirmasi belum sama dengan kata sandi.';
            }
        }

        return found;
    }

    const goTo = (nextStep: number) => {
        setDirection(nextStep > step ? 1 : -1);
        setStep(nextStep);
        cancelAnimationFrame(focusRafRef.current);
        focusRafRef.current = requestAnimationFrame(() => {
            const firstField = document.querySelector<HTMLElement>(
                `[data-step-panel="${nextStep}"] input, [data-step-panel="${nextStep}"] button[role="combobox"]`,
            );
            firstField?.focus({ preventScroll: true });
        });
    };

    const handleNext = () => {
        const found = validateStep(step);
        setLocalErrors(found);

        if (Object.values(found).some(Boolean)) {
            return;
        }

        goTo(Math.min(step + 1, steps.length - 1));
    };

    const handleBack = () => {
        setLocalErrors({});
        goTo(Math.max(step - 1, 0));
    };

    return (
        <>
            <Head title="Daftar Sekarang" />
            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-5"
            >
                {({ processing, errors }) => {
                    const mergedErrors: Record<string, string | undefined> = {
                        name: localErrors.name || errors.name,
                        email: localErrors.email || errors.email,
                        phone: localErrors.phone || errors.phone,
                        position_id:
                            localErrors.position_id || errors.position_id,
                        class_id: localErrors.class_id || errors.class_id,
                        password: localErrors.password || errors.password,
                        password_confirmation:
                            localErrors.password_confirmation ||
                            errors.password_confirmation,
                    };

                    return (
                        <>
                            <StepJumpOnServerError
                                errors={errors}
                                onJump={goTo}
                            />

                            {/* Penunjuk langkah */}
                            <div>
                                <p className="sr-only" aria-live="polite">
                                    Langkah {step + 1} dari {steps.length}:{' '}
                                    {steps[step].label}
                                </p>
                                <ol
                                    className="mx-auto flex max-w-xs items-start"
                                    aria-label="Langkah pendaftaran"
                                >
                                    {steps.map((item, index) => {
                                        const done = index < step;
                                        const active = index === step;
                                        const Icon = item.icon;
                                        const isFirst = index === 0;
                                        const isLast =
                                            index === steps.length - 1;

                                        return (
                                            <li
                                                key={item.id}
                                                className="flex flex-1 flex-col items-center gap-1.5 text-center"
                                            >
                                                <div className="flex w-full items-center">
                                                    <span
                                                        aria-hidden
                                                        className={cn(
                                                            'mx-1 h-0.5 flex-1 rounded-full',
                                                            isFirst
                                                                ? 'bg-transparent'
                                                                : index <= step
                                                                  ? 'bg-[#0080FF]'
                                                                  : 'bg-slate-200',
                                                        )}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            if (index < step) {
                                                                goTo(index);
                                                            }
                                                        }}
                                                        disabled={
                                                            index >= step ||
                                                            processing
                                                        }
                                                        aria-current={
                                                            active
                                                                ? 'step'
                                                                : undefined
                                                        }
                                                        aria-label={`${item.label}${
                                                            done
                                                                ? ', selesai, klik untuk kembali'
                                                                : active
                                                                  ? ', langkah saat ini'
                                                                  : ''
                                                        }`}
                                                        className={cn(
                                                            'flex size-7 shrink-0 items-center justify-center rounded-full border text-sm font-semibold transition-colors',
                                                            done &&
                                                                'border-[#0080FF] bg-[#0080FF] text-white',
                                                            active &&
                                                                'border-[#0080FF] bg-[#EFF8FF] text-[#0059B8] ring-2 ring-blue-500/20',
                                                            !done &&
                                                                !active &&
                                                                'border-slate-200 bg-white text-slate-400',
                                                            done &&
                                                                'cursor-pointer hover:bg-[#0068D1]',
                                                            index >= step &&
                                                                'cursor-default',
                                                        )}
                                                    >
                                                        {done ? (
                                                            <Check className="size-4" />
                                                        ) : (
                                                            <Icon className="size-4" />
                                                        )}
                                                    </button>
                                                    <span
                                                        aria-hidden
                                                        className={cn(
                                                            'mx-1 h-0.5 flex-1 rounded-full',
                                                            isLast
                                                                ? 'bg-transparent'
                                                                : index < step
                                                                  ? 'bg-[#0080FF]'
                                                                  : 'bg-slate-200',
                                                        )}
                                                    />
                                                </div>
                                                <span
                                                    className={cn(
                                                        'text-[11px] leading-tight',
                                                        active
                                                            ? 'font-semibold text-[#0F172A]'
                                                            : done
                                                              ? 'font-medium text-[#0059B8]'
                                                              : 'text-slate-400',
                                                    )}
                                                >
                                                    {item.label}
                                                </span>
                                            </li>
                                        );
                                    })}
                                </ol>
                            </div>

                            <div
                                key={`${step}-${direction}`}
                                data-step-panel={step}
                                style={
                                    {
                                        '--register-step-offset':
                                            direction >= 0 ? '12px' : '-12px',
                                    } as CSSProperties
                                }
                                className="flex flex-col gap-4 motion-safe:animate-[register-step-in_240ms_ease-out]"
                            >
                                {/* Langkah 1 — tetap di DOM saat pindah langkah supaya nilainya ikut terkirim */}
                                <div
                                    className={cn(
                                        'flex-col gap-4',
                                        step === 0 ? 'flex' : 'hidden',
                                    )}
                                    aria-hidden={step !== 0}
                                >
                                    <div className={authFieldClassName}>
                                        <Label
                                            htmlFor="name"
                                            className={authLabelClassName}
                                        >
                                            Nama Lengkap
                                        </Label>
                                        <div className="relative">
                                            <User
                                                className={authIconClassName}
                                            />
                                            <Input
                                                id="name"
                                                type="text"
                                                required
                                                autoFocus
                                                tabIndex={1}
                                                autoComplete="name"
                                                name="name"
                                                value={name}
                                                onChange={(event) => {
                                                    setName(event.target.value);
                                                    setLocalErrors((prev) => ({
                                                        ...prev,
                                                        name: '',
                                                    }));
                                                }}
                                                placeholder="Masukkan nama lengkap"
                                                className={authInputClassName}
                                                aria-invalid={Boolean(
                                                    mergedErrors.name,
                                                )}
                                            />
                                        </div>
                                        <InputError
                                            message={mergedErrors.name}
                                            className={authErrorClassName}
                                        />
                                    </div>

                                    <div className={authFieldClassName}>
                                        <Label
                                            htmlFor="email"
                                            className={authLabelClassName}
                                        >
                                            Email
                                        </Label>
                                        <div className="relative">
                                            <Mail
                                                className={authIconClassName}
                                            />
                                            <Input
                                                id="email"
                                                type="email"
                                                required
                                                tabIndex={2}
                                                autoComplete="email"
                                                name="email"
                                                value={email}
                                                onChange={(event) => {
                                                    setEmail(
                                                        event.target.value,
                                                    );
                                                    setLocalErrors((prev) => ({
                                                        ...prev,
                                                        email: '',
                                                    }));
                                                }}
                                                placeholder="contoh@email.com"
                                                className={authInputClassName}
                                                aria-invalid={Boolean(
                                                    mergedErrors.email,
                                                )}
                                            />
                                        </div>
                                        <InputError
                                            message={mergedErrors.email}
                                            className={authErrorClassName}
                                        />
                                    </div>

                                    <div className={authFieldClassName}>
                                        <Label
                                            htmlFor="phone"
                                            className={authLabelClassName}
                                        >
                                            Nomor WhatsApp
                                        </Label>
                                        <div className="relative">
                                            <Phone
                                                className={authIconClassName}
                                            />
                                            <Input
                                                id="phone"
                                                type="tel"
                                                required
                                                tabIndex={3}
                                                autoComplete="tel"
                                                inputMode="tel"
                                                name="phone"
                                                value={phone}
                                                onChange={(event) => {
                                                    setPhone(
                                                        event.target.value,
                                                    );
                                                    setLocalErrors((prev) => ({
                                                        ...prev,
                                                        phone: '',
                                                    }));
                                                }}
                                                placeholder="08xxxxxxxxxx"
                                                className={authInputClassName}
                                                aria-invalid={Boolean(
                                                    mergedErrors.phone,
                                                )}
                                            />
                                        </div>
                                        <InputError
                                            message={mergedErrors.phone}
                                            className={authErrorClassName}
                                        />
                                    </div>
                                </div>

                                {/* Langkah 2 */}
                                <div
                                    className={cn(
                                        'flex-col gap-4',
                                        step === 1 ? 'flex' : 'hidden',
                                    )}
                                    aria-hidden={step !== 1}
                                >
                                    <div className={authFieldClassName}>
                                        <Label
                                            htmlFor="position_id"
                                            className={authLabelClassName}
                                        >
                                            Jabatan
                                        </Label>
                                        <div className="relative">
                                            <BriefcaseBusiness
                                                className={authIconClassName}
                                            />
                                            <Select
                                                name="position_id"
                                                value={positionId}
                                                onValueChange={
                                                    handlePositionChange
                                                }
                                                required
                                            >
                                                <SelectTrigger
                                                    id="position_id"
                                                    className={
                                                        authSelectTriggerClassName
                                                    }
                                                    tabIndex={4}
                                                    aria-invalid={Boolean(
                                                        mergedErrors.position_id,
                                                    )}
                                                >
                                                    <SelectValue placeholder="Pilih jabatan" />
                                                </SelectTrigger>
                                                <SelectContent
                                                    style={selectPortalTheme}
                                                    position="popper"
                                                    sideOffset={4}
                                                    align="start"
                                                >
                                                    <SelectGroup>
                                                        <SelectLabel>
                                                            Jabatan
                                                        </SelectLabel>
                                                        {positions.length ===
                                                            0 && (
                                                            <SelectItem
                                                                value="__empty"
                                                                disabled
                                                            >
                                                                Data jabatan
                                                                tidak tersedia
                                                            </SelectItem>
                                                        )}
                                                        {positions.map(
                                                            (position) => (
                                                                <SelectItem
                                                                    key={
                                                                        position.id
                                                                    }
                                                                    value={String(
                                                                        position.id,
                                                                    )}
                                                                >
                                                                    {
                                                                        position.name
                                                                    }
                                                                </SelectItem>
                                                            ),
                                                        )}
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <InputError
                                            message={
                                                mergedErrors.position_id ||
                                                mergedErrors.class_id
                                            }
                                            className={authErrorClassName}
                                        />
                                    </div>

                                    {isStudent && (
                                        <>
                                            <div className={authFieldClassName}>
                                                <Label
                                                    htmlFor="grade_level"
                                                    className={
                                                        authLabelClassName
                                                    }
                                                >
                                                    Kelas
                                                </Label>
                                                <div className="relative">
                                                    <GraduationCap
                                                        className={
                                                            authIconClassName
                                                        }
                                                    />
                                                    <Select
                                                        value={gradeLevel}
                                                        onValueChange={
                                                            handleGradeLevelChange
                                                        }
                                                        required
                                                    >
                                                        <SelectTrigger
                                                            id="grade_level"
                                                            className={
                                                                authSelectTriggerClassName
                                                            }
                                                            tabIndex={5}
                                                        >
                                                            <SelectValue placeholder="Pilih kelas" />
                                                        </SelectTrigger>
                                                        <SelectContent
                                                            style={
                                                                selectPortalTheme
                                                            }
                                                            position="popper"
                                                            sideOffset={4}
                                                            align="start"
                                                        >
                                                            <SelectGroup>
                                                                <SelectLabel>
                                                                    Kelas
                                                                </SelectLabel>
                                                                {gradeLevels.map(
                                                                    (level) => (
                                                                        <SelectItem
                                                                            key={
                                                                                level
                                                                            }
                                                                            value={String(
                                                                                level,
                                                                            )}
                                                                        >
                                                                            {matchGrade(
                                                                                level,
                                                                            )}
                                                                        </SelectItem>
                                                                    ),
                                                                )}
                                                            </SelectGroup>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            <div className={authFieldClassName}>
                                                <Label
                                                    htmlFor="class_id"
                                                    className={
                                                        authLabelClassName
                                                    }
                                                >
                                                    Jurusan
                                                </Label>
                                                <div className="relative">
                                                    <School
                                                        className={
                                                            authIconClassName
                                                        }
                                                    />
                                                    <Select
                                                        name="class_id"
                                                        value={classId}
                                                        onValueChange={(
                                                            value,
                                                        ) => {
                                                            setClassId(value);
                                                            setLocalErrors(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    class_id:
                                                                        '',
                                                                }),
                                                            );
                                                        }}
                                                        disabled={!gradeLevel}
                                                        required
                                                    >
                                                        <SelectTrigger
                                                            id="class_id"
                                                            className={
                                                                authSelectTriggerClassName
                                                            }
                                                            tabIndex={6}
                                                            aria-invalid={Boolean(
                                                                mergedErrors.class_id,
                                                            )}
                                                        >
                                                            <SelectValue
                                                                placeholder={
                                                                    gradeLevel
                                                                        ? 'Pilih jurusan'
                                                                        : 'Pilih kelas dulu'
                                                                }
                                                            />
                                                        </SelectTrigger>
                                                        <SelectContent
                                                            style={
                                                                selectPortalTheme
                                                            }
                                                            position="popper"
                                                            sideOffset={4}
                                                            align="start"
                                                        >
                                                            <SelectGroup>
                                                                <SelectLabel>
                                                                    Jurusan{' '}
                                                                    {gradeLevel
                                                                        ? matchGrade(
                                                                              Number(
                                                                                  gradeLevel,
                                                                              ),
                                                                          )
                                                                        : ''}
                                                                </SelectLabel>
                                                                {filteredClasses.map(
                                                                    (
                                                                        schoolClass,
                                                                    ) => (
                                                                        <SelectItem
                                                                            key={
                                                                                schoolClass.id
                                                                            }
                                                                            value={String(
                                                                                schoolClass.id,
                                                                            )}
                                                                        >
                                                                            {
                                                                                schoolClass.major_code
                                                                            }
                                                                        </SelectItem>
                                                                    ),
                                                                )}
                                                            </SelectGroup>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {!isStudent && positionId && (
                                        <p className="rounded-[8px] border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm leading-6 text-[#475569]">
                                            Akun {selectedPosition?.name} tidak
                                            perlu memilih kelas dan jurusan.
                                        </p>
                                    )}
                                </div>

                                {/* Langkah 3 */}
                                <div
                                    className={cn(
                                        'flex-col gap-4',
                                        step === 2 ? 'flex' : 'hidden',
                                    )}
                                    aria-hidden={step !== 2}
                                >
                                    {(name.trim() || email.trim()) && (
                                        <div className="rounded-[8px] border border-[#BCE0FF] bg-[#EFF8FF] px-3 py-2.5 text-sm leading-6 text-[#0F172A]">
                                            Mendaftar sebagai{' '}
                                            <span className="font-semibold">
                                                {name.trim() || email.trim()}
                                            </span>
                                            {selectedPosition && (
                                                <>
                                                    {' · '}
                                                    {selectedPosition.name}
                                                    {selectedClass &&
                                                        ` ${selectedClass.major_code}`}
                                                </>
                                            )}
                                            .
                                        </div>
                                    )}

                                    <div className={authFieldClassName}>
                                        <Label
                                            htmlFor="password"
                                            className={authLabelClassName}
                                        >
                                            Kata Sandi
                                        </Label>
                                        <div className="relative">
                                            <Lock
                                                className={authIconClassName}
                                            />
                                            <PasswordInput
                                                id="password"
                                                required
                                                tabIndex={7}
                                                autoComplete="new-password"
                                                name="password"
                                                value={password}
                                                onChange={(event) => {
                                                    setPassword(
                                                        event.target.value,
                                                    );
                                                    setLocalErrors((prev) => ({
                                                        ...prev,
                                                        password: '',
                                                        password_confirmation:
                                                            '',
                                                    }));
                                                }}
                                                placeholder="Minimal 8 karakter"
                                                passwordrules={passwordRules}
                                                className={authInputClassName}
                                                aria-invalid={Boolean(
                                                    mergedErrors.password,
                                                )}
                                            />
                                        </div>
                                        <InputError
                                            message={mergedErrors.password}
                                            className={authErrorClassName}
                                        />
                                    </div>

                                    <div className={authFieldClassName}>
                                        <Label
                                            htmlFor="password_confirmation"
                                            className={authLabelClassName}
                                        >
                                            Konfirmasi Kata Sandi
                                        </Label>
                                        <div className="relative">
                                            <KeyRound
                                                className={authIconClassName}
                                            />
                                            <PasswordInput
                                                id="password_confirmation"
                                                required
                                                tabIndex={8}
                                                autoComplete="new-password"
                                                name="password_confirmation"
                                                value={passwordConfirmation}
                                                onChange={(event) => {
                                                    setPasswordConfirmation(
                                                        event.target.value,
                                                    );
                                                    setLocalErrors((prev) => ({
                                                        ...prev,
                                                        password_confirmation:
                                                            '',
                                                    }));
                                                }}
                                                placeholder="Ulangi kata sandi"
                                                passwordrules={passwordRules}
                                                className={authInputClassName}
                                                aria-invalid={Boolean(
                                                    mergedErrors.password_confirmation,
                                                )}
                                            />
                                        </div>
                                        <InputError
                                            message={
                                                mergedErrors.password_confirmation
                                            }
                                            className={authErrorClassName}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Navigasi langkah */}
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center gap-2">
                                    {step > 0 && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleBack}
                                            disabled={processing}
                                            className={authGhostButtonClassName}
                                            tabIndex={9}
                                        >
                                            <ArrowLeft className="size-4" />
                                            Kembali
                                        </Button>
                                    )}
                                    {step < steps.length - 1 ? (
                                        <Button
                                            type="button"
                                            onClick={handleNext}
                                            disabled={processing}
                                            className={`${authPrimaryButtonClassName} flex-1`}
                                            tabIndex={10}
                                        >
                                            Lanjut
                                            <ArrowRight className="size-4" />
                                        </Button>
                                    ) : (
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className={`${authPrimaryButtonClassName} flex-1`}
                                            tabIndex={10}
                                            data-test="register-user-button"
                                        >
                                            {processing && <Spinner />}
                                            Buat akun
                                            <ArrowRight className="size-4" />
                                        </Button>
                                    )}
                                </div>
                                <p className="text-center text-xs font-medium text-slate-400">
                                    Langkah {step + 1} dari {steps.length}
                                </p>
                            </div>

                            <div className="border-t border-slate-100 pt-4 text-center text-sm leading-6 text-slate-500">
                                Sudah punya akun?{' '}
                                <Link
                                    href={login()}
                                    tabIndex={11}
                                    className={authMutedLinkClassName}
                                >
                                    Masuk di sini
                                </Link>
                            </div>
                        </>
                    );
                }}
            </Form>
        </>
    );
}

function StepJumpOnServerError({
    errors,
    onJump,
}: {
    errors: Record<string, string | undefined>;
    onJump: (step: number) => void;
}) {
    const keys = Object.keys(errors).filter((key) => errors[key]);
    const signature = keys.sort().join('|');

    useEffect(() => {
        if (!signature) {
            return;
        }

        for (let index = 0; index < steps.length; index += 1) {
            if (stepErrorFields[index].some((field) => keys.includes(field))) {
                onJump(index);
                break;
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [signature]);

    return null;
}

Register.layout = {
    title: 'Daftar ke EduCart',
    description: 'Buat akun untuk mulai belanja di lingkungan sekolah.',
};

function matchGrade(value: number) {
    return matchGradeLabel[value] ?? `Kelas ${value}`;
}

const matchGradeLabel: Record<number, string> = {
    10: 'Kelas X',
    11: 'Kelas XI',
    12: 'Kelas XII',
};
