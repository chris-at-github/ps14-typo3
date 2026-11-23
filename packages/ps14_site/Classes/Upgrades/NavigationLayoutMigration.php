<?php

declare(strict_types=1);

namespace Ps14\Site\Upgrades;

use TYPO3\CMS\Core\Attribute\UpgradeWizard;

/**
 * pages.tx_foundation_navigation_layout: "0" (ps14_foundation 2.x, "not set") -> ""
 */
#[UpgradeWizard('ps14Site_navigationLayoutMigration')]
final class NavigationLayoutMigration extends AbstractMigration
{
    private const TABLE = 'pages';
    private const FIELD = 'tx_foundation_navigation_layout';

    #[\Override]
    public function getTitle(): string
    {
        return 'KIST: Clear the value "0" of "pages.tx_foundation_navigation_layout"';
    }

    #[\Override]
    public function getDescription(): string
    {
        return 'ps14_foundation 2.x stored "0" for pages without navigation layout, v14 uses an empty value.';
    }

    #[\Override]
    public function updateNecessary(): bool
    {
        if (!$this->columnExists(self::TABLE, self::FIELD)) {
            return false;
        }

        $queryBuilder = $this->connectionPool->getQueryBuilderForTable(self::TABLE);
        $queryBuilder->getRestrictions()->removeAll();

        return (int)$queryBuilder
            ->count('uid')
            ->from(self::TABLE)
            ->where($queryBuilder->expr()->eq(self::FIELD, $queryBuilder->createNamedParameter('0')))
            ->executeQuery()
            ->fetchOne() > 0;
    }

    #[\Override]
    public function executeUpdate(): bool
    {
        if (!$this->updateNecessary()) {
            return true;
        }

        $queryBuilder = $this->connectionPool->getQueryBuilderForTable(self::TABLE);
        $queryBuilder->getRestrictions()->removeAll();
        $affectedRows = $queryBuilder
            ->update(self::TABLE)
            ->set(self::FIELD, '')
            ->where($queryBuilder->expr()->eq(self::FIELD, $queryBuilder->createNamedParameter('0')))
            ->executeStatement();

        $this->output?->writeln(sprintf('Migrated %d pages.', $affectedRows));

        return true;
    }
}
