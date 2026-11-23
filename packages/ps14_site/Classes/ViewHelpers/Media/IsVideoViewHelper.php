<?php

declare(strict_types=1);

namespace Ps14\Site\ViewHelpers\Media;

/**
 * Liefert true fuer Videos (mp4, wmv).
 *
 * Beispiel: {site:media.isVideo(file: media)}
 */
final class IsVideoViewHelper extends AbstractFileTypeViewHelper
{
    #[\Override]
    protected function getExtensions(): array
    {
        return ['mp4', 'wmv'];
    }
}
