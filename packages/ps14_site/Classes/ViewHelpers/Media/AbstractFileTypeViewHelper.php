<?php

declare(strict_types=1);

namespace Ps14\Site\ViewHelpers\Media;

use TYPO3\CMS\Core\Resource\FileInterface;
use TYPO3\CMS\Extbase\Domain\Model\FileReference as ExtbaseFileReference;
use TYPO3Fluid\Fluid\Core\ViewHelper\AbstractViewHelper;

/**
 * Prueft die Dateiendung einer Datei bzw. Dateireferenz (Core oder Extbase).
 */
abstract class AbstractFileTypeViewHelper extends AbstractViewHelper
{
    /**
     * @return list<string> Dateiendungen in Kleinbuchstaben
     */
    abstract protected function getExtensions(): array;

    #[\Override]
    public function initializeArguments(): void
    {
        $this->registerArgument('file', 'object', 'File or file reference to check', true);
    }

    #[\Override]
    public function render(): bool
    {
        $file = $this->arguments['file'];

        if ($file instanceof ExtbaseFileReference) {
            $file = $file->getOriginalResource();
        }

        if (!$file instanceof FileInterface) {
            return false;
        }

        return in_array(strtolower($file->getExtension()), $this->getExtensions(), true);
    }
}
