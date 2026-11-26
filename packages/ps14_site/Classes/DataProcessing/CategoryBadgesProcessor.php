<?php

declare(strict_types=1);

namespace Ps14\Site\DataProcessing;

use Doctrine\DBAL\ArrayParameterType;
use Doctrine\DBAL\ParameterType;
use TYPO3\CMS\Core\Database\ConnectionPool;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Frontend\ContentObject\ContentObjectRenderer;
use TYPO3\CMS\Frontend\ContentObject\DataProcessorInterface;

/**
 * Kategorien einer Seite als Badges (Teaser): nur Kategorien, deren Elternkategorie in "parentCategories" steht.
 * Ersetzt Page::getBadges() aus dem v12-Plugin ps14_teaser.
 *
 * Beispiel (als Unter-Processor eines Menues):
 *   50 = Ps14\Site\DataProcessing\CategoryBadgesProcessor
 *   50 {
 *     as = badges
 *     parentCategories = 141, 157
 *   }
 */
final readonly class CategoryBadgesProcessor implements DataProcessorInterface
{
    public function __construct(
        private ConnectionPool $connectionPool,
    ) {}

    /**
     * @param array<string, mixed> $contentObjectConfiguration
     * @param array<string, mixed> $processorConfiguration
     * @param array<string, mixed> $processedData
     * @return array<string, mixed>
     */
    #[\Override]
    public function process(ContentObjectRenderer $cObj, array $contentObjectConfiguration, array $processorConfiguration, array $processedData): array
    {
        $as = (string)$cObj->stdWrapValue('as', $processorConfiguration, 'badges');
        $parents = GeneralUtility::intExplode(',', (string)$cObj->stdWrapValue('parentCategories', $processorConfiguration, ''), true);
        $pageUid = (int)($processedData['data']['uid'] ?? 0);

        $processedData[$as] = $parents !== [] && $pageUid > 0 ? $this->findBadges($pageUid, $parents) : [];

        return $processedData;
    }

    /**
     * @param list<int> $parents
     * @return list<array<string, mixed>>
     */
    private function findBadges(int $pageUid, array $parents): array
    {
        $queryBuilder = $this->connectionPool->getQueryBuilderForTable('sys_category');

        return $queryBuilder
            ->select('category.uid', 'category.title')
            ->from('sys_category', 'category')
            ->join(
                'category',
                'sys_category_record_mm',
                'mm',
                $queryBuilder->expr()->eq('mm.uid_local', $queryBuilder->quoteIdentifier('category.uid')),
            )
            ->where(
                $queryBuilder->expr()->eq('mm.tablenames', $queryBuilder->createNamedParameter('pages')),
                $queryBuilder->expr()->eq('mm.fieldname', $queryBuilder->createNamedParameter('categories')),
                $queryBuilder->expr()->eq('mm.uid_foreign', $queryBuilder->createNamedParameter($pageUid, ParameterType::INTEGER)),
                $queryBuilder->expr()->in('category.parent', $queryBuilder->createNamedParameter($parents, ArrayParameterType::INTEGER)),
            )
            ->orderBy('mm.sorting_foreign')
            ->executeQuery()
            ->fetchAllAssociative();
    }
}
