<?php

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;
use App\Support\Inertia;

Route::get('/', function () {
return Inertia::render('Dashboard', [
        'stats' => [
            [
                'label' => 'Active applications',
                'value' => 18,
                'delta' => 12,
                'icon' => 'pipeline',
            ],
            [
                'label' => 'Interviews scheduled',
                'value' => 5,
                'delta' => 8,
                'icon' => 'interviews',
            ],
            [
                'label' => 'Offers extended',
                'value' => 2,
                'delta' => 0,
                'icon' => 'offers',
            ],
            [
                'label' => 'Pipeline velocity (days)',
                'value' => 9,
                'delta' => -3,
                'icon' => 'growth',
            ],
        ],
        'pipeline' => [
            [
                'stage' => 'applied',
                'summary' => 'Waiting for recruiter response',
                'count' => 7,
                'jobs' => [
                    [
                        'role' => 'Senior Frontend Engineer',
                        'company' => 'Acme Labs',
                        'status' => 'Application submitted',
                        'applied_at' => 'Sept 18',
                    ],
                    [
                        'role' => 'Product Designer',
                        'company' => 'Craftly',
                        'status' => 'Portfolio reviewed',
                        'applied_at' => 'Sept 15',
                    ],
                ],
            ],
            [
                'stage' => 'interviewing',
                'summary' => 'Prepare for upcoming interviews',
                'count' => 5,
                'jobs' => [
                    [
                        'role' => 'Staff React Engineer',
                        'company' => 'Northwind',
                        'status' => 'Technical screen scheduled',
                        'applied_at' => 'Sept 12',
                    ],
                    [
                        'role' => 'Platform Engineer',
                        'company' => 'Orbit Analytics',
                        'status' => 'Onsite confirmed',
                        'applied_at' => 'Sept 8',
                    ],
                ],
            ],
            [
                'stage' => 'offer',
                'summary' => 'Evaluating offer details',
                'count' => 2,
                'jobs' => [
                    [
                        'role' => 'Lead UX Researcher',
                        'company' => 'Lumina AI',
                        'status' => 'Offer under review',
                        'applied_at' => 'Sept 5',
                    ],
                ],
            ],
            [
                'stage' => 'rejected',
                'summary' => 'Archive learnings and iterate',
                'count' => 4,
                'jobs' => [
                    [
                        'role' => 'Solutions Architect',
                        'company' => 'Aperture',
                        'status' => 'Feedback pending',
                        'applied_at' => 'Aug 22',
                    ],
                ],
            ],
        ],
        'activity' => [
            [
                'title' => 'Sent thank-you note to Orbit Analytics',
                'description' => 'Followed up after technical round with tailored recap.',
                'timestamp' => '2 hours ago',
            ],
            [
                'title' => 'Received product brief from Lumina AI',
                'description' => 'Reviewed assignment and shared clarifying questions.',
                'timestamp' => 'Yesterday',
            ],
            [
                'title' => 'Referred by Samira to Northwind',
                'description' => 'Referral accepted and recruiter intro scheduled.',
                'timestamp' => '2 days ago',
            ],
        ],
        'followUps' => [
            [
                'role' => 'Staff React Engineer',
                'company' => 'Northwind',
                'due_in' => '2 days',
                'completion' => 40,
            ],
            [
                'role' => 'Product Designer',
                'company' => 'Craftly',
                'due_in' => 'Tomorrow',
                'completion' => 65,
            ],
            [
                'role' => 'Platform Engineer',
                'company' => 'Orbit Analytics',
                'due_in' => 'Today',
                'completion' => 80,
            ],
        ],
    ]);
})->name('home');

Route::prefix('auth')->name('oauth.')->group(function () {
    Route::get('{provider}/redirect', [AuthController::class, 'redirect'])
        ->whereIn('provider', ['github', 'google'])
        ->name('redirect');

    Route::get('{provider}/callback', [AuthController::class, 'callback'])
        ->whereIn('provider', ['github', 'google'])
        ->name('callback');
});

Route::post('logout', [AuthController::class, 'logout'])
    ->middleware('auth')
    ->name('logout');
