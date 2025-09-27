<?php

use App\Enums\ApplicationStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('company');
            $table->string('job_title');
            $table->string('location')->nullable();
            $table->string('mode')->nullable();
            $table->string('source')->nullable();
            $table->string('status')->default(ApplicationStatus::Applied->value);
            $table->string('job_url')->nullable();
            $table->date('applied_at')->nullable();
            $table->timestamp('last_activity_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index('last_activity_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('applications');
    }
};
