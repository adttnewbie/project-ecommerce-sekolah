import { Form, Head, Link } from '@inertiajs/react';
import {
    CheckCircle2,
    Clock3,
    MessageSquareWarning,
    Star,
    XCircle,
} from 'lucide-react';
import InputError from '@/components/input-error';
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';

type PendingReview = {
    id: number;
    rating: number;
    comment: string | null;
    submitted_at: string;
    buyer: {
        id: number;
        name: string;
        email: string;
    };
    product: {
        name: string;
        slug: string;
    };
};

type AdminReviewModerationProps = {
    reviews: {
        data: PendingReview[];
        total: number;
    };
};

export default function AdminReviewModeration({
    reviews,
}: AdminReviewModerationProps) {
    return (
        <>
            <Head title="Moderasi Ulasan" />
            <main className="min-h-[calc(100svh-4rem)] bg-slate-50 p-4 sm:p-6">
                <div className="space-y-6">
                    <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                        <div>
                            <div className="mb-2 flex flex-wrap items-center gap-2">
                                <Badge className="rounded-[6px] bg-blue-50 text-blue-700">
                                    <MessageSquareWarning className="size-3.5" />
                                    Admin Center
                                </Badge>
                                <Badge className="rounded-[6px] bg-amber-50 text-amber-700">
                                    {reviews.total} pending
                                </Badge>
                            </div>
                            <h1 className="text-2xl font-semibold text-slate-950">
                                Moderasi Ulasan
                            </h1>
                            <p className="mt-1 max-w-2xl text-sm text-slate-500">
                                Tinjau ulasan pembeli sebelum tampil di halaman
                                produk.
                            </p>
                        </div>
                    </section>

                    <section className="grid grid-cols-1 gap-4">
                        {reviews.data.length === 0 && (
                            <Card className="rounded-[8px] border border-slate-100 bg-white shadow-sm">
                                <CardContent className="p-8 text-center text-sm text-slate-500">
                                    Tidak ada ulasan pending.
                                </CardContent>
                            </Card>
                        )}

                        {reviews.data.map((review) => (
                            <Card
                                key={review.id}
                                className="gap-0 rounded-[8px] border border-slate-100 bg-white py-0 shadow-sm"
                            >
                                <CardHeader className="flex-row items-start border-b border-slate-100 p-6">
                                    <div className="min-w-0 space-y-2">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Badge className="rounded-[6px] bg-amber-50 text-amber-700">
                                                <Clock3 className="size-3.5" />
                                                Pending
                                            </Badge>
                                            <span className="inline-flex items-center gap-0.5">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Star
                                                        key={star}
                                                        className={`size-4 ${
                                                            review.rating >=
                                                            star
                                                                ? 'fill-amber-400 text-amber-400'
                                                                : 'text-slate-300'
                                                        }`}
                                                    />
                                                ))}
                                            </span>
                                        </div>
                                        <CardTitle className="text-lg font-semibold text-slate-950">
                                            {review.product.name}
                                        </CardTitle>
                                        <CardDescription>
                                            {review.submitted_at}
                                        </CardDescription>
                                    </div>
                                    <CardAction>
                                        <Link
                                            href={`/catalog/${review.product.slug}`}
                                            className="text-sm font-medium text-blue-700 hover:text-blue-800"
                                        >
                                            Lihat produk
                                        </Link>
                                    </CardAction>
                                </CardHeader>
                                <CardContent className="space-y-5 p-6">
                                    {review.comment ? (
                                        <p className="text-sm leading-6 text-slate-600">
                                            “{review.comment}”
                                        </p>
                                    ) : (
                                        <p className="text-sm text-slate-400 italic">
                                            Tanpa komentar.
                                        </p>
                                    )}

                                    <div className="flex flex-wrap items-center gap-3 rounded-[8px] bg-slate-50 p-3 text-sm text-slate-600">
                                        <span className="font-medium text-slate-800">
                                            {review.buyer.name}
                                        </span>
                                        <span>{review.buyer.email}</span>
                                        <span className="text-slate-400">
                                            {review.submitted_at}
                                        </span>
                                    </div>

                                    <div className="grid gap-3 lg:grid-cols-[auto_1fr]">
                                        <Form
                                            action={`/admin/reviews/${review.id}/approve`}
                                            method="post"
                                            disableWhileProcessing
                                        >
                                            {({ processing }) => (
                                                <Button
                                                    type="submit"
                                                    className="h-10 w-full rounded-[8px] bg-emerald-600 px-4 text-white hover:bg-emerald-700 lg:w-auto"
                                                    disabled={processing}
                                                >
                                                    {processing ? (
                                                        <Spinner />
                                                    ) : (
                                                        <CheckCircle2 className="size-4" />
                                                    )}
                                                    Setujui
                                                </Button>
                                            )}
                                        </Form>

                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className="h-10 w-fit rounded-[8px] border-rose-200 bg-white text-rose-700 hover:bg-rose-50 hover:text-rose-800"
                                                >
                                                    <XCircle className="size-4" />
                                                    Tolak
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <Form
                                                    action={`/admin/reviews/${review.id}/reject`}
                                                    method="post"
                                                    disableWhileProcessing
                                                >
                                                    {({
                                                        processing,
                                                        errors,
                                                    }) => (
                                                        <div className="grid gap-5">
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>
                                                                    Tolak
                                                                    ulasan?
                                                                </AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Ulasan tidak
                                                                    akan tampil
                                                                    di halaman
                                                                    produk dan
                                                                    pembeli
                                                                    menerima
                                                                    notifikasi
                                                                    beserta
                                                                    alasan.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>

                                                            <div>
                                                                <Textarea
                                                                    name="reason"
                                                                    rows={4}
                                                                    required
                                                                    placeholder="Alasan penolakan"
                                                                    aria-invalid={Boolean(
                                                                        errors.reason,
                                                                    )}
                                                                    className="min-h-28"
                                                                />
                                                                <InputError
                                                                    message={
                                                                        errors.reason
                                                                    }
                                                                />
                                                            </div>

                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel
                                                                    asChild
                                                                >
                                                                    <Button
                                                                        type="button"
                                                                        variant="outline"
                                                                        className="rounded-[8px]"
                                                                    >
                                                                        Batal
                                                                    </Button>
                                                                </AlertDialogCancel>
                                                                <Button
                                                                    type="submit"
                                                                    className="rounded-[8px] bg-rose-600 text-white hover:bg-rose-700"
                                                                    disabled={
                                                                        processing
                                                                    }
                                                                >
                                                                    {processing ? (
                                                                        <Spinner />
                                                                    ) : (
                                                                        <XCircle className="size-4" />
                                                                    )}
                                                                    Tolak
                                                                </Button>
                                                            </AlertDialogFooter>
                                                        </div>
                                                    )}
                                                </Form>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </section>
                </div>
            </main>
        </>
    );
}

AdminReviewModeration.layout = {
    breadcrumbs: [
        {
            title: 'Moderasi Ulasan',
            href: '/admin/reviews',
        },
    ],
};
