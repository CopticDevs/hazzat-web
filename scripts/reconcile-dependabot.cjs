// Usage: node reconcile-dependabot.cjs REPOSITORY EXPORT_JSON [BASE_REF]
// Writes reconciliation JSON to stdout. Does not modify the repository or export.
const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const [repository, exportPath, baseRef = '827bf3cda27ca824ee59be38f89fa94e4e8aab52'] = process.argv.slice(2);
if (!repository || !exportPath) throw new Error('Usage: node reconcile-dependabot.cjs REPOSITORY EXPORT_JSON [BASE_REF]');
const root = path.resolve(repository);
const semver = require(require.resolve('semver', { paths: [root] }));
const bytes = fs.readFileSync(exportPath);
const alerts = JSON.parse(bytes.toString('utf8').replace(/^\uFEFF/, '')).flat();
assert.equal(alerts.length, new Set(alerts.map(a => a.number)).size, 'Duplicate alert IDs');
const before = JSON.parse(cp.execFileSync('git', ['show', `${baseRef}:package-lock.json`], { cwd: root })).packages;
const afterBytes = fs.readFileSync(path.join(root, 'package-lock.json'));
const after = JSON.parse(afterBytes).packages;
function copies(packages, name, range) {
    return Object.entries(packages)
        .filter(([p]) => p.endsWith(`node_modules/${name}`))
        .map(([p, entry]) => ({ path: p, version: entry.version,
            affected: semver.satisfies(entry.version, range, { includePrerelease: true }) }));
}
const rows = alerts.sort((a, b) => a.number - b.number).map(alert => {
    assert.equal(alert.state, 'open');
    assert.equal(alert.dependency.manifest_path, 'package-lock.json');
    assert(alert.html_url.startsWith('https://github.com/CopticDevs/hazzat-web/'));
    const v = alert.security_vulnerability;
    // GitHub commas denote intersecting comparators, not npm-semver syntax.
    const range = v.vulnerable_version_range.replace(/,/g, ' ');
    assert(semver.validRange(range), `Unparseable range: ${range}`);
    const oldCopies = copies(before, v.package.name, range);
    const newCopies = copies(after, v.package.name, range);
    const status = newCopies.some(x => x.affected) ? 'still affected'
        : oldCopies.some(x => x.affected) ? 'resolved by code' : 'already not affected';
    return { number: alert.number, url: alert.html_url, package: v.package.name,
        severity: v.severity, exportedRange: v.vulnerable_version_range,
        exportedFirstPatch: v.first_patched_version?.identifier ?? null,
        ghsa: alert.security_advisory.ghsa_id,
        advisory: `https://github.com/advisories/${alert.security_advisory.ghsa_id}`,
        status, before: oldCopies, after: newCopies };
});
const counts = rows.reduce((acc, row) => {
    acc[row.status] = (acc[row.status] || 0) + 1;
    return acc;
}, {});
console.log(JSON.stringify({
    base: cp.execFileSync('git', ['rev-parse', baseRef], { cwd: root }).toString().trim(),
    exportSha256: crypto.createHash('sha256').update(bytes).digest('hex'),
    lockfileSha256: crypto.createHash('sha256').update(afterBytes).digest('hex'),
    caveat: 'Local version-range reconciliation only; not GitHub closure or reachability proof. See the review for current advisory corrections.',
    counts, alerts: rows
}, null, 2));
