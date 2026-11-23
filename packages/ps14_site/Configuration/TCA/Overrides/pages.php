<?php

declare(strict_types=1);

use Ps14\Foundation\Service\TcaService;
use TYPO3\CMS\Core\Utility\ExtensionManagementUtility;

defined('TYPO3') or die();

(static function (): void {
    // -----------------------------------------------------------------------------------------------------------------
    // Sticky-Leiste (PDF, Kontakt, nach oben) pro Seite abschalten
    ExtensionManagementUtility::addTCAcolumns('pages', [
        'tx_site_disable_sticky' => [
            'exclude' => true,
            'label' => 'LLL:EXT:ps14_site/Resources/Private/Language/locallang_tca.xlf:pages.disable-sticky',
            'config' => [
                'type' => 'check',
                'renderType' => 'checkboxToggle',
                'default' => 0,
            ],
        ],
        'tx_site_disable_sticky_pdf' => [
            'exclude' => true,
            'label' => 'LLL:EXT:ps14_site/Resources/Private/Language/locallang_tca.xlf:pages.disable-sticky.pdf',
            'config' => [
                'type' => 'check',
                'renderType' => 'checkboxToggle',
                'default' => 0,
            ],
        ],
    ]);

    $GLOBALS['TCA']['pages']['palettes']['site_sticky'] = [
        'label' => 'LLL:EXT:ps14_site/Resources/Private/Language/locallang_tca.xlf:pages.palette.sticky',
        'showitem' => 'tx_site_disable_sticky, tx_site_disable_sticky_pdf,',
    ];

    ExtensionManagementUtility::addToAllTCAtypes('pages', '--palette--;;site_sticky,', '', 'after:layout');

    // -----------------------------------------------------------------------------------------------------------------
    // Seitenmedien: ein Bild mit Crop-Varianten fuer die Karten im Mega-Menue
    $GLOBALS['TCA']['pages']['columns']['media']['config']['maxitems'] = 1;
    $GLOBALS['TCA']['pages']['columns']['media']['config']['overrideChildTca']['columns']['crop']['config']['cropVariants'] = TcaService::getCropVariants([
        'desktop' => [
            'allowedAspectRatios' => ['16_9', '4_3'],
            'selectedRatio' => '16_9',
        ],
        'mobile' => [
            'allowedAspectRatios' => ['16_9', '4_3'],
            'selectedRatio' => '16_9',
        ],
    ]);
})();
