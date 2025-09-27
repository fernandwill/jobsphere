<?php

namespace App\Models;

use App\Enums\ApplicationStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Application extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'company',
        'job_title',
        'location',
        'mode',
        'source',
        'status',
        'job_url',
        'applied_at',
        'last_activity_at',
        'notes',
    ];

    protected $casts = [
        'applied_at' => 'date',
        'last_activity_at' => 'datetime',
        'status' => ApplicationStatus::class,
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
