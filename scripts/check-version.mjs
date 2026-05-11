import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

async function readText(path) {
  return readFile(resolve(root, path), 'utf8')
}

function matchVersion(source, pattern, label) {
  const match = source.match(pattern)
  if (!match?.[1]) {
    throw new Error(`Could not read ${label}`)
  }
  return match[1]
}

const packageJson = JSON.parse(await readText('package.json'))
const packageLock = JSON.parse(await readText('package-lock.json'))
const tauriConfig = JSON.parse(await readText('src-tauri/tauri.conf.json'))
const cargoToml = await readText('src-tauri/Cargo.toml')
const cargoLock = await readText('src-tauri/Cargo.lock')
const versionSource = await readText('src/utils/version.ts')

const expected = packageJson.version
const versions = {
  'package.json': packageJson.version,
  'package-lock.json': packageLock.version,
  'package-lock root package': packageLock.packages?.['']?.version,
  'src-tauri/tauri.conf.json': tauriConfig.version,
  'src-tauri/Cargo.toml': matchVersion(cargoToml, /^version\s*=\s*"([^"]+)"/m, 'Cargo.toml package version'),
  'src-tauri/Cargo.lock plandesk': matchVersion(
    cargoLock,
    /\[\[package\]\]\s+name\s*=\s*"plandesk"\s+version\s*=\s*"([^"]+)"/m,
    'Cargo.lock plandesk version',
  ),
  'src/utils/version.ts': matchVersion(versionSource, /APP_VERSION\s*=\s*['"]([^'"]+)['"]/, 'APP_VERSION'),
}

const mismatches = Object.entries(versions).filter(([, version]) => version !== expected)

for (const [label, version] of Object.entries(versions)) {
  console.log(`${label}: ${version}`)
}

if (mismatches.length) {
  console.error(`\nVersion mismatch. Expected all app versions to match package.json (${expected}).`)
  for (const [label, version] of mismatches) {
    console.error(`- ${label}: ${version}`)
  }
  process.exit(1)
}

console.log(`\nPlanDesk version check passed: ${expected}`)
