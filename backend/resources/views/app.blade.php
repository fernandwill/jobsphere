<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title inertia>{{ config('app.name', 'Jobsphere') }}</title>
    @viteReactRefresh
    @vite('resources/js/app.jsx')
</head>
<body class="antialiased" style="background-color: #030712; color: $f8fafc;">
    <div id="app" data-pages="@json($page, JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_AMP | JSON_HEX_QUOT)"></div> 
</body>
</html>