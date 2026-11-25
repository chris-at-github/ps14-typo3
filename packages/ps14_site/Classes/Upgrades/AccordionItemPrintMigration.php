<?php

declare(strict_types=1);

namespace Ps14\Site\Upgrades;

use Doctrine\DBAL\ArrayParameterType;
use TYPO3\CMS\Core\Attribute\UpgradeWizard;

/**
 * tx_foundation_domain_model_elements.print_break / print_visibility (ps14_foundation 2.x)
 * -> tx_modules_accordion_item.tx_site_print_break / tx_site_print_visibility.
 * Die Items behalten die UID des Elements (Wizard "ps14Migration_accordionElementsMigration" aus ps14_migration).
 * upgrade:run fragt updateNecessary() aller Wizards ab, bevor der erste laeuft: deshalb zaehlen Elemente mit
 * Druckwerten, deren Item noch fehlt, schon als offen. Ausgefuehrt wird nach dem Akkordeon-Wizard (ps14_site schlaegt
 * ps14_migration per "suggest" vor, Ladereihenfolge).
 */
#[UpgradeWizard('ps14Site_accordionItemPrintMigration')]
final class AccordionItemPrintMigration extends AbstractMigration
{
    private const SOURCE_TABLE = 'tx_foundation_domain_model_elements';
    private const TARGET_TABLE = 'tx_modules_accordion_item';
    private const CONTENT_TYPE = 'ps14_accordion';

    /**
     * Feld alt => Feld neu
     */
    private const FIELDS = [
        'print_break' => 'tx_site_print_break',
        'print_visibility' => 'tx_site_print_visibility',
    ];

    #[\Override]
    public function getTitle(): string
    {
        return 'KIST: Migrate print settings of accordion elements to "tx_modules_accordion_item.tx_site_print_*"';
    }

    #[\Override]
    public function getDescription(): string
    {
        return 'Copies "print_break" and "print_visibility" of the ps14_foundation 2.x elements to the accordion items with the same uid.';
    }

    #[\Override]
    public function updateNecessary(): bool
    {
        return $this->getPendingUpdates() !== [] || $this->hasElementsWithoutItem();
    }

    #[\Override]
    public function executeUpdate(): bool
    {
        $pendingUpdates = $this->getPendingUpdates();
        $connection = $this->connectionPool->getConnectionForTable(self::TARGET_TABLE);

        foreach ($pendingUpdates as $uid => $values) {
            $connection->update(self::TARGET_TABLE, $values, ['uid' => $uid]);
        }

        $this->output?->writeln(sprintf('Migrated print settings of %d accordion items.', count($pendingUpdates)));

        return true;
    }

    /**
     * Items, deren Druckfelder nicht dem Element mit gleicher UID entsprechen.
     *
     * @return array<int, array<string, string>> uid => Feld => Wert
     */
    private function getPendingUpdates(): array
    {
        if (!$this->isAvailable()) {
            return [];
        }

        $queryBuilder = $this->connectionPool->getQueryBuilderForTable(self::TARGET_TABLE);
        $queryBuilder->getRestrictions()->removeAll();
        $items = $queryBuilder
            ->select('uid', ...array_values(self::FIELDS))
            ->from(self::TARGET_TABLE)
            ->executeQuery()
            ->fetchAllAssociativeIndexed();

        if ($items === []) {
            return [];
        }

        $queryBuilder = $this->connectionPool->getQueryBuilderForTable(self::SOURCE_TABLE);
        $queryBuilder->getRestrictions()->removeAll();
        $elements = $queryBuilder
            ->select('uid', ...array_keys(self::FIELDS))
            ->from(self::SOURCE_TABLE)
            ->where(
                $queryBuilder->expr()->in('uid', $queryBuilder->createNamedParameter(array_keys($items), ArrayParameterType::INTEGER)),
            )
            ->executeQuery()
            ->fetchAllAssociativeIndexed();

        $pendingUpdates = [];

        foreach ($elements as $uid => $element) {
            $values = [];

            foreach (self::FIELDS as $sourceField => $targetField) {
                if ((string)$element[$sourceField] !== (string)$items[$uid][$targetField]) {
                    $values[$targetField] = (string)$element[$sourceField];
                }
            }

            if ($values !== []) {
                $pendingUpdates[(int)$uid] = $values;
            }
        }

        return $pendingUpdates;
    }

    /**
     * Akkordeon-Elemente mit Druckwerten, deren Item noch nicht uebernommen wurde.
     */
    private function hasElementsWithoutItem(): bool
    {
        if (!$this->isAvailable()) {
            return false;
        }

        $queryBuilder = $this->connectionPool->getQueryBuilderForTable(self::TARGET_TABLE);
        $queryBuilder->getRestrictions()->removeAll();
        $migratedUids = array_map('intval', $queryBuilder->select('uid')->from(self::TARGET_TABLE)->executeQuery()->fetchFirstColumn());

        $queryBuilder = $this->connectionPool->getQueryBuilderForTable(self::SOURCE_TABLE);
        $queryBuilder->getRestrictions()->removeAll();
        $queryBuilder
            ->count('e.uid')
            ->from(self::SOURCE_TABLE, 'e')
            ->join('e', 'tt_content', 'c', $queryBuilder->expr()->eq('c.uid', $queryBuilder->quoteIdentifier('e.foreign_uid')))
            ->where(
                $queryBuilder->expr()->eq('e.deleted', 0),
                $queryBuilder->expr()->eq('c.deleted', 0),
                $queryBuilder->expr()->eq('c.CType', $queryBuilder->createNamedParameter(self::CONTENT_TYPE)),
                $queryBuilder->expr()->or(
                    $queryBuilder->expr()->neq('e.print_break', $queryBuilder->createNamedParameter('')),
                    $queryBuilder->expr()->neq('e.print_visibility', $queryBuilder->createNamedParameter('')),
                ),
            );

        if ($migratedUids !== []) {
            $queryBuilder->andWhere(
                $queryBuilder->expr()->notIn('e.uid', $queryBuilder->createNamedParameter($migratedUids, ArrayParameterType::INTEGER)),
            );
        }

        return (int)$queryBuilder->executeQuery()->fetchOne() > 0;
    }

    private function isAvailable(): bool
    {
        foreach (self::FIELDS as $sourceField => $targetField) {
            if (!$this->columnExists(self::SOURCE_TABLE, $sourceField) || !$this->columnExists(self::TARGET_TABLE, $targetField)) {
                return false;
            }
        }

        return true;
    }
}
