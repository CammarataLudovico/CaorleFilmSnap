const { spawnSync } = require('child_process');

function loadSqlite() {
  try {
    require('sqlite3');
    return true;
  } catch (error) {
    console.warn('sqlite3 binding load failed:', error.message);
    return false;
  }
}

function rebuildSqliteFromSource() {
  const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const result = spawnSync(npmCommand, ['rebuild', 'sqlite3'], {
    stdio: 'inherit',
    env: {
      ...process.env,
      npm_config_build_from_source: 'true',
    },
  });

  return result.status === 0;
}

if (loadSqlite()) {
  process.exit(0);
}

console.warn('Trying sqlite3 rebuild from source for local libc compatibility...');
if (!rebuildSqliteFromSource()) {
  console.error('sqlite3 rebuild failed. Run "npm rebuild sqlite3" manually.');
  process.exit(1);
}

if (!loadSqlite()) {
  console.error('sqlite3 is still unavailable after rebuild.');
  process.exit(1);
}

console.log('sqlite3 compatibility check completed.');