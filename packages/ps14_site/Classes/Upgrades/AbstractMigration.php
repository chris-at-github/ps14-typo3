<?php

declare(strict_types=1);

namespace Ps14\Site\Upgrades;

use Symfony\Component\Console\Output\OutputInterface;
use TYPO3\CMS\Core\Database\ConnectionPool;
use TYPO3\CMS\Core\Upgrades\ChattyInterface;
use TYPO3\CMS\Core\Upgrades\DatabaseUpdatedPrerequisite;
use TYPO3\CMS\Core\Upgrades\UpgradeWizardInterface;

/**
 * Gemeinsame Basis der Migrationen von KIST v12 (ps14_foundation 2.x) nach v14.
 * Die Quellen (Spalten, Tabellen) fehlen im v14-TCA und werden deshalb direkt im Schema geprueft.
 */
abstract class AbstractMigration implements UpgradeWizardInterface, ChattyInterface
{
    protected ?OutputInterface $output = null;

    public function __construct(
        protected readonly ConnectionPool $connectionPool,
    ) {}

    #[\Override]
    public function setOutput(OutputInterface $output): void
    {
        $this->output = $output;
    }

    /**
     * @return list<class-string>
     */
    #[\Override]
    public function getPrerequisites(): array
    {
        return [
            DatabaseUpdatedPrerequisite::class,
        ];
    }

    protected function tableExists(string $table): bool
    {
        return $this->connectionPool->getConnectionForTable($table)->createSchemaManager()->tablesExist([$table]);
    }

    protected function columnExists(string $table, string $column): bool
    {
        if (!$this->tableExists($table)) {
            return false;
        }

        return $this->connectionPool->getConnectionForTable($table)
            ->createSchemaManager()
            ->introspectTableByUnquotedName($table)
            ->hasColumn($column);
    }
}
