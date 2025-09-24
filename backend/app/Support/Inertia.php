<?php

namespace App\Support;

use Closure;
use Illuminate\Contracts\Support\Arrayable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use JsonSerializable;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

class Inertia
{
    protected static array $shared = [];

    protected static ?string $version = null;

    public static function share(array|string $key, mixed $value = null): void
    {
        if (is_array($key)) {
            static::$shared = array_merge(static::$shared, $key);

            return;
        }

        static::$shared[$key] = $value;
    }

    public static function version(?string $version = null): ?string
    {
        if (func_num_args() === 1) {
            static::$version = $version;
        }

        return static::$version;
    }

    public static function render(string $component, array $props = [], int $status = 200, array $headers = []): SymfonyResponse
    {
        $request = request();

        $resolvedProps = static::resolveProps($request, array_merge(static::$shared, $props));

        if (
            $request->header('X-Inertia-Partial-Component') === $component &&
            $request->hasHeader('X-Inertia-Partial-Data')
        ) {
            $only = array_filter(explode(',', (string) $request->header('X-Inertia-Partial-Data')));
            $resolvedProps = Arr::only($resolvedProps, $only);
        }

        $page = [
            'component' => $component,
            'props' => $resolvedProps,
            'url' => $request->getRequestUri(),
            'version' => static::$version,
        ];

        $headers = array_merge([
            'X-Inertia' => 'true',
            'Vary' => 'Accept, X-Inertia',
        ], $headers);

        if ($request->header('X-Inertia')) {
            return new JsonResponse($page, $status, $headers);
        }

        return response()
            ->view('app', ['page' => $page], $status)
            ->withHeaders($headers);
    }

    protected static function resolveProps(Request $request, array $props): array
    {
        foreach ($props as $key => $value) {
            $props[$key] = static::evaluateProp($request, $value);
        }

        return $props;
    }

    protected static function evaluateProp(Request $request, mixed $value): mixed
    {
        if ($value instanceof Closure) {
            $value = $value($request);
        }

        if ($value instanceof Arrayable) {
            $value = $value->toArray();
        }

        if ($value instanceof JsonSerializable) {
            $value = $value->jsonSerialize();
        }

        if (is_array($value)) {
            return static::resolveProps($request, $value);
        }

        return $value;
    }
}
