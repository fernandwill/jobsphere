<?php

namespace App\Http\Controllers;

use App\Jobs\ScrapeCompanyJob;
use App\Models\ScrapeRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ScrapeRequestController extends Controller
{
    public function index(): JsonResponse
    {
        $requests = ScrapeRequest::with(['results' => fn ($query) => $query->latest()->take(5)])
            ->recent()
            ->limit(10)
            ->get();

        return response()->json([
            'data' => $requests->map(fn (ScrapeRequest $request) => $this->toArray($request)),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'keyword' => ['required', 'string', 'max:120'],
        ]);

        $scrapeRequest = ScrapeRequest::create([
            'keyword' => $validated['keyword'],
            'status' => 'queued',
            'eta' => 'Under a minute',
        ]);

        ScrapeCompanyJob::dispatch($scrapeRequest);

        return response()->json([
            'data' => $this->toArray($scrapeRequest),
        ], 202);
    }

    public function show(ScrapeRequest $scrapeRequest): JsonResponse
    {
        $scrapeRequest->load('results');

        return response()->json([
            'data' => $this->toArray($scrapeRequest, includeResults: true),
        ]);
    }

    protected function toArray(ScrapeRequest $request, bool $includeResults = false): array
    {
        return [
            'id' => $request->id,
            'keyword' => $request->keyword,
            'company' => Str::headline($request->keyword),
            'status' => $request->status,
            'roleCount' => $request->results_count,
            'queuedAt' => optional($request->queued_at)?->toIso8601String(),
            'startedAt' => optional($request->started_at)?->toIso8601String(),
            'finishedAt' => optional($request->finished_at)?->toIso8601String(),
            'eta' => $request->eta ?? 'Pending',
            'error' => $request->error_message,
            'results' => $includeResults
                ? $request->results->map(fn ($result) => [
                    'id' => $result->id,
                    'title' => $result->title,
                    'company' => $result->company,
                    'location' => $result->location,
                    'url' => $result->url,
                    'publishedAt' => optional($result->published_at)?->toIso8601String(),
                    'payload' => $result->payload,
                ])->all()
                : null,
        ];
    }
}
