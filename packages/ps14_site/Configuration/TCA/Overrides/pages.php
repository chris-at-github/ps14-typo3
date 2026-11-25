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

    // -----------------------------------------------------------------------------------------------------------------
    // Teaser (Menue-Ansichten teaser*): eigener Titel, lange Zusammenfassung, Weiterlesen-Text und grosses Bild
    ExtensionManagementUtility::addTCAcolumns('pages', [
        'tx_site_teaser_title' => [
            'exclude' => true,
            'label' => 'LLL:EXT:ps14_site/Resources/Private/Language/locallang_tca.xlf:pages.teaser.title',
            'config' => [
                'type' => 'input',
                'size' => 40,
                'eval' => 'trim',
            ],
        ],
        'tx_site_teaser_abstract_long' => [
            'exclude' => true,
            'label' => 'LLL:EXT:ps14_site/Resources/Private/Language/locallang_tca.xlf:pages.teaser.abstract-long',
            'config' => [
                'type' => 'text',
                'enableRichtext' => true,
                'richtextConfiguration' => 'ps14Minimal',
            ],
        ],
        'tx_site_teaser_readmore' => [
            'exclude' => true,
            'label' => 'LLL:EXT:ps14_site/Resources/Private/Language/locallang_tca.xlf:pages.teaser.readmore',
            'config' => [
                'type' => 'input',
                'size' => 40,
                'eval' => 'trim',
            ],
        ],
        'tx_site_teaser_media_large' => [
            'exclude' => true,
            'label' => 'LLL:EXT:ps14_site/Resources/Private/Language/locallang_tca.xlf:pages.teaser.media-large',
            'config' => [
                'type' => 'file',
                'maxitems' => 1,
                'allowed' => 'common-image-types',
                'behaviour' => [
                    'allowLanguageSynchronization' => true,
                ],
                'overrideChildTca' => [
                    'columns' => [
                        'crop' => [
                            'config' => [
                                'cropVariants' => TcaService::getCropVariants([
                                    'default' => [
                                        'allowedAspectRatios' => ['NaN', '16_9', '4_3'],
                                        'selectedRatio' => 'NaN',
                                    ],
                                ]),
                            ],
                        ],
                    ],
                ],
            ],
        ],
    ]);

    ExtensionManagementUtility::addFieldsToPalette('pages', 'foundation_teaser', '--linebreak--, tx_site_teaser_abstract_long,', 'after:abstract');
    ExtensionManagementUtility::addFieldsToPalette('pages', 'foundation_teaser', 'tx_site_teaser_title, --linebreak--, tx_site_teaser_readmore, --linebreak--', 'before:media');
    ExtensionManagementUtility::addFieldsToPalette('pages', 'foundation_teaser', '--linebreak--, tx_site_teaser_media_large', 'after:media');
})();
