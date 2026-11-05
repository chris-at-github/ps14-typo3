<?php

declare(strict_types=1);

use Rector\Config\RectorConfig;
use Ssch\TYPO3Rector\Set\Typo3LevelSetList;

return RectorConfig::configure()
    ->withPaths([
        __DIR__ . '/packages/ps14_site',
    ])
    ->withPhpSets(php84: true)
    ->withSets([
        Typo3LevelSetList::UP_TO_TYPO3_14,
    ])
    ->withImportNames(
        importShortClasses: false,
        removeUnusedImports: true,
    );
