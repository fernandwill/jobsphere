<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Application */
class ApplicationResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->getKey(),
            'title' => $this->job_title,
            'company' => $this->company,
            'location' => $this->location,
            'mode' => $this->mode ?? 'remote',
            'status' => $this->status->value,
            'statusLabel' => $this->status->label(),
            'source' => $this->source ?? 'manual',
            'postedAt' => optional($this->applied_at)->toDateString(),
            'lastActivity' => optional($this->last_activity_at ?? $this->updated_at)->toIso8601String(),
            'notes' => $this->notes,
            'url' => $this->job_url,
        ];
    }
}
