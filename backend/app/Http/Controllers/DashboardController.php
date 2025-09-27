<?php

namespace App\Http\Controllers;

use App\Models\ScrapeRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $requests = ScrapeRequest::with('results')
            ->recent()
            ->get();

        return Inertia::render('Dashboard', [
            'stats' => $this->buildStats($requests),
            'pipeline' => $this->buildPipeline($requests),
            'activity' => $this->buildActivity($requests),
            'followUps' => $this->buildFollowUps($requests),
        ]);
    }

    protected function buildStats($requests): array
    {
        $active = $requests->whereIn('status', ['queued', 'running'])->count();
        $completed = $requests->where('status', 'succeeded')->count();
        $failed = $requests->where('status', 'failed')->count();
        $roles = $requests->sum('results_count');

        return [
            [
                'label' => 'Active scrape jobs',
                'value' => $active,
                'icon' => 'pipeline',
                'delta' => $completed > 0 ? round(($active / max($completed, 1)) * 100) : 0,
            ],
            [
                'label' => 'Completed scrapes',
                'value' => $completed,
                'icon' => 'offers',
            ],
            [
                'label' => 'Failed attempts',
                'value' => $failed,
                'icon' => 'growth',
            ],
            [
                'label' => 'Roles discovered',
                'value' => $roles,
                'icon' => 'interviews',
            ],
        ];
    }

    protected function buildPipeline($requests): array
    {
        $descriptions = [
            'queued' => 'Waiting for worker availability',
            'running' => 'Currently crawling sources',
            'succeeded' => 'Review newly discovered roles',
            'failed' => 'Check logs and retry scrape',
        ];

        return collect(['queued', 'running', 'succeeded', 'failed'])
            ->map(function (string $status) use ($requests, $descriptions) {
                $items = $requests->where('status', $status);

                return [
                    'stage' => $status,
                    'summary' => $descriptions[$status] ?? 'Status update',
                    'count' => $items->count(),
                    'jobs' => $items->take(4)->map(function (ScrapeRequest $request) use ($status) {
                        $latestResult = $request->results->sortByDesc('created_at')->first();
                        $timestamp = $request->started_at ?? $request->queued_at;

                        return [
                            'role' => $latestResult?->title ?? sprintf('%s opportunities', Str::headline($request->keyword)),
                            'company' => $latestResult?->company ?? Str::headline($request->keyword),
                            'status' => Str::headline($status),
                            'applied_at' => optional($timestamp)->diffForHumans() ?? 'just now',
                        ];
                    })->values(),
                ];
            })
            ->values()
            ->all();
    }

    protected function buildActivity($requests): array
    {
        $results = $requests
            ->flatMap(fn (ScrapeRequest $request) => $request->results)
            ->sortByDesc('created_at')
            ->take(5);

        return $results->map(function ($result) {
            return [
                'title' => $result->title,
                'description' => sprintf('Found via %s search', Str::headline(optional($result->request)->keyword ?? 'scraper')),
                'timestamp' => optional($result->created_at)->diffForHumans() ?? 'just now',
            ];
        })->values()->all();
    }

    protected function buildFollowUps($requests): array
    {
        return $requests
            ->where('status', 'succeeded')
            ->flatMap(fn (ScrapeRequest $request) => $request->results)
            ->sortByDesc('published_at')
            ->take(3)
            ->map(function ($result, $index) {
                $published = $result->published_at instanceof Carbon ? $result->published_at : Carbon::parse($result->published_at ?? now());
                $dueIn = $published->diffForHumans(now()->addDays(2), ['parts' => 2, 'syntax' => Carbon::DIFF_ABSOLUTE]);

                return [
                    'role' => $result->title,
                    'company' => $result->company ?? 'Unknown',
                    'due_in' => $dueIn,
                    'completion' => 30 + ($index * 25),
                ];
            })
            ->values()
            ->all();
    }
}
