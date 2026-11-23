<?php

declare(strict_types=1);

namespace Ps14\Site\ViewHelpers\Media;

/**
 * Liefert true fuer Bilder (jpg, png, gif).
 *
 * Beispiel: {site:media.isImage(file: media)}
 */
final class IsImageViewHelper extends AbstractFileTypeViewHelper
{
    #[\Override]
    protected function getExtensions(): array
    {
        return ['jpg', 'png', 'gif'];
    }
}
