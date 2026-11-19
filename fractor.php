<?php

declare(strict_types=1);

use a9f\Fractor\Configuration\FractorConfiguration;
use a9f\Typo3Fractor\Set\Typo3LevelSetList;

return FractorConfiguration::configure()
    ->withPaths(array_values(array_filter([
        __DIR__ . '/packages/ps14_foundation',
        __DIR__ . '/packages/ps14_site',
    ], is_dir(...))))
    ->withSets([
        Typo3LevelSetList::UP_TO_TYPO3_14,
    ]);
