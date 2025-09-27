<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class ScrapeRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'id',
        'keyword',
        'status',
        'results_count',
        'queued_at',
        'started_at',
        'finished_at',
        'eta',
        'error_message',
    ];

    protected $casts = [
        'queued_at' => 'datetime',
        'started_at' => 'datetime',
        'finished_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::creating(function (self $request) {
            if (empty($request->id)) {
                $request->id = (string) Str::uuid();
            }

            if (empty($request->queued_at)) {
                $request->queued_at = now();
            }
        });
    }

    public function results(): HasMany
    {
        return $this->hasMany(ScrapeResult::class);
    }

    public function scopeRecent(Builder $query): Builder
    {
        return $query->orderByDesc('queued_at');
    }
}
