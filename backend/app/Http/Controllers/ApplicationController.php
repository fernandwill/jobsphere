<?php

namespace App\Http\Controllers;

use App\Enums\ApplicationStatus;
use App\Http\Resources\ApplicationResource;
use App\Models\Application;
use App\Support\ApplicationReportBuilder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;

class ApplicationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        abort_unless($user, 401);

        $applications = $user->applications()
            ->latest('last_activity_at')
            ->latest()
            ->get();

        $report = ApplicationReportBuilder::fromCollection($applications);

        return ApplicationResource::collection($applications)
            ->additional([
                'meta' => [
                    'pipeline' => $report->pipeline(),
                    'activity' => $report->timeline(),
                    'counts' => $report->counts(),
                ],
            ])
            ->response();
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        abort_unless($user, 401);

        $validated = $this->validatePayload($request);

        $application = $user->applications()->create([
            'company' => $validated['company'],
            'job_title' => $validated['job_title'],
            'location' => $validated['location'] ?? null,
            'mode' => $validated['mode'] ?? null,
            'source' => $validated['source'] ?? null,
            'status' => ApplicationStatus::from($validated['status'] ?? ApplicationStatus::Applied->value),
            'job_url' => $validated['job_url'] ?? null,
            'applied_at' => isset($validated['applied_at']) ? Carbon::parse($validated['applied_at']) : null,
            'last_activity_at' => isset($validated['last_activity_at'])
                ? Carbon::parse($validated['last_activity_at'])
                : now(),
            'notes' => $validated['notes'] ?? null,
        ]);

        return (new ApplicationResource($application))
            ->response()
            ->setStatusCode(201);
    }

    public function update(Request $request, Application $application): JsonResponse
    {
        $user = $request->user();

        abort_unless($user && $application->user_id === $user->getKey(), 403);

        $validated = $this->validatePayload($request, isUpdate: true);

        if (array_key_exists('company', $validated)) {
            $application->company = $validated['company'];
        }

        if (array_key_exists('job_title', $validated)) {
            $application->job_title = $validated['job_title'];
        }

        foreach (['location', 'mode', 'source', 'job_url', 'notes'] as $attribute) {
            if (array_key_exists($attribute, $validated)) {
                $application->{$attribute} = $validated[$attribute];
            }
        }

        if (array_key_exists('applied_at', $validated)) {
            $application->applied_at = $validated['applied_at']
                ? Carbon::parse($validated['applied_at'])
                : null;
        }

        if (array_key_exists('last_activity_at', $validated)) {
            $application->last_activity_at = $validated['last_activity_at']
                ? Carbon::parse($validated['last_activity_at'])
                : null;
        }

        if (array_key_exists('status', $validated)) {
            $newStatus = ApplicationStatus::from($validated['status']);

            if ($application->status !== $newStatus) {
                $application->last_activity_at = $validated['last_activity_at']
                    ? Carbon::parse($validated['last_activity_at'])
                    : now();
            }

            $application->status = $newStatus;
        }

        $application->save();

        return (new ApplicationResource($application))->response();
    }

    protected function validatePayload(Request $request, bool $isUpdate = false): array
    {
        $rules = [
            'company' => [$isUpdate ? 'sometimes' : 'required', 'string', 'max:255'],
            'job_title' => [$isUpdate ? 'sometimes' : 'required', 'string', 'max:255'],
            'location' => ['sometimes', 'nullable', 'string', 'max:255'],
            'mode' => ['sometimes', 'nullable', Rule::in(['remote', 'hybrid', 'onsite'])],
            'source' => ['sometimes', 'nullable', Rule::in(['scraped', 'manual'])],
            'status' => ['sometimes', 'nullable', Rule::in(ApplicationStatus::values())],
            'job_url' => ['sometimes', 'nullable', 'url', 'max:2048'],
            'applied_at' => ['sometimes', 'nullable', 'date'],
            'last_activity_at' => ['sometimes', 'nullable', 'date'],
            'notes' => ['sometimes', 'nullable', 'string'],
        ];

        return $request->validate($rules);
    }
}
