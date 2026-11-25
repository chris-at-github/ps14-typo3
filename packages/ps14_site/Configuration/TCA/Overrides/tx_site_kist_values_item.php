<?php

declare(strict_types=1);

use Ps14\Foundation\Service\TcaService;

defined('TYPO3') or die();

(static function (): void {
    // -----------------------------------------------------------------------------------------------------------------
    // Firmenwerte: Bildausschnitte fuer Liste und Modal wie in KIST v12
    $GLOBALS['TCA']['tx_site_kist_values_item']['columns']['media']['config']['overrideChildTca']['columns']['crop']['config']['cropVariants'] = TcaService::getCropVariants([
        'thumbnail' => [
            'allowedAspectRatios' => ['NaN'],
            'selectedRatio' => 'NaN',
        ],
        'fullsize' => [
            'allowedAspectRatios' => ['NaN'],
            'selectedRatio' => 'NaN',
        ],
    ]);
})();
