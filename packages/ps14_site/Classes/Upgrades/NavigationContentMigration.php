<?php

declare(strict_types=1);

namespace Ps14\Site\Upgrades;

use Doctrine\DBAL\ArrayParameterType;
use Doctrine\DBAL\ParameterType;
use TYPO3\CMS\Core\Attribute\UpgradeWizard;

/**
 * Navigation Content: MM-Tabelle tx_foundation_pages_content_mm (ps14_foundation 2.x)
 * -> kommagetrennte UID-Liste in pages.tx_foundation_navigation_content (v14, ausgegeben per block.navigationContent)
 */
#[UpgradeWizard('ps14Site_navigationContentMigration')]
final class NavigationContentMigration extends AbstractMigration
{
    private const TABLE = 'pages';
    private const FIELD = 'tx_foundation_navigation_content';
    private const MM_TABLE = 'tx_foundation_pages_content_mm';

    #[\Override]
    public function getTitle(): string
    {
        return 'KIST: Migrate navigation content from "tx_foundation_pages_content_mm" to "pages.tx_foundation_navigation_content"';
    }

    #[\Override]
    public function getDescription(): string
    {
        return 'Writes the content element uids of the MM table as comma separated list into the page field (sorting of the MM table). '
            . 'Remove the MM table afterwards with "Analyze Database Structure".';
    }

    #[\Override]
    public function updateNecessary(): bool
    {
        return $this->getPendingUpdates() !== [];
    }

    #[\Override]
    public function executeUpdate(): bool
    {
        $pendingUpdates = $this->getPendingUpdates();
        $connection = $this->connectionPool->getConnectionForTable(self::TABLE);

        foreach ($pendingUpdates as $pageUid => $value) {
            $connection->update(self::TABLE, [self::FIELD => $value], ['uid' => $pageUid], [self::FIELD => ParameterType::STRING]);
        }

        $this->output?->writeln(sprintf('Migrated %d pages.', count($pendingUpdates)));

        return true;
    }

    /**
     * Seiten, deren Feld nicht dem Stand der MM-Tabelle entspricht. Werte "0" (Zaehler ohne Relationen) werden geleert.
     *
     * @return array<int, string> uid => UID-Liste
     */
    private function getPendingUpdates(): array
    {
        if (!$this->tableExists(self::MM_TABLE) || !$this->columnExists(self::TABLE, self::FIELD)) {
            return [];
        }

        $expected = [];
        $queryBuilder = $this->connectionPool->getQueryBuilderForTable(self::MM_TABLE);
        $result = $queryBuilder
            ->select('uid_local', 'uid_foreign')
            ->from(self::MM_TABLE)
            ->orderBy('uid_local')
            ->addOrderBy('sorting')
            ->executeQuery();

        while ($row = $result->fetchAssociative()) {
            $expected[(int)$row['uid_local']][] = (int)$row['uid_foreign'];
        }

        $queryBuilder = $this->connectionPool->getQueryBuilderForTable(self::TABLE);
        $queryBuilder->getRestrictions()->removeAll();
        $result = $queryBuilder
            ->select('uid', self::FIELD)
            ->from(self::TABLE)
            ->where(
                $queryBuilder->expr()->or(
                    $queryBuilder->expr()->in('uid', $queryBuilder->createNamedParameter(array_keys($expected) ?: [0], ArrayParameterType::INTEGER)),
                    $queryBuilder->expr()->eq(self::FIELD, $queryBuilder->createNamedParameter('0')),
                ),
            )
            ->executeQuery();

        $pendingUpdates = [];

        while ($row = $result->fetchAssociative()) {
            $uid = (int)$row['uid'];
            $value = implode(',', $expected[$uid] ?? []);

            if ((string)$row[self::FIELD] !== $value) {
                $pendingUpdates[$uid] = $value;
            }
        }

        return $pendingUpdates;
    }
}
