<?php

declare(strict_types=1);

use TYPO3\CMS\Core\Utility\ExtensionManagementUtility;

defined('TYPO3') or die();

(static function (): void {
    // -----------------------------------------------------------------------------------------------------------------
    // Allgemein: Label des FlexForm-Felds ausblenden, die Inhalte stehen in den Tabs der FlexForm
    $GLOBALS['TCA']['tt_content']['columns']['pi_flexform']['label'] = ' ';

    // -----------------------------------------------------------------------------------------------------------------
    // Seite als PDF (Downloads): Felder werden in Schritt 2 mit dem Downloads-Element eingeblendet
    ExtensionManagementUtility::addTCAcolumns('tt_content', [
        'tx_site_wkhtmltopdf_enabled' => [
            'exclude' => true,
            'label' => 'LLL:EXT:ps14_site/Resources/Private/Language/locallang_tca.xlf:tt_content.wkhtmltopdf.enabled',
            'onChange' => 'reload',
            'config' => [
                'type' => 'check',
                'renderType' => 'checkboxToggle',
                'default' => 0,
            ],
        ],
        'tx_site_wkhtmltopdf_title' => [
            'exclude' => true,
            'displayCond' => 'FIELD:tx_site_wkhtmltopdf_enabled:>:0',
            'label' => 'LLL:EXT:ps14_site/Resources/Private/Language/locallang_tca.xlf:tt_content.wkhtmltopdf.title',
            'config' => [
                'type' => 'input',
                'size' => 30,
                'eval' => 'trim',
                'required' => true,
            ],
        ],
    ]);

    // -----------------------------------------------------------------------------------------------------------------
    // Menue der Unterseiten: Sortierung per FlexForm (Auswertung in Configuration/TypoScript/Modules/Menu.setup.typoscript)
    $GLOBALS['TCA']['tt_content']['types']['menu_subpages']['columnsOverrides']['pi_flexform']['config']['ds'] = 'FILE:EXT:ps14_site/Configuration/FlexForms/Modules/MenuSubpages.xml';
    $GLOBALS['TCA']['tt_content']['types']['menu_subpages']['columnsOverrides']['pi_flexform']['label'] = ' ';
    ExtensionManagementUtility::addToAllTCAtypes('tt_content', 'pi_flexform', 'menu_subpages', 'after:pages');
})();
