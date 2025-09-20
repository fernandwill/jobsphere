<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Socialite\Contracts\User as SocialiteUserContract;
use Laravel\Socialite\Facades\Socialite;
use Mockery;
use Tests\TestCase;

class OAuthLoginTest extends TestCase
{
    use RefreshDatabase;

    public function testRedirectsToGithubProvider(): void
    {
        $driver = Mockery::mock();
        $driver->shouldReceive('redirect')
            ->once()
            ->andReturn(redirect('https://github.test/oauth'));

        Socialite::shouldReceive('driver')
            ->once()
            ->with('github')
            ->andReturn($driver);

        $response = $this->get('/auth/github/redirect');

        $response->assertRedirect('https://github.test/oauth');
    }

    public function testCallbackCreatesUserAndAuthenticates(): void
    {
        $fakeUser = new FakeSocialiteUser([
            'id' => '12345',
            'nickname' => 'octocat',
            'name' => 'Octo Cat',
            'email' => 'octo@example.com',
            'avatar' => 'https://avatars.test/octocat.png',
        ]);

        $driver = Mockery::mock();
        $driver->shouldReceive('user')
            ->once()
            ->andReturn($fakeUser);

        Socialite::shouldReceive('driver')
            ->once()
            ->with('github')
            ->andReturn($driver);

        $response = $this->get('/auth/github/callback');

        $response->assertRedirect('/');
        $this->assertAuthenticated();

        $this->assertDatabaseHas('users', [
            'email' => 'octo@example.com',
            'provider_name' => 'github',
            'provider_id' => '12345',
        ]);
    }

    public function testCallbackGeneratesPlaceholderEmailWhenMissing(): void
    {
        $fakeUser = new FakeSocialiteUser([
            'id' => '98765',
            'nickname' => null,
            'name' => null,
            'email' => null,
            'avatar' => null,
        ]);

        $driver = Mockery::mock();
        $driver->shouldReceive('user')
            ->once()
            ->andReturn($fakeUser);

        Socialite::shouldReceive('driver')
            ->once()
            ->with('github')
            ->andReturn($driver);

        $response = $this->get('/auth/github/callback');

        $response->assertRedirect('/');
        $this->assertAuthenticated();

        $placeholderEmail = '98765@github.local';

        $this->assertDatabaseHas('users', [
            'email' => $placeholderEmail,
            'provider_name' => 'github',
            'provider_id' => '98765',
        ]);

        $this->assertSame($placeholderEmail, auth()->user()->email);
    }

    public function testRejectsUnsupportedProvider(): void
    {
        $this->get('/auth/twitter/redirect')->assertNotFound();
        $this->get('/auth/twitter/callback')->assertNotFound();
    }
}

class FakeSocialiteUser implements SocialiteUserContract
{
    /**
     * @param  array{id:string, nickname:?string, name:?string, email:?string, avatar:?string}  $attributes
     */
    public function __construct(private array $attributes)
    {
    }

    public function getId()
    {
        return $this->attributes['id'];
    }

    public function getNickname()
    {
        return $this->attributes['nickname'];
    }

    public function getName()
    {
        return $this->attributes['name'];
    }

    public function getEmail()
    {
        return $this->attributes['email'];
    }

    public function getAvatar()
    {
        return $this->attributes['avatar'];
    }
}