<?php

declare(strict_types=1);

namespace Ps14\Site\Upgrades;

use Doctrine\DBAL\ArrayParameterType;
use TYPO3\CMS\Core\Attribute\UpgradeWizard;
use TYPO3\CMS\Core\Configuration\FlexForm\FlexFormTools;
use TYPO3\CMS\Core\Database\ConnectionPool;
use TYPO3\CMS\Core\Utility\GeneralUtility;

/**
 * Container (ps14_container 2.x): Spaltenbreiten im 12er-Raster (settings.columnOneWidth ...)
 * -> feste Aufteilung "ratio" (ps14_container v14, z. B. "33-66")
 *
 * Gewaehlt wird die erlaubte Aufteilung mit der geringsten Abweichung der Spaltenanteile.
 * Nicht exakt abbildbare Elemente werden ausgegeben und muessen redaktionell geprueft werden.
 */
#[UpgradeWizard('ps14Site_containerRatioMigration')]
final class ContainerRatioMigration extends AbstractMigration
{
    private const TABLE = 'tt_content';

    /**
     * Erlaubte Aufteilungen je CType (Default zuerst), siehe EXT:ps14_container/Configuration/FlexForms/
     */
    private const RATIOS = [
        'ps14_container_2_column' => ['50-50', '33-66', '66-33', '25-75', '75-25'],
        'ps14_container_3_column' => ['33-33-33', '25-50-25', '50-25-25', '25-25-50'],
    ];

    private const WIDTH_FIELDS = ['settings.columnOneWidth', 'settings.columnTwoWidth', 'settings.columnThreeWidth'];

    public function __construct(
        ConnectionPool $connectionPool,
        private readonly FlexFormTools $flexFormTools,
    ) {
        parent::__construct($connectionPool);
    }

    #[\Override]
    public function getTitle(): string
    {
        return 'KIST: Migrate the column widths of the containers to the ratio of ps14_container v14';
    }

    #[\Override]
    public function getDescription(): string
    {
        return 'Converts the FlexForm fields "settings.column*Width" (12 column grid) of ps14_container 2.x into the field "ratio".';
    }

    #[\Override]
    public function updateNecessary(): bool
    {
        return $this->getRecords() !== [];
    }

    #[\Override]
    public function executeUpdate(): bool
    {
        $connection = $this->connectionPool->getConnectionForTable(self::TABLE);

        foreach ($this->getRecords() as $record) {
            $cType = (string)$record['CType'];
            $widths = $this->getWidths((string)($record['pi_flexform'] ?? ''), count(explode('-', self::RATIOS[$cType][0])));
            [$ratio, $exact] = $this->findRatio($widths, self::RATIOS[$cType]);

            $flexForm = $this->flexFormTools->flexArray2Xml([
                'data' => [
                    'main' => [
                        'lDEF' => [
                            'ratio' => ['vDEF' => $ratio],
                        ],
                    ],
                ],
            ]);

            $connection->update(self::TABLE, ['pi_flexform' => $flexForm], ['uid' => (int)$record['uid']]);

            if (!$exact) {
                $this->output?->writeln(sprintf(
                    'tt_content %d: widths "%s" mapped to "%s", please check.',
                    (int)$record['uid'],
                    implode('/', $widths),
                    $ratio,
                ));
            }
        }

        return true;
    }

    /**
     * Container ohne Feld "ratio"
     *
     * @return list<array<string, mixed>>
     */
    private function getRecords(): array
    {
        $queryBuilder = $this->connectionPool->getQueryBuilderForTable(self::TABLE);
        $queryBuilder->getRestrictions()->removeAll();

        $records = $queryBuilder
            ->select('uid', 'CType', 'pi_flexform')
            ->from(self::TABLE)
            ->where(
                $queryBuilder->expr()->in('CType', $queryBuilder->createNamedParameter(array_keys(self::RATIOS), ArrayParameterType::STRING)),
            )
            ->executeQuery()
            ->fetchAllAssociative();

        return array_values(array_filter(
            $records,
            static fn(array $record): bool => !str_contains((string)($record['pi_flexform'] ?? ''), 'index="ratio"'),
        ));
    }

    /**
     * @return list<int>
     */
    private function getWidths(string $flexForm, int $columns): array
    {
        $data = $flexForm !== '' ? GeneralUtility::xml2array($flexForm) : [];
        $fields = is_array($data) ? ($data['data']['main']['lDEF'] ?? []) : [];
        $widths = [];

        foreach (array_slice(self::WIDTH_FIELDS, 0, $columns) as $field) {
            $widths[] = (int)($fields[$field]['vDEF'] ?? 0);
        }

        return $widths;
    }

    /**
     * @param list<int> $widths
     * @param list<string> $ratios
     * @return array{0: string, 1: bool} Aufteilung und ob sie den Breiten exakt entspricht
     */
    private function findRatio(array $widths, array $ratios): array
    {
        $sum = array_sum($widths);

        if ($sum <= 0 || in_array(0, $widths, true)) {
            return [$ratios[0], false];
        }

        $shares = array_map(static fn(int $width): float => $width / $sum * 100, $widths);
        $bestRatio = $ratios[0];
        $bestDeviation = PHP_FLOAT_MAX;

        foreach ($ratios as $ratio) {
            $deviation = 0.0;

            foreach (explode('-', $ratio) as $index => $share) {
                $deviation += abs((float)$share - $shares[$index]);
            }

            if ($deviation < $bestDeviation) {
                $bestDeviation = $deviation;
                $bestRatio = $ratio;
            }
        }

        // Exakt: 12er-Raster vollstaendig genutzt und Abweichung nur durch Rundung (33 statt 33,3)
        return [$bestRatio, $sum === 12 && $bestDeviation < 3];
    }
}
