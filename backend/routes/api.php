<?php

use App\Http\Controllers\ScrapeRequestController;
use Illuminate\Support\Facades\Route;

Route::prefix('scrapes')->group(function () {
    Route::get('/', [ScrapeRequestController::class, 'index'])->name('scrapes.index');
    Route::post('/', [ScrapeRequestController::class, 'store'])->name('scrapes.store');
    Route::get('{scrapeRequest}', [ScrapeRequestController::class, 'show'])->name('scrapes.show');
});
