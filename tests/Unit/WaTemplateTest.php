<?php

test('all eleven templates render without leftover placeholders', function () {
    $templates = require __DIR__.'/../../config/wa-templates.php';
    expect($templates)->toHaveKeys([
        'order.baru', 'order.bayar_lunas', 'order.status',
        'seller.pengajuan', 'seller.keputusan',
        'picket.laporan', 'produk.moderasi',
        'konsinyasi.pengajuan', 'konsinyasi.keputusan', 'konsinyasi.diterima', 'konsinyasi.terjual',
        'payout.siap', 'payout.dibayar',
        'stok.rendah', 'order.reminder', 'picket.akun',
    ]);
    foreach ($templates as $key => $tpl) {
        $rendered = str_replace(['{trx}', '{buyer}', '{seller}', '{total}', '{status}', '{alasan}', '{up}', '{produk}', '{komisi}', '{sisa}'], 'X', $tpl);
        expect($rendered)->not->toContain('{')->and($rendered)->not->toContain('}');
    }
});
