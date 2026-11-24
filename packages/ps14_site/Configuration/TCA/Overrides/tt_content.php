<?php

declare(strict_types=1);

use Ps14\Foundation\Service\TcaService;
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

    // -----------------------------------------------------------------------------------------------------------------
    // Content Blocks (ContentBlocks/ContentElements): Felder aus ps14_foundation in die Paletten der Basics haengen
    // (entstehen erst in dessen TCA-Overrides, siehe .claude/rules/typo3/content-blocks.md)
    foreach (['ps14_marker' => 'tx_site_marker', 'ps14_kist_values' => 'tx_site_kistvalues'] as $prefix) {
        ExtensionManagementUtility::addFieldsToPalette('tt_content', $prefix . '_headers', 'tx_foundation_elements_header', 'after:subheader');
        ExtensionManagementUtility::addFieldsToPalette('tt_content', $prefix . '_links_palette', 'tx_foundation_section_menu_title, --linebreak--', 'after:sectionIndex');
    }

    // Marker: Bildausschnitte wie in KIST v12
    $GLOBALS['TCA']['tt_content']['types']['ps14_marker']['columnsOverrides']['image']['config']['overrideChildTca']['columns']['crop']['config']['cropVariants'] = TcaService::getCropVariants([
        'mobile' => [
            'allowedAspectRatios' => ['16_9', '4_3', 'NaN'],
            'selectedRatio' => '16_9',
        ],
        'desktop' => [
            'allowedAspectRatios' => ['16_9', '4_3', 'NaN'],
            'selectedRatio' => '4_3',
        ],
    ]);
})();
