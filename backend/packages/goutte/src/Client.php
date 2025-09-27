<?php

namespace Goutte;

use GuzzleHttp\Client as GuzzleClient;
use GuzzleHttp\Exception\GuzzleException;

class Client
{
    protected GuzzleClient $client;

    public function __construct(?GuzzleClient $client = null)
    {
        $this->client = $client ?: new GuzzleClient([
            'timeout' => 10,
            'headers' => [
                'User-Agent' => 'JobsphereBot/1.0 (+https://example.com)'
            ],
        ]);
    }

    /**
     * Send a request and return the response body as string.
     *
     * @param string $method
     * @param string $url
     * @param array<string, mixed> $parameters
     * @param array<string, string> $headers
     * @return string
     *
     * @throws GuzzleException
     */
    public function request(string $method, string $url, array $parameters = [], array $headers = []): string
    {
        $options = [];

        if (!empty($parameters)) {
            if (strtoupper($method) === 'GET') {
                $options['query'] = $parameters;
            } else {
                $options['form_params'] = $parameters;
            }
        }

        if (!empty($headers)) {
            $options['headers'] = array_merge($this->client->getConfig('headers') ?? [], $headers);
        }

        $response = $this->client->request($method, $url, $options);

        return (string) $response->getBody();
    }
}
