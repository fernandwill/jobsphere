<?php

namespace App\Enums;

enum ApplicationStatus: string
{
    case Applied = 'applied';
    case OnlineAssessment = 'online_assessment';
    case Interview = 'interview';
    case Passed = 'passed';
    case Rejected = 'rejected';

    public function label(): string
    {
        return match ($this) {
            self::Applied => 'Applied',
            self::OnlineAssessment => 'Online Assessment',
            self::Interview => 'Interview',
            self::Passed => 'Passed',
            self::Rejected => 'Rejected',
        };
    }

    public static function values(): array
    {
        return array_map(static fn (self $status) => $status->value, self::cases());
    }
}
