<?php

declare(strict_types=1);

$config = \TYPO3\CodingStandards\CsFixerConfig::create();
$config->setCacheFile(__DIR__ . '/var/cache/.php-cs-fixer.cache');
$config->getFinder()
    // Only packages checked out under packages/ (shared packages may come from vendor/)
    ->in(glob(__DIR__ . '/packages/*', GLOB_ONLYDIR))
    ->exclude(['node_modules'])
    ->append([
        __DIR__ . '/.php-cs-fixer.dist.php',
        __DIR__ . '/fractor.php',
        __DIR__ . '/phpstan.paths.php',
        __DIR__ . '/rector.php',
    ])
;

return $config;
