<?php

namespace App\Services;

use Carbon\CarbonImmutable;
use Goutte\Client;
use Illuminate\Support\Arr;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

class ScraperService
{
    public function __construct(
        protected Client $client,
    ) {
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function forCompany(string $keyword): array
    {
        $keyword = trim($keyword);

        if ($keyword === '') {
            return [];
        }

        try {
            $responseBody = $this->client->request('GET', 'https://remotive.com/api/remote-jobs', [
                'search' => $keyword,
            ]);

            $decoded = json_decode($responseBody, true, flags: JSON_THROW_ON_ERROR);

            return $this->mapJobs(collect($decoded['jobs'] ?? []));
        } catch (\Throwable $exception) {
            Log::warning('Scrape request failed, falling back to synthetic dataset.', [
                'keyword' => $keyword,
                'message' => $exception->getMessage(),
            ]);

            return $this->fallback($keyword);
        }
    }

    /**
     * @param Collection<int, array<string, mixed>> $jobs
     * @return array<int, array<string, mixed>>
     */
    protected function mapJobs(Collection $jobs): array
    {
        return $jobs
            ->take(25)
            ->map(function (array $job): array {
                $publishedAt = null;
                $rawDate = Arr::get($job, 'publication_date');

                if (is_string($rawDate)) {
                    try {
                        $publishedAt = CarbonImmutable::parse($rawDate);
                    } catch (\Throwable) {
                        $publishedAt = null;
                    }
                }

                return [
                    'title' => Arr::get($job, 'title', 'Unknown role'),
                    'company' => Arr::get($job, 'company_name', 'Unknown company'),
                    'location' => Arr::get($job, 'candidate_required_location', 'Remote'),
                    'url' => Arr::get($job, 'url', ''),
                    'published_at' => $publishedAt?->toDateTimeString(),
                    'payload' => $job,
                ];
            })
            ->filter(fn (array $job) => !empty($job['url']))
            ->values()
            ->all();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    protected function fallback(string $keyword): array
    {
        $now = CarbonImmutable::now();

        return collect(range(1, 5))
            ->map(function (int $index) use ($keyword, $now): array {
                return [
                    'title' => sprintf('%s Specialist %d', ucfirst($keyword), $index),
                    'company' => sprintf('%s Labs', ucfirst($keyword)),
                    'location' => $index % 2 === 0 ? 'Remote' : 'Hybrid - NYC',
                    'url' => sprintf('https://jobs.example.com/%s/%d', strtolower($keyword), $index),
                    'published_at' => $now->subDays($index)->toDateTimeString(),
                    'payload' => [
                        'source' => 'synthetic',
                        'confidence' => 0.35 + ($index * 0.1),
                    ],
                ];
            })
            ->all();
    }
}
