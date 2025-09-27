<?php

namespace App\Jobs;

use App\Models\ScrapeRequest;
use App\Services\ScraperService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Database\DatabaseManager;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Arr;
use Throwable;

class ScrapeCompanyJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public int $tries = 1;

    public function __construct(
        public ScrapeRequest $scrapeRequest,
    ) {
    }

    public function handle(ScraperService $scraper, DatabaseManager $db): void
    {
        $this->scrapeRequest->update([
            'status' => 'running',
            'started_at' => now(),
        ]);

        $results = $scraper->forCompany($this->scrapeRequest->keyword);

        $db->transaction(function () use ($results) {
            $this->scrapeRequest->results()->delete();

            foreach ($results as $result) {
                $this->scrapeRequest->results()->create([
                    'title' => Arr::get($result, 'title', 'Unknown role'),
                    'company' => Arr::get($result, 'company'),
                    'location' => Arr::get($result, 'location'),
                    'url' => Arr::get($result, 'url'),
                    'published_at' => Arr::get($result, 'published_at'),
                    'payload' => Arr::get($result, 'payload', []),
                ]);
            }

            $this->scrapeRequest->update([
                'status' => 'succeeded',
                'results_count' => count($results),
                'finished_at' => now(),
                'eta' => count($results) > 0 ? 'Complete' : 'No roles found',
            ]);
        });
    }

    public function failed(Throwable $exception): void
    {
        $this->scrapeRequest->update([
            'status' => 'failed',
            'finished_at' => now(),
            'error_message' => $exception->getMessage(),
            'eta' => 'Failed',
        ]);
    }
}
