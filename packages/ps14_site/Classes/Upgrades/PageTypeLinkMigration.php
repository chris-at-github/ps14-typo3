<?php

declare(strict_types=1);

namespace Ps14\Site\Upgrades;

use Doctrine\DBAL\ParameterType;
use TYPO3\CMS\Core\Attribute\UpgradeWizard;
use TYPO3\CMS\Core\Database\Query\QueryBuilder;
use TYPO3\CMS\Core\Domain\Repository\PageRepository;

/**
 * Seitentyp "Typolink" (doktype 120, ps14_foundation 2.x, Ziel im Feld "url")
 * -> Core-Seitentyp "Link" (doktype 3, Ziel im Feld "link")
 *
 * Das Feld "url" enthaelt bereits Typolinks (z. B. t3://page, t3://record), sie werden unveraendert uebernommen.
 */
#[UpgradeWizard('ps14Site_pageTypeLinkMigration')]
final class PageTypeLinkMigration extends AbstractMigration
{
    private const TABLE = 'pages';
    private const DOKTYPE_TYPOLINK = 120;

    #[\Override]
    public function getTitle(): string
    {
        return 'KIST: Migrate pages of type "Typolink" (120) to type "Link" (3)';
    }

    #[\Override]
    public function getDescription(): string
    {
        return 'Changes the page type 120 of ps14_foundation 2.x to the core page type "Link" and moves the target from "url" to "link".';
    }

    #[\Override]
    public function updateNecessary(): bool
    {
        if (!$this->columnExists(self::TABLE, 'url') || !$this->columnExists(self::TABLE, 'link')) {
            return false;
        }

        $queryBuilder = $this->getQueryBuilder();

        return (int)$queryBuilder
            ->count('uid')
            ->from(self::TABLE)
            ->where($this->getConstraint($queryBuilder))
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
            ->set('doktype', PageRepository::DOKTYPE_LINK, true, ParameterType::INTEGER)
            ->set('link', $queryBuilder->quoteIdentifier('url'), false)
            ->set('url', '')
            ->where($this->getConstraint($queryBuilder))
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

    private function getConstraint(QueryBuilder $queryBuilder): string
    {
        return (string)$queryBuilder->expr()->eq('doktype', $queryBuilder->createNamedParameter(self::DOKTYPE_TYPOLINK, ParameterType::INTEGER));
    }
}
