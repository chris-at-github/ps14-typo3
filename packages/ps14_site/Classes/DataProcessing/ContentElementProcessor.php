<?php

declare(strict_types=1);

namespace Ps14\Site\DataProcessing;

use Ps14\Foundation\DataProcessing\ContentElementProcessor as FoundationContentElementProcessor;
use TYPO3\CMS\Frontend\ContentObject\ContentObjectRenderer;

/**
 * Klassen und Attribute fuer den Rahmen der Inhaltselemente (Layouts/Content/Default.html).
 * KIST nutzt fuer Elemente auf oberster Ebene die Klasse "ce-frame--outer" statt "container--outer".
 */
final class ContentElementProcessor extends FoundationContentElementProcessor
{
    /**
     * @param array<string, mixed> $processedData
     * @param array<string, mixed> $processorConfiguration
     * @param ContentObjectRenderer $cObject
     */
    #[\Override]
    protected function getFrameOuterClass($processedData, $processorConfiguration, $cObject): string
    {
        return str_replace('container--outer', 'ce-frame--outer', (string)parent::getFrameOuterClass($processedData, $processorConfiguration, $cObject));
    }
}
