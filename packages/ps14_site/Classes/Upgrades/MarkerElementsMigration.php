<?php

declare(strict_types=1);

namespace Ps14\Site\Upgrades;

use TYPO3\CMS\Core\Attribute\UpgradeWizard;

/**
 * Marker (ps14_marker): Elements -> tx_site_marker_item (Content Block ps14/marker)
 */
#[UpgradeWizard('ps14Site_markerElementsMigration')]
final class MarkerElementsMigration extends AbstractElementsMigration
{
    #[\Override]
    public function getTitle(): string
    {
        return 'KIST: Migrate marker elements to "tx_site_marker_item"';
    }

    #[\Override]
    protected function getContentType(): string
    {
        return 'ps14_marker';
    }

    #[\Override]
    protected function getTargetTable(): string
    {
        return 'tx_site_marker_item';
    }

    #[\Override]
    protected function getCollectionField(): string
    {
        return 'tx_site_marker_items';
    }

    #[\Override]
    protected function getFieldMap(string $recordType): array
    {
        return [
            'title' => 'title',
            'description' => 'description',
        ];
    }
}
