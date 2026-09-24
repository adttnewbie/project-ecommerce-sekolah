<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $notificationTitle }}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: Inter, 'Plus Jakarta Sans', system-ui, sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 32px 16px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 18px; overflow: hidden;">
                    <tr>
                        <td style="padding: 28px 28px 0 28px;">
                            <p style="margin: 0; font-size: 17px; font-weight: 700; color: #0f172a;">EduCart</p>
                            <p style="margin: 4px 0 0 0; font-size: 13px; color: #64748b;">Jual beli aman di lingkungan sekolah</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 20px 28px 0 28px;">
                            <p style="margin: 0; font-size: 15px; color: #334155;">Halo {{ $recipientName }},</p>
                            <h1 style="margin: 8px 0 0 0; font-size: 20px; line-height: 1.4; color: #0f172a;">{{ $notificationTitle }}</h1>
                            <p style="margin: 8px 0 0 0; font-size: 15px; line-height: 1.6; color: #475569;">{{ $notificationDescription }}</p>
                        </td>
                    </tr>
                    @if ($actionUrl)
                        <tr>
                            <td style="padding: 20px 28px 0 28px;">
                                <a href="{{ $actionUrl }}" style="display: inline-block; background-color: #0080ff; color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none; padding: 12px 24px; border-radius: 12px;">{{ $actionLabel }}</a>
                            </td>
                        </tr>
                    @endif
                    <tr>
                        <td style="padding: 20px 28px 28px 28px;">
                            <p style="margin: 0; padding-top: 16px; border-top: 1px solid #f1f5f9; font-size: 12px; line-height: 1.6; color: #94a3b8;">Email ini dikirim otomatis oleh EduCart. Kamu bisa mengatur notifikasi email di Pengaturan &gt; Notifikasi. Jangan membalas email ini.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
