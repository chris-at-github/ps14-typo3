<?php

declare(strict_types=1);

/**
 * Deployer recipe for TYPO3 projects of this template (from main).
 *
 * Builds an artifact locally in DDEV (committed state, vendor without dev
 * packages, Vite build), uploads it into a new release and runs
 * bin/update-system.sh there before the release goes live. The server needs
 * neither Composer nor access to the repository.
 *
 * Hosts and project-specific settings belong in deploy.php.
 */

namespace Deployer;

require 'recipe/common.php';

// Project root inside the DDEV web container
set('local_root', dirname(__DIR__));
set('build_path', '{{local_root}}/temp/deploy/build');
set('artifact', '{{local_root}}/temp/deploy/package.tgz');

// Files and directories of the export that are not needed on the server
set('artifact_excludes', [
    './.claude',
    './.ddev',
    './.editorconfig',
    './.editorconfig-checker.json',
    './.env.ddev',
    './.gitignore',
    './.php-cs-fixer.dist.php',
    './.stylelintrc.js',
    './CLAUDE.md',
    './bin/create-system.sh',
    './build',
    './config/system/additional.ddev.php',
    './deploy',
    './deploy.php',
    './docs',
    './eslint.config.js',
    './fractor.php',
    './node_modules',
    './package-lock.json',
    './package.json',
    './phpstan.neon',
    './phpstan.paths.php',
    './rector.php',
    './sql',
    './temp',
    './var',
    './vite.config.js',
]);

set('shared_dirs', [
    'public/fileadmin',
    'public/typo3temp/assets',
    'var/lock',
    'var/log',
    'var/session',
]);

// Must exist on the server before the first deploy (see typo3:check)
set('shared_files', [
    '.env',
    'config/system/additional.php',
]);

// Further files in shared/ that must exist, but are not linked into the
// release (e.g. .htpasswd of staging, outside the docroot)
set('check_files', []);

set('keep_releases', 3);
set('log_files', 'var/log/*.log');

desc('Checks that the committed state of the expected branch is deployed');
task('build:check', function (): void {
    $branch = runLocally('git -C {{local_root}} rev-parse --abbrev-ref HEAD');
    if ($branch !== get('branch')) {
        throw error(sprintf('Branch "%s" is checked out, host expects "%s".', $branch, get('branch')));
    }
    if (runLocally('git -C {{local_root}} status --porcelain') !== '') {
        throw error('The working tree is not clean. Commit or stash your changes first.');
    }
})->once();

desc('Builds the artifact from the committed state');
task('build:artifact', function (): void {
    runLocally('rm -rf {{build_path}} {{artifact}} && mkdir -p {{build_path}}');
    runLocally('git -C {{local_root}} archive HEAD | tar -x -C {{build_path}}');

    $build = 'cd {{build_path}} && ';
    runLocally($build . 'composer install --no-dev --optimize-autoloader --no-interaction --no-progress', ['timeout' => 900]);
    runLocally($build . 'npm ci --no-audit --no-fund', ['timeout' => 900]);
    runLocally($build . 'node build/build-iconfont.js');
    runLocally($build . 'npx vite build', ['timeout' => 900]);

    $excludes = implode(' ', array_map(
        static fn(string $path): string => '--exclude=' . escapeshellarg($path),
        get('artifact_excludes')
    ));
    runLocally($build . "tar -czf {{artifact}} --anchored $excludes .", ['timeout' => 900]);
    runLocally('rm -rf {{build_path}}');
    writeln('Artifact: ' . runLocally('du -h {{artifact}} | cut -f1'));
})->once();

desc('Uploads and unpacks the artifact into the release');
task('deploy:update_code', function (): void {
    upload('{{artifact}}', '{{release_path}}/package.tgz');
    run('cd {{release_path}} && tar -xzf package.tgz && rm package.tgz');

    // .htaccess of the stage; @DEPLOY_PATH@ becomes the absolute deploy path
    // (e.g. for AuthUserFile)
    $deployPath = run('cd {{deploy_path}} && pwd -P');
    run("sed 's|@DEPLOY_PATH@|$deployPath|g' {{release_path}}/public/htaccess/.htaccess-{{alias}} > {{release_path}}/public/.htaccess");
});

desc('Checks that the shared and check files exist on the server');
task('typo3:check', function (): void {
    foreach ([...get('shared_files'), ...get('check_files')] as $file) {
        if (!test("[ -s {{deploy_path}}/shared/$file ]")) {
            throw error(sprintf('Missing or empty on the server: %s/shared/%s', get('deploy_path'), $file));
        }
    }
});

desc('Updates database schema, runs upgrade wizards and warms up caches');
task('typo3:update', function (): void {
    run('cd {{release_path}} && bin/update-system.sh', ['timeout' => 900]);
});

desc('Flushes the TYPO3 caches of the current release');
task('typo3:cache:flush', function (): void {
    run('cd {{current_path}} && php vendor/bin/typo3 cache:flush');
});

task('deploy', [
    'build:check',
    'build:artifact',
    'deploy:prepare',
    'typo3:update',
    'deploy:publish',
]);

before('deploy:shared', 'typo3:check');
after('rollback', 'typo3:cache:flush');
after('deploy:failed', 'deploy:unlock');
