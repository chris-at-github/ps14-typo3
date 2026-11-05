<?php

declare(strict_types=1);

$config = \TYPO3\CodingStandards\CsFixerConfig::create();
$config->setCacheFile(__DIR__ . '/var/cache/.php-cs-fixer.cache');
$config->getFinder()
    ->in([
        __DIR__ . '/packages/ps14_site',
        __DIR__ . '/packages/ps14_foundation',
    ])
    ->exclude(['node_modules'])
    ->append([
        __DIR__ . '/.php-cs-fixer.dist.php',
        __DIR__ . '/fractor.php',
        __DIR__ . '/rector.php',
    ])
;

return $config;
