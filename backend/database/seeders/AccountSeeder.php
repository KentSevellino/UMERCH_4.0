<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

/**
 * Known accounts for local development.
 *
 * Safe to run repeatedly: every row is matched on its email address, so the
 * three identities that already exist in a real database are adopted rather
 * than duplicated, and `um_id`, `email` and `user_fullname` all stay unique.
 *
 * The two customer addresses are real inboxes because the OTP challenge is
 * emailed through live Gmail SMTP and is otherwise undeliverable.
 */
class AccountSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Shared password for every seeded account.
     */
    public const PASSWORD = 'umerch2026';

    /**
     * @var array<int, array<string, string>>
     */
    private const ACCOUNTS = [
        [
            'um_id' => 1,
            'email' => 'admin@umerch.com',
            'user_fullname' => 'Admin',
            'role' => 'Admin',
            'status' => 'active',
        ],
        [
            'um_id' => 544580,
            'email' => 'yoshbatula2@gmail.com',
            'user_fullname' => 'Yosh Batula',
            'role' => 'customer',
            'status' => 'active',
        ],
        [
            'um_id' => 544583,
            'email' => 'y.batula.544580@umindanao.edu.ph',
            'user_fullname' => 'Yoshiem',
            'role' => 'customer',
            'status' => 'active',
        ],
        [
            'um_id' => 90001,
            'email' => 'inactive.tester@example.com',
            'user_fullname' => 'Inactive Tester',
            'role' => 'customer',
            'status' => 'inactive',
        ],
    ];

    /**
     * Create or refresh the known accounts.
     */
    public function run(): void
    {
        foreach (self::ACCOUNTS as $account) {
            User::updateOrCreate(
                ['email' => $account['email']],
                [
                    'um_id' => $account['um_id'],
                    'user_fullname' => $account['user_fullname'],
                    'user_password' => self::PASSWORD,
                    'role' => $account['role'],
                    'status' => $account['status'],
                    'email_verified_at' => now(),
                ],
            );
        }

        if ($this->command) {
            $this->command->info('Seeded '.count(self::ACCOUNTS).' accounts.');
            $this->command->table(
                ['Login', 'Password', 'Role', 'Status'],
                collect(self::ACCOUNTS)
                    ->map(fn (array $account) => [
                        $account['email'],
                        self::PASSWORD,
                        $account['role'],
                        $account['status'],
                    ])
                    ->all()
            );
        }
    }
}
