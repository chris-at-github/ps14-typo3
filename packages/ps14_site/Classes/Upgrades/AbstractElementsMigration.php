<?php

declare(strict_types=1);

namespace Ps14\Site\Upgrades;

use Doctrine\DBAL\ArrayParameterType;

/**
 * Elements (tx_foundation_domain_model_elements, ps14_foundation 2.x) eines CType -> Collection eines Content Blocks.
 * Kopie von Ps14\Migration\Upgrades\AbstractElementsMigration: ps14_migration ist nur require-dev, eine Elternklasse
 * daraus wuerde ohne das Paket (Deployment mit --no-dev) den DI-Container brechen.
 * Die Items behalten die UID des Elements: verschachtelte Inhaltselemente (tt_content.tx_foundation_parent) und
 * Dateireferenzen (sys_file_reference.uid_foreign) bleiben gueltig, nur Tabelle bzw. Feldname werden umgestellt.
 */
abstract class AbstractElementsMigration extends AbstractMigration
{
    protected const SOURCE_TABLE = 'tx_foundation_domain_model_elements';

    /**
     * CType der Inhaltselemente, deren Elements uebernommen werden
     */
    abstract protected function getContentType(): string;

    /**
     * Tabelle der Collection-Items
     */
    abstract protected function getTargetTable(): string;

    /**
     * Inline-Feld der Collection in tt_content
     */
    abstract protected function getCollectionField(): string;

    /**
     * Feld neu => Feld alt, abhaengig vom neuen Record Type (leer, wenn die Tabelle keine Typen hat)
     *
     * @return array<string, string>
     */
    abstract protected function getFieldMap(string $recordType): array;

    /**
     * record_type alt => neu; leer, wenn die Item-Tabelle kein Typfeld hat
     *
     * @return array<string, string>
     */
    protected function getRecordTypes(): array
    {
        return [];
    }

    /**
     * Dateifeld alt => neu (sys_file_reference.fieldname)
     *
     * @return array<string, string>
     */
    protected function getFileFields(): array
    {
        return [];
    }

    /**
     * Neue Record Types, deren Items verschachtelte Inhaltselemente haben (tt_content.tx_foundation_parent)
     *
     * @return list<string>
     */
    protected function getNestedContentRecordTypes(): array
    {
        return [];
    }

    #[\Override]
    public function getDescription(): string
    {
        return sprintf(
            'Copies the elements of "%s" content elements into the Content Block collection "%s" (same uids), '
            . 'moves their file references, updates the item counter and links nested content elements.',
            $this->getContentType(),
            $this->getTargetTable(),
        );
    }

    #[\Override]
    public function updateNecessary(): bool
    {
        return $this->isAvailable() && $this->getPendingElements() !== [];
    }

    #[\Override]
    public function executeUpdate(): bool
    {
        $elements = $this->getPendingElements();
        $connection = $this->connectionPool->getConnectionForTable($this->getTargetTable());
        $recordTypes = $this->getRecordTypes();
        $contentUids = [];

        foreach ($elements as $element) {
            $row = [
                'uid' => (int)$element['uid'],
                'pid' => (int)$element['pid'],
                'tstamp' => (int)$element['tstamp'],
                'crdate' => (int)$element['crdate'],
                'hidden' => (int)$element['hidden'],
                'starttime' => (int)$element['starttime'],
                'endtime' => (int)$element['endtime'],
                'sorting' => (int)$element['sorting'],
                'sys_language_uid' => (int)$element['sys_language_uid'],
                'l10n_parent' => (int)$element['l10n_parent'],
                'l10n_source' => (int)$element['l10n_parent'],
                'foreign_table_parent_uid' => (int)$element['foreign_uid'],
            ];

            $recordType = '';

            if ($recordTypes !== []) {
                $recordType = $recordTypes[$element['record_type']] ?? reset($recordTypes);
                $row['record_type'] = $recordType;
            }

            foreach ($this->getFieldMap($recordType) as $targetField => $sourceField) {
                $row[$targetField] = $element[$sourceField] ?? '';
            }

            $connection->insert($this->getTargetTable(), $row);
            $contentUids[(int)$element['foreign_uid']] = true;
        }

        $files = $this->moveFileReferences();
        $this->updateCounters(array_keys($contentUids));
        $nested = $this->linkNestedContent();

        $this->output?->writeln(sprintf(
            'Migrated %d items of %d "%s" content elements, moved %d file references, linked %d nested content elements.',
            count($elements),
            count($contentUids),
            $this->getContentType(),
            $files,
            $nested,
        ));

        return true;
    }

    protected function isAvailable(): bool
    {
        return $this->tableExists(self::SOURCE_TABLE)
            && $this->tableExists($this->getTargetTable())
            && $this->columnExists('tt_content', $this->getCollectionField());
    }

    /**
     * Nicht geloeschte Elemente nicht geloeschter Inhaltselemente des CType, die noch nicht uebernommen wurden.
     *
     * @return list<array<string, mixed>>
     */
    protected function getPendingElements(): array
    {
        $queryBuilder = $this->connectionPool->getQueryBuilderForTable(self::SOURCE_TABLE);
        $queryBuilder->getRestrictions()->removeAll();
        $migratedUids = $this->getMigratedUids();

        $queryBuilder
            ->select('e.*')
            ->from(self::SOURCE_TABLE, 'e')
            ->join('e', 'tt_content', 'c', $queryBuilder->expr()->eq('c.uid', $queryBuilder->quoteIdentifier('e.foreign_uid')))
            ->where(
                $queryBuilder->expr()->eq('e.deleted', 0),
                $queryBuilder->expr()->eq('c.deleted', 0),
                $queryBuilder->expr()->eq('c.CType', $queryBuilder->createNamedParameter($this->getContentType())),
            )
            ->orderBy('e.uid');

        if ($migratedUids !== []) {
            $queryBuilder->andWhere(
                $queryBuilder->expr()->notIn('e.uid', $queryBuilder->createNamedParameter($migratedUids, ArrayParameterType::INTEGER)),
            );
        }

        return $queryBuilder->executeQuery()->fetchAllAssociative();
    }

    /**
     * @return list<int>
     */
    protected function getMigratedUids(?string $recordType = null): array
    {
        $queryBuilder = $this->connectionPool->getQueryBuilderForTable($this->getTargetTable());
        $queryBuilder->getRestrictions()->removeAll();
        $queryBuilder->select('uid')->from($this->getTargetTable());

        if ($recordType !== null) {
            $queryBuilder->where($queryBuilder->expr()->eq('record_type', $queryBuilder->createNamedParameter($recordType)));
        }

        return array_map('intval', $queryBuilder->executeQuery()->fetchFirstColumn());
    }

    /**
     * Dateireferenzen der uebernommenen Elemente auf die Item-Tabelle umstellen.
     */
    private function moveFileReferences(): int
    {
        $itemUids = $this->getMigratedUids();

        if ($itemUids === [] || $this->getFileFields() === []) {
            return 0;
        }

        $moved = 0;

        foreach ($this->getFileFields() as $sourceField => $targetField) {
            $queryBuilder = $this->connectionPool->getQueryBuilderForTable('sys_file_reference');
            $queryBuilder->getRestrictions()->removeAll();
            $moved += (int)$queryBuilder
                ->update('sys_file_reference')
                ->set('tablenames', $this->getTargetTable())
                ->set('fieldname', $targetField)
                ->where(
                    $queryBuilder->expr()->eq('tablenames', $queryBuilder->createNamedParameter(self::SOURCE_TABLE)),
                    $queryBuilder->expr()->eq('fieldname', $queryBuilder->createNamedParameter($sourceField)),
                    $queryBuilder->expr()->in('uid_foreign', $queryBuilder->createNamedParameter($itemUids, ArrayParameterType::INTEGER)),
                )
                ->executeStatement();
        }

        return $moved;
    }

    /**
     * Zaehler des Inline-Felds am Inhaltselement (Anzahl nicht geloeschter Items).
     *
     * @param list<int> $contentUids
     */
    private function updateCounters(array $contentUids): void
    {
        $connection = $this->connectionPool->getConnectionForTable('tt_content');

        foreach ($contentUids as $contentUid) {
            $queryBuilder = $this->connectionPool->getQueryBuilderForTable($this->getTargetTable());
            $queryBuilder->getRestrictions()->removeAll();
            $count = (int)$queryBuilder
                ->count('uid')
                ->from($this->getTargetTable())
                ->where(
                    $queryBuilder->expr()->eq('foreign_table_parent_uid', $queryBuilder->createNamedParameter($contentUid)),
                    $queryBuilder->expr()->eq('deleted', 0),
                )
                ->executeQuery()
                ->fetchOne();

            $connection->update('tt_content', [$this->getCollectionField() => $count], ['uid' => $contentUid]);
        }
    }

    /**
     * Verschachtelte Inhaltselemente der Items auf die neue Elterntabelle setzen.
     */
    private function linkNestedContent(): int
    {
        $itemUids = [];

        foreach ($this->getNestedContentRecordTypes() as $recordType) {
            $itemUids = array_merge($itemUids, $this->getMigratedUids($recordType));
        }

        if ($itemUids === []) {
            return 0;
        }

        $queryBuilder = $this->connectionPool->getQueryBuilderForTable('tt_content');
        $queryBuilder->getRestrictions()->removeAll();

        return (int)$queryBuilder
            ->update('tt_content')
            ->set('tx_foundation_parent_table', $this->getTargetTable())
            ->where(
                $queryBuilder->expr()->in('tx_foundation_parent', $queryBuilder->createNamedParameter($itemUids, ArrayParameterType::INTEGER)),
                $queryBuilder->expr()->neq('tx_foundation_parent_table', $queryBuilder->createNamedParameter($this->getTargetTable())),
            )
            ->executeStatement();
    }
}
