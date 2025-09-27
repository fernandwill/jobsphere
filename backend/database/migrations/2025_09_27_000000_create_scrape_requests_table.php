<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('scrape_requests', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('keyword');
            $table->string('status')->default('queued');
            $table->unsignedInteger('results_count')->default(0);
            $table->timestamp('queued_at')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('finished_at')->nullable();
            $table->string('eta')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamps();
        });

        Schema::create('scrape_results', function (Blueprint $table) {
            $table->id();
            $table->uuid('scrape_request_id');
            $table->string('title');
            $table->string('company')->nullable();
            $table->string('location')->nullable();
            $table->string('url');
            $table->timestamp('published_at')->nullable();
            $table->json('payload')->nullable();
            $table->timestamps();

            $table->foreign('scrape_request_id')
                ->references('id')
                ->on('scrape_requests')
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('scrape_results');
        Schema::dropIfExists('scrape_requests');
    }
};
