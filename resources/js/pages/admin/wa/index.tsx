import { Head, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

type Log = {
    id: number;
    template_key: string;
    to: string;
    status: string;
    error?: string | null;
    created_at: string;
};

type Props = {
    connected: boolean;
    qr?: string | null;
    logs: { data: Log[] };
};

export default function WaDashboard() {
    const { connected, qr, logs } = usePage().props as unknown as Props;

    return (
        <div className="space-y-4 p-6">
            <Head title="WhatsApp API" />
            <h1 className="text-xl font-semibold">WhatsApp API</h1>
            {!connected ? (
                <Card className="border-red-300 bg-red-50">
                    <CardHeader>
                        <CardTitle className="text-red-700">
                            Perlu scan QR — session disconnected.
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {qr ? (
                            <img src={qr} alt="WA QR" className="mt-2 h-48 w-48" />
                        ) : (
                            <p className="text-sm">
                                QR belum tersedia, refresh halaman.
                            </p>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <p className="rounded border border-green-300 bg-green-50 p-3 text-green-800">
                    Connected (sekolah-official)
                </p>
            )}
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Template</TableHead>
                        <TableHead>To</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {logs.data.map((l) => (
                        <TableRow key={l.id}>
                            <TableCell>{l.id}</TableCell>
                            <TableCell>{l.template_key}</TableCell>
                            <TableCell>{l.to}</TableCell>
                            <TableCell>{l.status}</TableCell>
                            <TableCell>
                                {l.status === 'failed' && (
                                    <Button
                                        size="sm"
                                        onClick={() =>
                                            router.post(`/admin/wa/${l.id}/retry`)
                                        }
                                    >
                                        Retry
                                    </Button>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
