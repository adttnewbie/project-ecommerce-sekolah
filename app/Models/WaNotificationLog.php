<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WaNotificationLog extends Model
{
    protected $fillable = ['template_key', 'to', 'payload', 'status', 'wuzapi_msg_id', 'error', 'attempts'];

    protected $casts = ['payload' => 'array', 'attempts' => 'integer'];
}
