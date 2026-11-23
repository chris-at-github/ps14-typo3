<?php

declare(strict_types=1);

/**
 * Creates a gzip compressed dump of the TYPO3 database on the remote server and writes it to STDOUT.
 *
 * Runs on the server, used by `ddev pull prod-v12` (.ddev/providers/prod-v12.yaml). The script is copied into a
 * temporary file first: read from STDIN (php -- ...), child processes would consume the rest of the script.
 *   php <tmpfile> <project root> > db.sql.gz
 *
 * Credentials are read in this order (the password never appears on the command line):
 * 1. <root>/.env: TYPO3_DB_HOST, TYPO3_DB_PORT, TYPO3_DB_DBNAME, TYPO3_DB_USER, TYPO3_DB_PASSWORD
 * 2. <root>/config/system/additional.php (TYPO3 v14, Composer mode)
 * 3. <root>/typo3conf/system/additional.php (TYPO3 v12, classic mode)
 *
 * Cache and session tables are dumped without data.
 *
 * Check mode (no dump, prints source, user, host, database and the number of tables):
 *   php <tmpfile> <project root> check
 */

$root = rtrim((string)($argv[1] ?? ''), '/');
$checkOnly = ($argv[2] ?? '') === 'check';

if ($root === '' || !is_dir($root)) {
    fail('Project root not found: ' . $root);
}

$credentials = readCredentialsFromEnv($root . '/.env');
$source = '.env';

if ($credentials === null) {
    foreach (['config/system/additional.php', 'typo3conf/system/additional.php'] as $file) {
        $credentials = readCredentialsFromPhp($root . '/' . $file);

        if ($credentials !== null) {
            $source = $file;
            break;
        }
    }
}

if ($credentials === null) {
    fail('No database credentials found in .env, config/system/additional.php or typo3conf/system/additional.php');
}

writeError(sprintf("Dumping %s@%s/%s (credentials from %s)\n", $credentials['user'], $credentials['host'], $credentials['dbname'], $source));

// Credentials only in a temporary defaults file (mode 0600), never as command line argument
$defaultsFile = (string)tempnam(sys_get_temp_dir(), 'ddev-pull-');
chmod($defaultsFile, 0600);
register_shutdown_function(static fn() => @unlink($defaultsFile));
file_put_contents($defaultsFile, sprintf(
    "[client]\nhost=%s\nport=%s\nuser=%s\npassword=\"%s\"\n",
    $credentials['host'],
    $credentials['port'],
    $credentials['user'],
    addcslashes($credentials['password'], '"\\'),
));

$database = escapeshellarg($credentials['dbname']);
$defaults = '--defaults-extra-file=' . escapeshellarg($defaultsFile);

exec(sprintf('mysql %s -N -e "SHOW TABLES" %s', $defaults, $database), $tables, $exitCode);

if ($exitCode !== 0) {
    fail('Could not read the table list');
}

if ($checkOnly) {
    writeError(sprintf("OK: %d tables\n", count($tables)));
    exit(0);
}

$withoutData = array_values(array_filter(
    $tables,
    static fn(string $table): bool => str_starts_with($table, 'cache_') || in_array($table, ['be_sessions', 'fe_sessions'], true),
));

$options = '--single-transaction --quick --no-tablespaces --default-character-set=utf8mb4';
$ignore = implode(' ', array_map(
    static fn(string $table): string => '--ignore-table=' . escapeshellarg($credentials['dbname'] . '.' . $table),
    $withoutData,
));
$structureOnly = $withoutData !== []
    ? sprintf('mysqldump %s %s --no-data %s %s;', $defaults, $options, $database, implode(' ', array_map('escapeshellarg', $withoutData)))
    : '';

$command = sprintf(
    '{ mysqldump %s %s %s %s; %s } | gzip -c',
    $defaults,
    $options,
    $ignore,
    $database,
    $structureOnly,
);

passthru('bash -o pipefail -c ' . escapeshellarg($command), $exitCode);

if ($exitCode !== 0) {
    fail('mysqldump failed (exit code ' . $exitCode . ')');
}

/**
 * @return array{host: string, port: string, dbname: string, user: string, password: string}|null
 */
function readCredentialsFromEnv(string $file): ?array
{
    if (!is_file($file)) {
        return null;
    }

    $values = [];

    foreach ((array)file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        if (preg_match('/^\s*(?:export\s+)?(TYPO3_DB_[A-Z]+)\s*=\s*(.*?)\s*$/', (string)$line, $matches) === 1) {
            $values[$matches[1]] = trim($matches[2], '"\'');
        }
    }

    return normalize([
        'host' => $values['TYPO3_DB_HOST'] ?? '',
        'port' => $values['TYPO3_DB_PORT'] ?? '',
        'dbname' => $values['TYPO3_DB_DBNAME'] ?? '',
        'user' => $values['TYPO3_DB_USER'] ?? '',
        'password' => $values['TYPO3_DB_PASSWORD'] ?? '',
    ]);
}

/**
 * The file uses TYPO3 classes and cannot be included, the values are read with regular expressions:
 * $GLOBALS['TYPO3_CONF_VARS']['DB']['Connections']['Default']['host'] = '...';  or  'host' => '...',
 *
 * @return array{host: string, port: string, dbname: string, user: string, password: string}|null
 */
function readCredentialsFromPhp(string $file): ?array
{
    if (!is_file($file)) {
        return null;
    }

    $content = (string)file_get_contents($file);
    $credentials = [];

    foreach (['host', 'port', 'dbname', 'user', 'password'] as $key) {
        $pattern = '/[\'"]' . $key . '[\'"]\s*(?:\]\s*=|=>)\s*([\'"])(.*?)(?<!\\\\)\1/';
        $credentials[$key] = preg_match($pattern, $content, $matches) === 1 ? stripslashes($matches[2]) : '';
    }

    return normalize($credentials);
}

/**
 * @param array{host: string, port: string, dbname: string, user: string, password: string} $credentials
 * @return array{host: string, port: string, dbname: string, user: string, password: string}|null
 */
function normalize(array $credentials): ?array
{
    if ($credentials['host'] === '' || $credentials['dbname'] === '' || $credentials['user'] === '') {
        return null;
    }

    if ($credentials['port'] === '') {
        $credentials['port'] = '3306';
    }

    return $credentials;
}

/**
 * Messages go to STDERR, STDOUT carries the dump
 */
function writeError(string $message): void
{
    file_put_contents('php://stderr', $message);
}

function fail(string $message): never
{
    writeError('ERROR: ' . $message . "\n");
    exit(1);
}
