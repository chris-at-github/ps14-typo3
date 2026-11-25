<?php

declare(strict_types=1);

namespace Ps14\Site\Upgrades;

use TYPO3\CMS\Core\Attribute\UpgradeWizard;
use TYPO3\CMS\Core\Configuration\FlexForm\FlexFormTools;
use TYPO3\CMS\Core\Database\ConnectionPool;
use TYPO3\CMS\Core\Utility\GeneralUtility;

/**
 * Teaser-Plugin aus v12 (ps14_teaser, list_type "ps14teaser_frontend") -> Core-Menues mit den Teaser-Ansichten aus
 * ps14_site (ps14_menu):
 *
 * - Quelle "pages" -> menu_pages (feste Auswahl) bzw. menu_subpages (pagesProcessing = subpages)
 * - Quelle "categories" -> menu_categorized_pages (Startpunkt pages/recursive bleibt)
 * - Variante 1 -> teaser-technology, Variante 2 -> teaser-grey, Layout aside -> teaser-aside, sonst teaser
 * - Optionen -> FlexForm Configuration/FlexForms/Modules/Menu.xml (Sheets main, teaser); die eigene Seite war im
 *   Plugin immer ausgeschlossen (excludeCurrentPage = 1)
 *
 * Zusaetzlich: Seitenfelder pages.tx_teaser_* -> pages.tx_site_teaser_* (inkl. Dateireferenzen).
 */
#[UpgradeWizard('ps14Site_teaserMigration')]
final class TeaserMigration extends AbstractMigration
{
    private const LIST_TYPE = 'ps14teaser_frontend';

    /**
     * Seitenfeld alt => neu
     */
    private const PAGE_FIELDS = [
        'tx_teaser_title' => 'tx_site_teaser_title',
        'tx_teaser_abstract_long' => 'tx_site_teaser_abstract_long',
        'tx_teaser_readmore' => 'tx_site_teaser_readmore',
    ];

    private const PAGE_FILE_FIELD = ['tx_teaser_media_large', 'tx_site_teaser_media_large'];

    public function __construct(
        ConnectionPool $connectionPool,
        private readonly FlexFormTools $flexFormTools,
    ) {
        parent::__construct($connectionPool);
    }

    #[\Override]
    public function getTitle(): string
    {
        return 'KIST: Migrate the teaser plugin (ps14_teaser) to menu content elements with teaser views';
    }

    #[\Override]
    public function getDescription(): string
    {
        return 'Converts "ps14teaser_frontend" plugins into menu_pages, menu_subpages or menu_categorized_pages and copies the page fields "tx_teaser_*" to "tx_site_teaser_*".';
    }

    #[\Override]
    public function updateNecessary(): bool
    {
        return $this->getPlugins() !== [] || $this->getPendingPages() !== [];
    }

    #[\Override]
    public function executeUpdate(): bool
    {
        $this->migratePages();

        $connection = $this->connectionPool->getConnectionForTable('tt_content');
        $plugins = $this->getPlugins();

        foreach ($plugins as $plugin) {
            $connection->update('tt_content', $this->convert($plugin), ['uid' => (int)$plugin['uid']]);
        }

        $this->output?->writeln(sprintf('Migrated %d teaser plugins.', count($plugins)));

        return true;
    }

    /**
     * @param array<string, mixed> $plugin
     * @return array<string, mixed>
     */
    private function convert(array $plugin): array
    {
        $settings = $this->getSettings((string)($plugin['pi_flexform'] ?? ''));
        $variant = (string)($plugin['tx_foundation_variant'] ?? '');

        $values = [
            'list_type' => '',
            'tx_foundation_variant' => match (true) {
                $variant === '1' => 'teaser-technology',
                $variant === '2' => 'teaser-grey',
                ($settings['layout'] ?? '') === 'aside' => 'teaser-aside',
                default => 'teaser',
            },
            'pi_flexform' => $this->flexFormTools->flexArray2Xml([
                'data' => [
                    'main' => [
                        'lDEF' => [
                            'includeNotInMenu' => ['vDEF' => (int)($settings['hiddenEnabled'] ?? 0)],
                            'excludeCurrentPage' => ['vDEF' => 1],
                        ],
                    ],
                    'teaser' => [
                        'lDEF' => [
                            'readmoreEnabled' => ['vDEF' => (int)($settings['readmoreEnabled'] ?? 0)],
                            'abstractType' => ['vDEF' => $settings['abstractType'] ?? 'default'],
                            'asideAlignment' => ['vDEF' => $settings['asideAlignment'] ?? 'left'],
                            'asideMediaSize' => ['vDEF' => $settings['asideMediaSize'] ?? 'default'],
                            'textAlignment' => ['vDEF' => $settings['textAlignment'] ?? 'default'],
                            'subpagesEnabled' => ['vDEF' => (int)($settings['subpagesEnabled'] ?? 0)],
                            'subpagesLayout' => ['vDEF' => $settings['subpagesLayout'] ?? 'default'],
                        ],
                    ],
                ],
            ]),
        ];

        if (($settings['source'] ?? 'pages') === 'categories') {
            $values['CType'] = 'menu_categorized_pages';
            $values['selected_categories'] = (string)($settings['categories'] ?? '');
            $values['category_field'] = 'categories';
        } else {
            $values['CType'] = ($settings['pagesProcessing'] ?? '') === 'subpages' ? 'menu_subpages' : 'menu_pages';
            $values['pages'] = (string)($settings['pages'] ?? '');
            $values['recursive'] = 0;
        }

        return $values;
    }

    /**
     * @return array<string, string> Einstellung (ohne "settings.") => Wert
     */
    private function getSettings(string $flexForm): array
    {
        $data = $flexForm !== '' ? GeneralUtility::xml2array($flexForm) : [];
        $settings = [];

        if (!is_array($data)) {
            return $settings;
        }

        foreach ($data['data'] ?? [] as $sheet) {
            foreach ($sheet['lDEF'] ?? [] as $field => $value) {
                if (str_starts_with((string)$field, 'settings.')) {
                    $settings[substr((string)$field, 9)] = trim((string)($value['vDEF'] ?? ''));
                }
            }
        }

        return $settings;
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function getPlugins(): array
    {
        $queryBuilder = $this->connectionPool->getQueryBuilderForTable('tt_content');
        $queryBuilder->getRestrictions()->removeAll();

        return $queryBuilder
            ->select('uid', 'pi_flexform', 'tx_foundation_variant')
            ->from('tt_content')
            ->where(
                $queryBuilder->expr()->eq('CType', $queryBuilder->createNamedParameter('list')),
                $queryBuilder->expr()->eq('list_type', $queryBuilder->createNamedParameter(self::LIST_TYPE)),
            )
            ->executeQuery()
            ->fetchAllAssociative();
    }

    private function migratePages(): void
    {
        $connection = $this->connectionPool->getConnectionForTable('pages');

        foreach ($this->getPendingPages() as $uid => $values) {
            $connection->update('pages', $values, ['uid' => $uid]);
        }

        [$oldFileField, $newFileField] = self::PAGE_FILE_FIELD;
        $queryBuilder = $this->connectionPool->getQueryBuilderForTable('sys_file_reference');
        $queryBuilder->getRestrictions()->removeAll();
        $queryBuilder
            ->update('sys_file_reference')
            ->set('fieldname', $newFileField)
            ->where(
                $queryBuilder->expr()->eq('tablenames', $queryBuilder->createNamedParameter('pages')),
                $queryBuilder->expr()->eq('fieldname', $queryBuilder->createNamedParameter($oldFileField)),
            )
            ->executeStatement();
    }

    /**
     * Seiten mit Werten in den alten Feldern, die noch nicht uebernommen sind
     *
     * @return array<int, array<string, mixed>> uid => Feld => Wert
     */
    private function getPendingPages(): array
    {
        $fields = [...self::PAGE_FIELDS, self::PAGE_FILE_FIELD[0] => self::PAGE_FILE_FIELD[1]];

        foreach ($fields as $oldField => $newField) {
            if (!$this->columnExists('pages', $oldField) || !$this->columnExists('pages', $newField)) {
                return [];
            }
        }

        $queryBuilder = $this->connectionPool->getQueryBuilderForTable('pages');
        $queryBuilder->getRestrictions()->removeAll();
        $rows = $queryBuilder
            ->select('uid', ...array_keys($fields), ...array_values($fields))
            ->from('pages')
            ->executeQuery()
            ->fetchAllAssociative();

        $pending = [];
        foreach ($rows as $row) {
            $values = [];
            foreach ($fields as $oldField => $newField) {
                $old = $row[$oldField] ?? null;
                if ($old !== null && $old !== '' && $old !== 0 && $old !== '0' && (string)$old !== (string)($row[$newField] ?? '')) {
                    $values[$newField] = $old;
                }
            }

            if ($values !== []) {
                $pending[(int)$row['uid']] = $values;
            }
        }

        return $pending;
    }
}
