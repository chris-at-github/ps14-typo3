// Fails when the staged composer.lock installs a shared package from the
// local path repository (packages/) instead of a tagged GitHub release.
import { execSync } from 'node:child_process';

const SHARED_PACKAGES = [
  'ps14/ps14_component',
  'ps14/ps14_container',
  'ps14/ps14_foundation',
  'ps14/ps14_menu',
  'ps14/ps14_modules',
];

let lock;
try {
  lock = JSON.parse(execSync('git show :composer.lock', {
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'ignore'],
  }));
} catch {
  process.exit(0);
}

const offending = [...lock.packages, ...(lock['packages-dev'] ?? [])]
  .filter((pkg) => SHARED_PACKAGES.includes(pkg.name) && pkg.dist?.type === 'path')
  .map((pkg) => pkg.name);

if (offending.length > 0) {
  console.error(`composer.lock installs local path packages: ${offending.join(', ')}`);
  console.error('Remove the checkouts from packages/ and run "ddev composer update \'ps14/*\'".');
  process.exit(1);
}
