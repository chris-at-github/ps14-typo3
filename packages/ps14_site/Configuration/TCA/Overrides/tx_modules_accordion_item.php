<?php

declare(strict_types=1);

use TYPO3\CMS\Core\Utility\ExtensionManagementUtility;

defined('TYPO3') or die();

(static function (): void {
    // -----------------------------------------------------------------------------------------------------------------
    // Druck: Seitenumbruch und Sichtbarkeit je Akkordeon-Eintrag (ps14_modules)
    $languageFile = 'LLL:EXT:ps14_foundation/Resources/Private/Language/locallang_tca.xlf';

    ExtensionManagementUtility::addTCAcolumns('tx_modules_accordion_item', [
        'tx_site_print_break' => [
            'exclude' => true,
            'l10n_mode' => 'exclude',
            'label' => $languageFile . ':print.break',
            'config' => [
                'type' => 'select',
                'renderType' => 'selectSingle',
                'items' => [
                    ['label' => 'LLL:EXT:core/Resources/Private/Language/locallang_general.xlf:LGL.default_value', 'value' => ''],
                    ['label' => $languageFile . ':print.break.before', 'value' => 'before'],
                    ['label' => $languageFile . ':print.break.after', 'value' => 'after'],
                ],
                'default' => '',
            ],
        ],
        'tx_site_print_visibility' => [
            'exclude' => true,
            'l10n_mode' => 'exclude',
            'label' => $languageFile . ':print.visibility',
            'config' => [
                'type' => 'select',
                'renderType' => 'selectSingle',
                'items' => [
                    ['label' => 'LLL:EXT:core/Resources/Private/Language/locallang_general.xlf:LGL.default_value', 'value' => ''],
                    ['label' => $languageFile . ':print.visibility.hidden', 'value' => 'hidden'],
                    ['label' => $languageFile . ':print.visibility.visible', 'value' => 'visible'],
                ],
                'default' => '',
            ],
        ],
    ]);

    $GLOBALS['TCA']['tx_modules_accordion_item']['palettes']['site_print'] = [
        'label' => $languageFile . ':print.palette',
        'showitem' => 'tx_site_print_break, tx_site_print_visibility',
    ];

    ExtensionManagementUtility::addToAllTCAtypes('tx_modules_accordion_item', '--palette--;;site_print', '', 'after:active');
})();
