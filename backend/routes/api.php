<?php

use App\Http\Controllers\ApplicationController;
use App\Http\Controllers\ScrapeRequestController;
use Illuminate\Support\Facades\Route;

Route::prefix('scrapes')->group(function () {
    Route::get('/', [ScrapeRequestController::class, 'index'])->name('scrapes.index');
    Route::post('/', [ScrapeRequestController::class, 'store'])->name('scrapes.store');
    Route::get('{scrapeRequest}', [ScrapeRequestController::class, 'show'])->name('scrapes.show');
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('applications', [ApplicationController::class, 'index'])->name('applications.index');
    Route::post('applications', [ApplicationController::class, 'store'])->name('applications.store');
    Route::match(['put', 'patch'], 'applications/{application}', [ApplicationController::class, 'update'])
        ->name('applications.update');
});
