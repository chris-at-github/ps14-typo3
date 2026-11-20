<?php

declare(strict_types=1);

namespace Ps14\Site\DataProcessing;

use TYPO3\CMS\Frontend\ContentObject\ContentObjectRenderer;
use TYPO3\CMS\Frontend\ContentObject\DataProcessorInterface;

/**
 * Forces the heading level of a content element, e.g. inside the page footer where
 * all headings are placed below a fixed (visually hidden) h2.
 *
 * The level is read from a register which is set around the rendering of the content
 * elements (LOAD_REGISTER / RESTORE_REGISTER), so nested elements are covered as well.
 * Hidden headers (header_layout = 100) stay hidden.
 */
final readonly class HeadingLevelProcessor implements DataProcessorInterface
{
    private const string DEFAULT_REGISTER = 'headingLevel';
    private const int HIDDEN = 100;
    private const int MIN_LEVEL = 1;
    private const int MAX_LEVEL = 6;

    /**
     * @param array<string, mixed> $contentObjectConfiguration
     * @param array<string, mixed> $processorConfiguration
     * @param array<string, mixed> $processedData
     * @return array<string, mixed>
     */
    #[\Override]
    public function process(
        ContentObjectRenderer $cObj,
        array $contentObjectConfiguration,
        array $processorConfiguration,
        array $processedData,
    ): array {
        $register = (string)($processorConfiguration['register'] ?? self::DEFAULT_REGISTER);
        $level = (int)$cObj->getData('register:' . $register);

        if ($level < self::MIN_LEVEL || $level > self::MAX_LEVEL) {
            return $processedData;
        }

        if (!is_array($processedData['data'] ?? null) || !array_key_exists('header_layout', $processedData['data'])) {
            return $processedData;
        }

        if ((int)$processedData['data']['header_layout'] !== self::HIDDEN) {
            $processedData['data']['header_layout'] = $level;
        }

        return $processedData;
    }
}
