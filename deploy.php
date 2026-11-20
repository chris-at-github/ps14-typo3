<?php

declare(strict_types=1);

/**
 * Deployment of this project. Run only inside DDEV:
 *
 *   ddev auth ssh
 *   ddev exec vendor/bin/dep deploy staging
 *   ddev exec vendor/bin/dep rollback staging
 *
 * General tasks come from deploy/typo3.php (template, main). Hosts and
 * project-specific settings belong in this file of the customer branch.
 * The values in main are examples.
 */

namespace Deployer;

require __DIR__ . '/deploy/typo3.php';

// Hetzner webhosting: PHPVERSION selects the PHP version of the CLI
set('env', [
    'PHPVERSION' => '8.4',
]);

host('staging')
    ->setHostname('example.com')
    ->setRemoteUser('example')
    ->setPort(222)
    ->setSshArguments(['-o StrictHostKeyChecking=accept-new'])
    ->set('deploy_path', '~/public_html/staging-v14')
    ->set('branch', 'main')
    // Basic Auth, see public/htaccess/.htaccess-staging
    ->set('check_files', ['.htpasswd']);

host('production')
    ->setHostname('example.com')
    ->setRemoteUser('example')
    ->setPort(222)
    ->setSshArguments(['-o StrictHostKeyChecking=accept-new'])
    ->set('deploy_path', '~/public_html/production-v14')
    ->set('branch', 'main');
