<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use Throwable;

class AuthController extends Controller
{
    private const SUPPORTED_PROVIDERS = ['github', 'google'];

    public function redirect(string $provider): RedirectResponse
    {
        $this->ensureProviderSupported($provider);

        return Socialite::driver($provider)->redirect();
    }

    public function callback(Request $request, string $provider): RedirectResponse
    {
        $this->ensureProviderSupported($provider);

        try {
            $socialUser = Socialite::driver($provider)->user();
        } catch (Throwable $exception) {
            report($exception);

            return redirect('/')
                ->with('error', __('Unable to authenticate using :provider.', ['provider' => ucfirst($provider)]));
        }

        $email = $socialUser->getEmail() ?: sprintf('%s@%s.local', $socialUser->getId(), $provider);

        $user = User::where('provider_name', $provider)
            ->where('provider_id', $socialUser->getId())
            ->first();

        if (! $user) {
            $user = User::firstOrNew(['email' => $email]);
        }

        $user->fill([
            'name' => $socialUser->getName() ?: $socialUser->getNickname() ?: $email,
            'email' => $email,
            'avatar' => $socialUser->getAvatar(),
            'provider_name' => $provider,
            'provider_id' => (string) $socialUser->getId(),
        ]);

        if (! $user->exists) {
            $user->password = Hash::make(Str::random(32));
        }

        $user->save();

        Auth::login($user, true);

        $request->session()->regenerate();

        return redirect()->intended('/');
    }

    public function logout(Request $request): RedirectResponse
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }

    private function ensureProviderSupported(string $provider): void
    {
        abort_unless(in_array($provider, self::SUPPORTED_PROVIDERS, true), 404);
    }
}
