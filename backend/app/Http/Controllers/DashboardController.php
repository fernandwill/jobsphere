<?php

namespace App\Http\Controllers;

use App\Enums\ApplicationStatus;
use App\Models\Application;
use App\Models\ScrapeRequest;
use App\Support\ApplicationReportBuilder;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $requests = ScrapeRequest::with('results')
            ->recent()
            ->get();

        $applications = $request->user()
            ?->applications()
            ->latest('last_activity_at')
            ->latest()
            ->get() ?? collect();

        $report = ApplicationReportBuilder::fromCollection($applications);

        return Inertia::render('Dashboard', [
            'stats' => $this->buildStats($requests),
            'pipeline' => $report->pipeline(),
            'activity' => $report->activity(),
            'followUps' => $this->buildFollowUps($requests),
            'statusDistribution' => $this->statusDistribution($applications),
            'applicationsByPeriod' => $this->applicationsByPeriod($applications),
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

    /**
     * @param Collection<int, Application> $applications
     * @return array<int, array{status: string, label: string, count: int}>
     */
    protected function statusDistribution(Collection $applications): array
    {
        return collect(ApplicationStatus::cases())
            ->map(function (ApplicationStatus $status) use ($applications) {
                $count = $applications
                    ->filter(fn (Application $application) => $application->status === $status)
                    ->count();

                return [
                    'status' => $status->value,
                    'label' => $status->label(),
                    'count' => $count,
                ];
            })
            ->filter(fn (array $item) => $item['count'] > 0)
            ->values()
            ->all();
    }

    /**
     * @param Collection<int, Application> $applications
     * @return array<int, array{period: string, label: string, count: int}>
     */
    protected function applicationsByPeriod(Collection $applications, int $months = 6): array
    {
        $buckets = $applications->reduce(function (array $carry, Application $application) {
            $timestamp = $application->applied_at ?? $application->created_at;

            if (! $timestamp) {
                return $carry;
            }

            $date = $timestamp instanceof Carbon ? $timestamp : Carbon::parse($timestamp);
            $key = $date->copy()->startOfMonth()->format('Y-m');

            $carry[$key] = ($carry[$key] ?? 0) + 1;

            return $carry;
        }, []);

        $currentMonth = Carbon::now()->startOfMonth();

        return collect(range($months - 1, 0))
            ->map(fn (int $index) => $currentMonth->copy()->subMonths($index))
            ->map(function (Carbon $month) use ($buckets) {
                $key = $month->format('Y-m');

                return [
                    'period' => $key,
                    'label' => $month->format('M Y'),
                    'count' => $buckets[$key] ?? 0,
                ];
            })
            ->values()
            ->all();
    }
}
