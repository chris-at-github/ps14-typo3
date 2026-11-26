<?php

declare(strict_types=1);

use TYPO3\CMS\Core\Utility\ExtensionManagementUtility;

defined('TYPO3') or die();

(static function (): void {
    // Uebergangsweise bis Schritt 2, Punkt 5 (Ansprechpartner-Suche): Die Spalte record_type kennzeichnet die
    // Ansprechpartner (Ps\Contact\Domain\Model\Contact) und darf bei einem Schema-Abgleich nicht entfallen.
    // Sie ist kein Typfeld und erscheint nicht im Formular; ps14_address kennt sie nicht.
    ExtensionManagementUtility::addTCAcolumns('tt_address', [
        'record_type' => [
            'config' => [
                'type' => 'passthrough',
            ],
        ],
    ]);
})();
