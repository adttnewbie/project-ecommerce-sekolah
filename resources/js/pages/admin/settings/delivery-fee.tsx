import { Form, Head, usePage } from '@inertiajs/react';
import {
    BadgePercent,
    CircleDollarSign,
    Info,
    MoveRight,
    Plus,
    RotateCcw,
    Trash2,
    Truck,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { PageHeader } from '@/components/admin-jurusan/page-header';
import InputError from '@/components/input-error';
import { FlashAlert } from '@/components/picket/flash-alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
    InputGroupText,
} from '@/components/ui/input-group';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { update as deliveryFeeUpdate } from '@/routes/admin/settings/delivery-fee';

type DeliveryFeeTier = {
    min_spend: number;
    fee: number;
};

type Props = {
    delivery_fee_tiers: DeliveryFeeTier[];
};

const DEFAULT_SIMULATION_SUBTOTAL = 50000;

const formatRupiah = (value: number) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value);

const parseAmount = (raw: string): number =>
    raw === '' ? Number.NaN : Math.max(0, Math.floor(Number(raw)));

const matchTier = (
    subtotal: number,
    tiers: DeliveryFeeTier[],
): DeliveryFeeTier | null =>
    [...tiers]
        .sort((a, b) => a.min_spend - b.min_spend)
        .filter((tier) => subtotal >= tier.min_spend)
        .at(-1) ?? null;

export default function AdminDeliveryFeeSettings({
    delivery_fee_tiers,
}: Props) {
    const { flash, errors } = usePage().props;
    const updateRoute = deliveryFeeUpdate.form();
    const [tiers, setTiers] = useState<DeliveryFeeTier[]>(delivery_fee_tiers);
    const [simulationSubtotal, setSimulationSubtotal] = useState(
        DEFAULT_SIMULATION_SUBTOTAL,
    );

    const savedKey = JSON.stringify(
        delivery_fee_tiers.map((t) => [t.min_spend, t.fee]),
    );
    const currentKey = JSON.stringify(
        tiers.map((t) => [
            Number.isNaN(t.min_spend) ? null : t.min_spend,
            Number.isNaN(t.fee) ? null : t.fee,
        ]),
    );
    const isDirty = currentKey !== savedKey;
    const canSubmit =
        isDirty &&
        tiers.every(
            (tier) => !Number.isNaN(tier.min_spend) && !Number.isNaN(tier.fee),
        );

    const duplicateWarning = useMemo(() => {
        const minimums = tiers
            .filter((tier) => !Number.isNaN(tier.min_spend))
            .map((tier) => tier.min_spend);

        return new Set(minimums).size !== minimums.length;
    }, [tiers]);

    const simulation = useMemo(() => {
        const safeSubtotal = Math.max(0, simulationSubtotal || 0);
        const tier = matchTier(safeSubtotal, tiers);

        return {
            tier,
            fee: tier?.fee ?? 0,
            total: safeSubtotal + (tier?.fee ?? 0),
        };
    }, [simulationSubtotal, tiers]);

    const updateTier = (index: number, patch: Partial<DeliveryFeeTier>) => {
        setTiers((current) =>
            current.map((tier, i) =>
                i === index ? { ...tier, ...patch } : tier,
            ),
        );
    };

    const addTier = () => {
        const highestMinimum = Math.max(
            0,
            ...tiers
                .filter((tier) => !Number.isNaN(tier.min_spend))
                .map((tier) => tier.min_spend),
        );

        setTiers((current) => [
            ...current,
            { min_spend: highestMinimum + 10000, fee: 0 },
        ]);
    };

    const removeTier = (index: number) => {
        setTiers((current) => current.filter((_, i) => i !== index));
    };

    return (
        <>
            <Head title="Pengaturan Biaya Antar" />
            <main className="min-h-[calc(100svh-4rem)] bg-slate-50 p-4 sm:p-6">
                <div className="mx-auto max-w-2xl space-y-6">
                    <PageHeader
                        badge="Pengaturan"
                        badgeIcon={Truck}
                        title="Biaya Antar"
                        description="Atur biaya layanan antar dalam rupiah berdasarkan tingkat minimal belanja buyer."
                        descriptionClassName="line-clamp-1"
                        actions={
                            <Badge
                                className={cn(
                                    'rounded-full px-4 py-2 ring-1',
                                    delivery_fee_tiers.length === 1 &&
                                        delivery_fee_tiers[0]?.fee === 0
                                        ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                                        : 'bg-blue-50 text-blue-700 ring-blue-200',
                                )}
                            >
                                <BadgePercent className="size-4" />
                                {delivery_fee_tiers.length === 1 &&
                                delivery_fee_tiers[0]?.fee === 0
                                    ? 'Gratis'
                                    : `${delivery_fee_tiers.length} aturan`}
                            </Badge>
                        }
                    />

                    {(flash.success || flash.error) && (
                        <FlashAlert
                            success={flash.success ?? undefined}
                            error={flash.error ?? undefined}
                        />
                    )}

                    <Card className="rounded-xl border-slate-200 bg-white shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-950">
                                <CircleDollarSign className="size-5 text-blue-700" />
                                Aturan biaya antar
                            </CardTitle>
                            <CardDescription className="line-clamp-1">
                                Buyer kena aturan dengan minimal belanja
                                tertinggi yang tercapai.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form
                                action={updateRoute.action}
                                method={updateRoute.method}
                                disableWhileProcessing
                                className="space-y-5"
                            >
                                {({ processing, errors: formErrors }) => (
                                    <>
                                        {(formErrors.tiers ?? errors.tiers) && (
                                            <div className="rounded-[8px] border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                                                {errors.tiers ??
                                                    formErrors.tiers}
                                            </div>
                                        )}

                                        {duplicateWarning && (
                                            <div className="rounded-[8px] border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
                                                Minimal belanja tidak boleh sama
                                                di dua aturan.
                                            </div>
                                        )}

                                        <div className="space-y-3">
                                            {tiers.map((tier, index) => (
                                                <div
                                                    key={
                                                        index === 0
                                                            ? 'base'
                                                            : `tier-${index}`
                                                    }
                                                    className="grid gap-2 rounded-xl border border-slate-200 p-3 sm:grid-cols-[1fr_auto_1fr_auto] sm:items-center sm:gap-3"
                                                >
                                                    <div className="space-y-1">
                                                        <label
                                                            htmlFor={`tier_min_spend_${index}`}
                                                            className="text-xs font-medium text-slate-500"
                                                        >
                                                            Minimal belanja
                                                        </label>
                                                        <InputGroup>
                                                            <InputGroupAddon align="inline-start">
                                                                <InputGroupText>
                                                                    Rp
                                                                </InputGroupText>
                                                            </InputGroupAddon>
                                                            <InputGroupInput
                                                                id={`tier_min_spend_${index}`}
                                                                name={`tiers[${index}][min_spend]`}
                                                                type="number"
                                                                min={
                                                                    index === 0
                                                                        ? 0
                                                                        : 1
                                                                }
                                                                step={1000}
                                                                value={
                                                                    Number.isNaN(
                                                                        tier.min_spend,
                                                                    )
                                                                        ? ''
                                                                        : tier.min_spend
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    updateTier(
                                                                        index,
                                                                        {
                                                                            min_spend:
                                                                                parseAmount(
                                                                                    event
                                                                                        .target
                                                                                        .value,
                                                                                ),
                                                                        },
                                                                    )
                                                                }
                                                                disabled={
                                                                    index === 0
                                                                }
                                                                required
                                                            />
                                                        </InputGroup>
                                                        <InputError
                                                            message={
                                                                formErrors[
                                                                    `tiers.${index}.min_spend`
                                                                ] ??
                                                                errors[
                                                                    `tiers.${index}.min_spend`
                                                                ]
                                                            }
                                                        />
                                                    </div>

                                                    <MoveRight className="hidden size-4 shrink-0 rotate-90 text-slate-400 sm:rotate-0" />

                                                    <div className="space-y-1">
                                                        <label
                                                            htmlFor={`tier_fee_${index}`}
                                                            className="text-xs font-medium text-slate-500"
                                                        >
                                                            Biaya antar
                                                        </label>
                                                        <InputGroup>
                                                            <InputGroupAddon align="inline-start">
                                                                <InputGroupText>
                                                                    Rp
                                                                </InputGroupText>
                                                            </InputGroupAddon>
                                                            <InputGroupInput
                                                                id={`tier_fee_${index}`}
                                                                name={`tiers[${index}][fee]`}
                                                                type="number"
                                                                min={0}
                                                                step={500}
                                                                value={
                                                                    Number.isNaN(
                                                                        tier.fee,
                                                                    )
                                                                        ? ''
                                                                        : tier.fee
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    updateTier(
                                                                        index,
                                                                        {
                                                                            fee: parseAmount(
                                                                                event
                                                                                    .target
                                                                                    .value,
                                                                            ),
                                                                        },
                                                                    )
                                                                }
                                                                placeholder="0 = gratis"
                                                                required
                                                            />
                                                        </InputGroup>
                                                        <InputError
                                                            message={
                                                                formErrors[
                                                                    `tiers.${index}.fee`
                                                                ] ??
                                                                errors[
                                                                    `tiers.${index}.fee`
                                                                ]
                                                            }
                                                        />
                                                    </div>

                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        disabled={
                                                            index === 0 ||
                                                            tiers.length === 1
                                                        }
                                                        onClick={() =>
                                                            removeTier(index)
                                                        }
                                                        aria-label={`Hapus aturan ${index + 1}`}
                                                        className="justify-self-end text-slate-400 hover:text-rose-600"
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>

                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={addTier}
                                            disabled={tiers.length >= 20}
                                            className="h-11 w-full rounded-xl border-dashed border-slate-300"
                                        >
                                            <Plus className="size-4" />
                                            Tambah Aturan
                                        </Button>

                                        <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-5">
                                            <Button
                                                type="submit"
                                                disabled={
                                                    processing || !canSubmit
                                                }
                                                className="h-11 rounded-xl font-semibold"
                                            >
                                                {processing && <Spinner />}
                                                Simpan Perubahan
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                disabled={
                                                    !isDirty || processing
                                                }
                                                onClick={() =>
                                                    setTiers(delivery_fee_tiers)
                                                }
                                                className="h-11 rounded-xl border-slate-200"
                                            >
                                                <RotateCcw className="size-4" />
                                                Reset
                                            </Button>
                                            {isDirty && (
                                                <span className="text-xs font-medium text-amber-600">
                                                    Ada perubahan belum
                                                    disimpan.
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-start gap-2 rounded-[8px] border border-blue-200 bg-blue-50 p-3">
                                            <Info className="mt-0.5 size-4 shrink-0 text-blue-700" />
                                            <p className="text-xs leading-5 text-slate-600">
                                                Baris pertama (minimal Rp 0)
                                                wajib ada sebagai biaya dasar
                                                dan tidak dapat dihapus. Isi 0
                                                pada biaya antar untuk gratis.
                                                Perubahan hanya berlaku untuk
                                                pesanan baru.
                                            </p>
                                        </div>
                                    </>
                                )}
                            </Form>
                        </CardContent>
                    </Card>

                    <Card className="rounded-xl border-slate-200 bg-white shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-950">
                                <BadgePercent className="size-5 text-blue-700" />
                                Simulasi biaya
                            </CardTitle>
                            <CardDescription className="line-clamp-1">
                                Pratinjau aturan yang kena berdasarkan subtotal
                                belanja buyer.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label
                                    htmlFor="simulation_subtotal"
                                    className="text-sm font-medium text-slate-700"
                                >
                                    Subtotal belanja buyer
                                </label>
                                <InputGroup>
                                    <InputGroupAddon align="inline-start">
                                        <InputGroupText>Rp</InputGroupText>
                                    </InputGroupAddon>
                                    <InputGroupInput
                                        id="simulation_subtotal"
                                        type="number"
                                        min={0}
                                        step={1000}
                                        value={
                                            Number.isNaN(simulationSubtotal)
                                                ? ''
                                                : simulationSubtotal
                                        }
                                        onChange={(event) =>
                                            setSimulationSubtotal(
                                                event.target.value === ''
                                                    ? Number.NaN
                                                    : Number(
                                                          event.target.value,
                                                      ),
                                            )
                                        }
                                        onBlur={() =>
                                            setSimulationSubtotal((current) =>
                                                Number.isNaN(current)
                                                    ? DEFAULT_SIMULATION_SUBTOTAL
                                                    : current,
                                            )
                                        }
                                    />
                                </InputGroup>
                            </div>
                            <dl
                                aria-live="polite"
                                className="space-y-2 rounded-[8px] border border-slate-200 bg-slate-50 p-4"
                            >
                                <div className="flex items-center justify-between text-sm">
                                    <dt className="text-slate-500">
                                        Aturan yang berlaku
                                    </dt>
                                    <dd className="font-semibold text-slate-950">
                                        {simulation.tier
                                            ? `Belanja ≥ ${formatRupiah(simulation.tier.min_spend)}`
                                            : '-'}
                                    </dd>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <dt className="text-slate-500">
                                        Biaya antar
                                    </dt>
                                    <dd
                                        className={cn(
                                            'font-semibold tabular-nums',
                                            simulation.fee > 0
                                                ? 'text-blue-700'
                                                : 'text-emerald-700',
                                        )}
                                    >
                                        {simulation.tier
                                            ? simulation.fee === 0
                                                ? 'Gratis'
                                                : formatRupiah(simulation.fee)
                                            : '-'}
                                    </dd>
                                </div>
                                <div className="flex items-center justify-between border-t border-slate-200 pt-2 text-sm">
                                    <dt className="font-medium text-slate-600">
                                        Total bayar buyer
                                    </dt>
                                    <dd className="text-base font-bold text-slate-950 tabular-nums">
                                        {formatRupiah(simulation.total)}
                                    </dd>
                                </div>
                            </dl>
                        </CardContent>
                    </Card>

                    <Card className="rounded-xl border-slate-200 bg-white shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold text-slate-950">
                                Cara kerja biaya antar
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ol className="space-y-4">
                                {[
                                    'Buyer memilih metode Diantar di checkout; sistem mencocokkan subtotal belanja dengan aturan yang berlaku lalu menambahkan biayanya ke total bayar.',
                                    'Seller atau picket memverifikasi pembayaran sampai seluruh item lunas.',
                                    'Dana biaya antar tercatat sebagai pendapatan UP Jurusan, dibagi proporsional antar UP yang terlibat.',
                                ].map((step, index) => (
                                    <li
                                        key={step}
                                        className="flex items-start gap-3"
                                    >
                                        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-blue-50 text-sm font-bold text-blue-700">
                                            {index + 1}
                                        </span>
                                        <p className="text-sm leading-6 text-slate-600">
                                            {step}
                                        </p>
                                    </li>
                                ))}
                            </ol>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </>
    );
}
