<?php

declare(strict_types=1);

namespace Ps14\Site\ViewHelpers\Format;

use TYPO3Fluid\Fluid\Core\ViewHelper\AbstractViewHelper;

/**
 * Kuerzt eine URL fuer die Anzeige als Linktext, z. B. "https://www.example.com/abc" -> "example.com".
 *
 * Beispiel: {address.www -> site:format.uri()}
 */
final class UriViewHelper extends AbstractViewHelper
{
    #[\Override]
    public function initializeArguments(): void
    {
        $this->registerArgument('uri', 'string', 'URI to shorten');
        $this->registerArgument('removeSubdomain', 'bool', 'Remove the subdomain, e.g. www.', false, true);
        $this->registerArgument('removeScheme', 'bool', 'Remove the scheme, e.g. https://', false, true);
        $this->registerArgument('removePath', 'bool', 'Remove the path, e.g. /abc/123.html', false, true);
    }

    #[\Override]
    public function getContentArgumentName(): string
    {
        return 'uri';
    }

    #[\Override]
    public function render(): string
    {
        $parts = parse_url((string)$this->renderChildren());

        if ($parts === false) {
            return '';
        }

        if (count($parts) === 1 && ($parts['path'] ?? '') !== '') {
            return $parts['path'];
        }

        $uri = '';

        if ($this->arguments['removeScheme'] === false && isset($parts['scheme'])) {
            $uri .= $parts['scheme'] . '://';
        }

        $host = $parts['host'] ?? '';

        if ($host !== '') {
            preg_match('/^(?:([a-z0-9-]+)\.)??([a-z0-9-]+)\.(com\.br|com\.cn|co\.uk|co\.jp|org\.uk|[a-z]{2,})$/i', $host, $hostMatches);

            if ($this->arguments['removeSubdomain'] === true && ($hostMatches[1] ?? '') !== '') {
                $host = str_replace($hostMatches[1] . '.', '', $host);
            }

            $uri .= $host;
        }

        if ($this->arguments['removePath'] === false) {
            $uri .= $parts['path'] ?? '';
        }

        return $uri;
    }
}
