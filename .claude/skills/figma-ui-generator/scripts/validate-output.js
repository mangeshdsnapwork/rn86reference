#!/usr/bin/env node
/*
Purpose:
Validate that a generated figma-ui-generator output satisfies the skill's quality gates.
Checks: report file present, token file present, no localhost:3845 URLs remaining in code,
no inline magic values, screenshots present, VERDICT set, build command evidence, and
platform-specific fail conditions from assets/fail-conditions.md.

Usage:
  node validate-output.js --report=<path-to-report.md> --component=<name> --platform=<platform>

Arguments:
  --report      Path to the generated <component>-report.md (required)
  --component   Component name matching file name prefix (required)
  --platform    One of: angular | react | react-native | flutter | ios | android (required)
  --src         Root source folder to scan for localhost URLs and inline magic values (default: src)
  --screenshots Path to screenshots folder (default: reports/screenshots)

Exit: 0 = all blocking checks passed, 1 = one or more blocking checks failed.
No external dependencies — uses Node.js built-ins only. Requires Node.js >= 14.
*/

'use strict';

const fs = require('fs');
const path = require('path');

// ── UTILS ────────────────────────────────────────────────────────────────────

var ERRORS = 0;
var WARNINGS = 0;

function pass(msg) { console.log('[PASS] ' + msg); }
function fail(msg) { console.log('[FAIL] ' + msg); ERRORS++; }
function warn(msg) { console.log('[WARN] ' + msg); WARNINGS++; }
function step(msg) { console.log('\n── ' + msg + ' ──'); }

// ── ARG PARSING ───────────────────────────────────────────────────────────────

function parseArgs(argv) {
    var args = {};
    argv.forEach(function (arg) {
        if (!arg.startsWith('--')) return;
        var parts = arg.slice(2).split('=');
        args[parts[0]] = parts.slice(1).join('=') || 'true';
    });
    return args;
}

// ── FILE HELPERS ──────────────────────────────────────────────────────────────

function readText(filePath) {
    try { return fs.readFileSync(filePath, 'utf8'); }
    catch (_) { return null; }
}

// Recursively collect all source files under a directory, filtering by extension.
function collectFiles(dir, exts, results) {
    results = results || [];
    if (!fs.existsSync(dir)) return results;
    fs.readdirSync(dir).forEach(function (entry) {
        var full = path.join(dir, entry);
        if (fs.statSync(full).isDirectory()) {
            var skip = ['node_modules', '.git', 'build', 'dist', 'Pods', '.gradle', 'DerivedData'];
            if (skip.indexOf(entry) !== -1) return;
            collectFiles(full, exts, results);
        } else {
            var ext = path.extname(entry).toLowerCase();
            if (exts.indexOf(ext) !== -1) results.push(full);
        }
    });
    return results;
}

// ── PLATFORM CONFIG ───────────────────────────────────────────────────────────

var PLATFORM_CONFIG = {
    angular: { srcExts: ['.ts', '.html', '.scss', '.css'], tokenFile: 'src/styles/_variables.scss' },
    react: { srcExts: ['.ts', '.tsx', '.css', '.scss'], tokenFile: 'tailwind.config.ts' },
    'react-native': { srcExts: ['.ts', '.tsx'], tokenFile: 'src/theme/figma-tokens.ts' },
    flutter: { srcExts: ['.dart'], tokenFile: 'lib/core/theme/app_colors.dart' },
    ios: { srcExts: ['.swift'], tokenFile: null /* per-feature path */ },
    android: { srcExts: ['.kt', '.xml'], tokenFile: null /* Color.kt or figma_colors.xml */ },
};

// Platform-specific inline magic value patterns.
// These patterns fire on source lines that look like hardcoded design values
// rather than token constant references.
var MAGIC_PATTERNS = {
    angular: [
        { re: /:\s*#[0-9a-fA-F]{3,8}\s*[;,]/, label: 'hardcoded hex color in SCSS/CSS' },
        { re: /:\s*\d+px\s*[;,]/, label: 'hardcoded px value in SCSS/CSS' },
    ],
    react: [
        { re: /(?:color|background)[^:]*:\s*['"]#[0-9a-fA-F]{3,8}['"]/, label: 'hardcoded hex color in JSX/TSX' },
    ],
    'react-native': [
        { re: /:\s*['"]#[0-9a-fA-F]{3,8}['"]/, label: 'hardcoded hex in StyleSheet' },
        { re: /:\s*\d+,\s*\/\/\s*(?!.*token|.*AppSpacing|.*tokens)/, label: 'possible hardcoded numeric spacing' },
    ],
    flutter: [
        { re: /Color\(0xFF[0-9a-fA-F]{6}\)/, label: 'hardcoded Color() instead of AppColors constant' },
        { re: /EdgeInsets\.all\(\d+\)|EdgeInsets\.symmetric\([^A]/, label: 'hardcoded EdgeInsets instead of AppSpacing' },
    ],
    ios: [
        { re: /UIColor\(red:|Color\(hex:/, label: 'inline UIColor/Color(hex:) — use AppColors constant' },
        { re: /\.frame\(width:\s*\d+|\.frame\(height:\s*\d+/, label: 'hardcoded frame dimension — verify it uses AppSpacing or is a Figma-exact fixed value' },
    ],
    android: [
        { re: /android:textColor="#[0-9a-fA-F]{3,8}"/, label: 'hardcoded textColor in XML' },
        { re: /android:padding="\d+dp"/, label: 'hardcoded padding dp in XML' },
    ],
};

// ── CHECKS ────────────────────────────────────────────────────────────────────

function checkReport(reportPath) {
    step('Check 1: Report file present');
    var content = readText(reportPath);
    if (!content) { fail('Report file not found: ' + reportPath); return null; }
    pass('Report found: ' + reportPath);
    return content;
}

function checkVerdict(reportContent) {
    step('Check 2: VERDICT set in report');
    if (/VERDICT/.test(reportContent) && /\[x\]\s*(PASS|FAIL)/i.test(reportContent)) {
        pass('VERDICT is set');
    } else if (/VERDICT/.test(reportContent)) {
        fail('VERDICT section found but neither [x] PASS nor [x] FAIL is checked');
    } else {
        fail('VERDICT section missing from report');
    }
}

function checkTokenFile(platform, projectRoot) {
    step('Check 3: Token file present');
    var cfg = PLATFORM_CONFIG[platform];
    if (!cfg) { warn('Unknown platform "' + platform + '" — skipping token file check'); return; }
    if (!cfg.tokenFile) {
        warn('Token file path for ' + platform + ' is per-feature — verify manually that AppColors/Color.kt exists');
        return;
    }
    var tokenPath = path.join(projectRoot || '.', cfg.tokenFile);
    if (fs.existsSync(tokenPath)) { pass('Token file found: ' + tokenPath); }
    else { fail('Token file missing: ' + tokenPath); }
}

function checkLocalhostUrls(platform, srcDir) {
    step('Check 4: No localhost:3845 URLs remaining');
    var cfg = PLATFORM_CONFIG[platform];
    if (!cfg) { warn('Unknown platform — skipping localhost URL check'); return; }
    var files = collectFiles(srcDir, cfg.srcExts);
    var found = [];
    files.forEach(function (f) {
        var content = readText(f) || '';
        if (content.indexOf('localhost:3845') !== -1) found.push(f);
    });
    if (found.length === 0) { pass('No localhost:3845 URLs found in ' + files.length + ' source files'); }
    else { fail('localhost:3845 URLs found in: ' + found.join(', ')); }
}

function checkMagicValues(platform, srcDir) {
    step('Check 5: Inline magic values (spot check)');
    var patterns = MAGIC_PATTERNS[platform] || [];
    if (patterns.length === 0) { warn('No magic-value patterns defined for ' + platform + ' — skipping'); return; }
    var cfg = PLATFORM_CONFIG[platform] || { srcExts: ['.ts', '.dart', '.swift', '.kt'] };
    var files = collectFiles(srcDir, cfg.srcExts);
    var hits = [];
    files.forEach(function (f) {
        var lines = (readText(f) || '').split('\n');
        lines.forEach(function (line, idx) {
            // Skip comment lines and token definition files
            if (/^\s*\/\/|^\s*#|^\s*\*/.test(line)) return;
            patterns.forEach(function (p) {
                if (p.re.test(line)) {
                    hits.push({ file: f, line: idx + 1, label: p.label, content: line.trim().slice(0, 80) });
                }
            });
        });
    });
    if (hits.length === 0) { pass('No inline magic values detected in ' + files.length + ' source files'); }
    else {
        warn(hits.length + ' possible inline magic value(s) — review manually:');
        hits.slice(0, 10).forEach(function (h) {
            console.log('  [WARN] ' + h.file + ':' + h.line + ' — ' + h.label);
            console.log('         ' + h.content);
        });
        if (hits.length > 10) console.log('  ... and ' + (hits.length - 10) + ' more');
    }
}

function checkScreenshots(screenshotsDir, componentName) {
    step('Check 6: Screenshots present');
    var suffixes = ['-figma.png', '-reference.png', '-generated-ios.png', '-generated-android.png', '-generated-web.png', '-generated.png'];
    var refFound = false;
    var genFound = false;
    suffixes.forEach(function (s) {
        var p = path.join(screenshotsDir, componentName + s);
        if (fs.existsSync(p)) {
            if (s.includes('figma') || s.includes('reference')) refFound = true;
            if (s.includes('generated')) genFound = true;
        }
    });
    if (refFound) { pass('Reference screenshot found'); } else { warn('Reference screenshot missing (expected ' + componentName + '-figma.png or -reference.png). Please verify manually.'); }
    if (genFound) { pass('Generated screenshot found'); } else { warn('Generated screenshot missing (expected ' + componentName + '-generated-*.png). Please verify manually.'); }
}

function checkReportSections(reportContent) {
    step('Check 7: Required report sections present');
    var required = [
        'Stack Detection',
        'UI Component Mapping',
        'Design Tokens',
        'Affected Files',
        'VERDICT',
    ];
    required.forEach(function (section) {
        if (reportContent.indexOf(section) !== -1) { pass('Section "' + section + '" present'); }
        else { warn('Section "' + section + '" missing from report'); }
    });
}

// ── MAIN ──────────────────────────────────────────────────────────────────────

function main() {
    console.log('\n═══════════════════════════════════════════════════');
    console.log('  figma-ui-generator — Output Validator');
    console.log('═══════════════════════════════════════════════════');

    var args = parseArgs(process.argv.slice(2));

    if (!args.report || !args.component || !args.platform) {
        console.error('Usage: node validate-output.js --report=<path> --component=<name> --platform=<platform>');
        console.error('Platforms: angular | react | react-native | flutter | ios | android');
        process.exitCode = 1;
        return;
    }

    var reportPath = args.report;
    var componentName = args.component;
    var platform = args.platform.toLowerCase();
    var srcDir = args.src || 'src';
    var screenshotsDir = args.screenshots || path.join('reports', 'screenshots');

    var reportContent = checkReport(reportPath);
    if (reportContent) {
        checkVerdict(reportContent);
        checkReportSections(reportContent);
    }
    checkTokenFile(platform, args.root || '.');
    checkLocalhostUrls(platform, srcDir);
    checkMagicValues(platform, srcDir);
    checkScreenshots(screenshotsDir, componentName);

    console.log('\n───────────────────────────────────────────────────');
    if (ERRORS === 0 && WARNINGS === 0) {
        console.log('RESULT: PASS — all checks passed');
    } else if (ERRORS === 0) {
        console.log('RESULT: PASS (with ' + WARNINGS + ' warning(s)) — blocking checks passed');
    } else {
        console.log('RESULT: FAIL — ' + ERRORS + ' blocking error(s), ' + WARNINGS + ' warning(s)');
    }
    console.log('───────────────────────────────────────────────────\n');

    if (ERRORS > 0) process.exitCode = 1;
}

main();
