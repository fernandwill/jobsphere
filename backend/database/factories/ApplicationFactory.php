<?php

namespace Database\Factories;

use App\Enums\ApplicationStatus;
use App\Models\Application;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Application>
 */
class ApplicationFactory extends Factory
{
    protected $model = Application::class;

    public function definition(): array
    {
        $status = $this->faker->randomElement(ApplicationStatus::cases());
        $appliedAt = $this->faker->dateTimeBetween('-2 months', 'now');

        return [
            'user_id' => User::factory(),
            'company' => $this->faker->company(),
            'job_title' => $this->faker->jobTitle(),
            'location' => $this->faker->city(),
            'mode' => $this->faker->randomElement(['remote', 'hybrid', 'onsite']),
            'source' => $this->faker->randomElement(['scraped', 'manual']),
            'status' => $status,
            'job_url' => $this->faker->url(),
            'applied_at' => $appliedAt,
            'last_activity_at' => $this->faker->dateTimeBetween($appliedAt, 'now'),
            'notes' => $this->faker->optional()->sentence(10),
        ];
    }
}
