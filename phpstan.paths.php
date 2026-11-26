<?php

declare(strict_types=1);

// Analyse only packages checked out under packages/ — shared packages
// installed from GitHub into vendor/ are linted in their own repository.
$candidates = [
    'packages/ps14_foundation/Classes',
    'packages/ps14_foundation/Configuration',
    'packages/ps14_foundation/ext_localconf.php',
    'packages/ps14_foundation/ext_tables.php',
    'packages/ps14_component/Classes',
    'packages/ps14_container/Configuration',
    'packages/ps14_downloads/Configuration',
    'packages/ps14_menu/Classes',
    'packages/ps14_menu/Configuration',
    'packages/ps14_migration/Classes',
    'packages/ps14_modules/Configuration',
    'packages/ps14_site/Classes',
    'packages/ps14_site/Configuration',
    'packages/ps14_site/ext_localconf.php',
    'packages/ps14_textmedia/Configuration',
];

return [
    'parameters' => [
        'paths' => array_values(array_filter(
            array_map(static fn(string $path): string => __DIR__ . '/' . $path, $candidates),
            file_exists(...),
        )),
    ],
];
