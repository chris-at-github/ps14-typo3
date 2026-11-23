<?php

declare(strict_types=1);

namespace Ps14\Site\Upgrades;

use Doctrine\DBAL\ParameterType;
use TYPO3\CMS\Core\Attribute\UpgradeWizard;
use TYPO3\CMS\Core\Database\Query\QueryBuilder;

/**
 * pages.tx_foundation_disable_sticky (ps14_foundation 2.x) -> pages.tx_site_disable_sticky
 */
#[UpgradeWizard('ps14Site_disableStickyMigration')]
final class DisableStickyMigration extends AbstractMigration
{
    private const TABLE = 'pages';

    #[\Override]
    public function getTitle(): string
    {
        return 'KIST: Migrate "pages.tx_foundation_disable_sticky" to "pages.tx_site_disable_sticky"';
    }

    #[\Override]
    public function getDescription(): string
    {
        return 'Copies the setting "Disable sticky elements" of ps14_foundation 2.x to the field of ps14_site.';
    }

    #[\Override]
    public function updateNecessary(): bool
    {
        if (!$this->columnExists(self::TABLE, 'tx_foundation_disable_sticky') || !$this->columnExists(self::TABLE, 'tx_site_disable_sticky')) {
            return false;
        }

        $queryBuilder = $this->getQueryBuilder();

        return (int)$queryBuilder
            ->count('uid')
            ->from(self::TABLE)
            ->where(...$this->getConstraints($queryBuilder))
            ->executeQuery()
            ->fetchOne() > 0;
    }

    #[\Override]
    public function executeUpdate(): bool
    {
        if (!$this->updateNecessary()) {
            return true;
        }

        $queryBuilder = $this->getQueryBuilder();
        $affectedRows = $queryBuilder
            ->update(self::TABLE)
            ->set('tx_site_disable_sticky', 1, true, ParameterType::INTEGER)
            ->where(...$this->getConstraints($queryBuilder))
            ->executeStatement();

        $this->output?->writeln(sprintf('Migrated %d pages.', $affectedRows));

        return true;
    }

    private function getQueryBuilder(): QueryBuilder
    {
        $queryBuilder = $this->connectionPool->getQueryBuilderForTable(self::TABLE);
        $queryBuilder->getRestrictions()->removeAll();

        return $queryBuilder;
    }

    /**
     * @return list<string>
     */
    private function getConstraints(QueryBuilder $queryBuilder): array
    {
        return [
            (string)$queryBuilder->expr()->eq('tx_foundation_disable_sticky', $queryBuilder->createNamedParameter(1, ParameterType::INTEGER)),
            (string)$queryBuilder->expr()->eq('tx_site_disable_sticky', $queryBuilder->createNamedParameter(0, ParameterType::INTEGER)),
        ];
    }
}
