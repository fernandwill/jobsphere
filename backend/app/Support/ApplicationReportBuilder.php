<?php

namespace App\Support;

use App\Enums\ApplicationStatus;
use App\Models\Application;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

class ApplicationReportBuilder
{
    /**
     * @param Collection<int, Application> $applications
     */
    public function __construct(
        protected Collection $applications
    ) {
    }

    public static function fromCollection(Collection $applications): self
    {
        return new self($applications);
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function pipeline(): array
    {
        return collect(ApplicationStatus::cases())
            ->map(function (ApplicationStatus $status) {
                $items = $this->applications->filter(
                    fn (Application $application) => $application->status === $status
                );

                return [
                    'stage' => $status->value,
                    'label' => $status->label(),
                    'summary' => $this->summaryFor($status),
                    'count' => $items->count(),
                    'jobs' => $items
                        ->sortByDesc(fn (Application $app) => $app->last_activity_at ?? $app->updated_at)
                        ->take(4)
                        ->map(function (Application $application) use ($status) {
                            $appliedAt = $application->applied_at instanceof Carbon
                                ? $application->applied_at
                                : ($application->applied_at ? Carbon::parse($application->applied_at) : $application->created_at);

                            return [
                                'id' => (string) $application->getKey(),
                                'role' => $application->job_title,
                                'company' => $application->company,
                                'status' => $status->label(),
                                'applied_at' => optional($appliedAt)->diffForHumans() ?? 'just now',
                            ];
                        })
                        ->values()
                        ->all(),
                ];
            })
            ->values()
            ->all();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function activity(int $limit = 5): array
    {
        return $this->applications
            ->sortByDesc(fn (Application $application) => $application->last_activity_at ?? $application->updated_at)
            ->take($limit)
            ->map(function (Application $application) {
                $timestamp = $application->last_activity_at ?? $application->updated_at;

                return [
                    'title' => $application->job_title,
                    'description' => $application->notes
                        ? $application->notes
                        : sprintf(
                            '%s status updated to %s',
                            $application->company,
                            $application->status->label()
                        ),
                    'timestamp' => optional($timestamp)->diffForHumans() ?? 'just now',
                ];
            })
            ->values()
            ->all();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function timeline(int $limit = 10): array
    {
        return $this->applications
            ->sortByDesc(fn (Application $application) => $application->last_activity_at ?? $application->updated_at)
            ->take($limit)
            ->map(function (Application $application) {
                $timestamp = $application->last_activity_at ?? $application->updated_at;

                return [
                    'id' => (string) $application->getKey(),
                    'timestamp' => optional($timestamp)->toIso8601String(),
                    'summary' => sprintf(
                        '%s — %s',
                        $application->company,
                        $application->job_title
                    ),
                    'status' => $application->status->value,
                    'company' => $application->company,
                    'details' => $application->notes,
                ];
            })
            ->values()
            ->all();
    }

    /**
     * @return array{total:int, byStatus: array<string,int>}
     */
    public function counts(): array
    {
        $byStatus = [];

        foreach (ApplicationStatus::cases() as $status) {
            $byStatus[$status->value] = $this->applications
                ->filter(fn (Application $application) => $application->status === $status)
                ->count();
        }

        return [
            'total' => $this->applications->count(),
            'byStatus' => $byStatus,
        ];
    }

    protected function summaryFor(ApplicationStatus $status): string
    {
        return match ($status) {
            ApplicationStatus::Applied => 'Awaiting recruiter review',
            ApplicationStatus::OnlineAssessment => 'Assessment in progress',
            ApplicationStatus::Interview => 'Interviews scheduled or ongoing',
            ApplicationStatus::Passed => 'Offers or final approvals',
            ApplicationStatus::Rejected => 'Closed and archived',
        };
    }
}
