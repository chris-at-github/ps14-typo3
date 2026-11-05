<?php

declare(strict_types=1);

use Rector\Config\RectorConfig;
use Ssch\TYPO3Rector\Set\Typo3LevelSetList;
use Ssch\TYPO3Rector\TYPO313\v3\MigrateFluidStandaloneMethodsRector;

return RectorConfig::configure()
    ->withPaths([
        __DIR__ . '/packages/ps14_foundation',
        __DIR__ . '/packages/ps14_site',
    ])
    ->withPhpSets(php84: true)
    ->withSets([
        Typo3LevelSetList::UP_TO_TYPO3_14,
    ])
    ->withSkip([
        // SectionViewHelper registers "class" as its own argument, so it must stay in $this->arguments
        MigrateFluidStandaloneMethodsRector::class => [
            __DIR__ . '/packages/ps14_foundation/Classes/ViewHelpers/Layout/SectionViewHelper.php',
        ],
    ])
    ->withImportNames(
        importShortClasses: false,
        removeUnusedImports: true,
    );
