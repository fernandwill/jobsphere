<?php

namespace App\Http\Controllers;

use App\Models\ScrapeRequest;
use App\Support\ApplicationReportBuilder;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
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
}
