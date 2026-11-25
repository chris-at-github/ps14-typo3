<?php

declare(strict_types=1);

namespace Ps14\Site\Upgrades;

use TYPO3\CMS\Core\Attribute\UpgradeWizard;

/**
 * Firmenwerte (ps14_kist_values): Elements -> tx_site_kist_values_item (Content Block ps14/kist-values)
 */
#[UpgradeWizard('ps14Site_kistValuesElementsMigration')]
final class KistValuesElementsMigration extends AbstractElementsMigration
{
    #[\Override]
    public function getTitle(): string
    {
        return 'KIST: Migrate company values elements to "tx_site_kist_values_item"';
    }

    #[\Override]
    protected function getContentType(): string
    {
        return 'ps14_kist_values';
    }

    #[\Override]
    protected function getTargetTable(): string
    {
        return 'tx_site_kist_values_item';
    }

    #[\Override]
    protected function getCollectionField(): string
    {
        return 'tx_site_kistvalues_items';
    }

    #[\Override]
    protected function getFieldMap(string $recordType): array
    {
        return [
            'title' => 'title',
            'description' => 'description',
            'media' => 'media',
            'color_scheme' => 'tx_kist_values_color_scheme',
        ];
    }

    #[\Override]
    protected function getFileFields(): array
    {
        return ['media' => 'media'];
    }
}
