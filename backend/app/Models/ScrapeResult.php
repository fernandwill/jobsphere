<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ScrapeResult extends Model
{
    use HasFactory;

    protected $fillable = [
        'scrape_request_id',
        'title',
        'company',
        'location',
        'url',
        'published_at',
        'payload',
    ];

    protected $casts = [
        'payload' => 'array',
        'published_at' => 'datetime',
    ];

    public function request(): BelongsTo
    {
        return $this->belongsTo(ScrapeRequest::class, 'scrape_request_id');
    }
}
