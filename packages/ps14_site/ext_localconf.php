<?php

if (defined('TYPO3') === false) {
    die('Access denied.');
}

// ---------------------------------------------------------------------------------------------------------------------
// CKEditor
// Konfiguration fuer den (CKE) Editor im Backend
$GLOBALS['TYPO3_CONF_VARS']['RTE']['Presets']['ps14Default'] = 'EXT:ps14_site/Configuration/RTE/Default.yaml';
$GLOBALS['TYPO3_CONF_VARS']['RTE']['Presets']['ps14Minimal'] = 'EXT:ps14_site/Configuration/RTE/Minimal.yaml';
