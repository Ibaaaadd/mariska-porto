import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..');
const htmlFile = path.join(rootDir, 'index.html');
const cvFile = path.join(rootDir, 'CV', 'cv-mariska.pdf');

if (!fs.existsSync(htmlFile)) {
  console.error(`Error: File index.html tidak ditemukan di ${htmlFile}`);
  process.exit(1);
}

const html = fs.readFileSync(htmlFile, 'utf8');
const lines = html.split(/\r?\n/);

const patterns = [
  { label: 'DUMMY', regex: /DUMMY/gi },
  { label: 'example.com', regex: /example\.com/gi },
  { label: '81234567890', regex: /81234567890/g }
];

const findings = [];

lines.forEach((line, index) => {
  const lineNum = index + 1;
  patterns.forEach(({ label, regex }) => {
    // Reset regex index for global regex
    regex.lastIndex = 0;
    if (regex.test(line)) {
      findings.push({
        type: label,
        line: lineNum,
        snippet: line.trim()
      });
    }
  });
});

// Periksa cv-mariska.pdf jika file belum ada di CV/
const cvExists = fs.existsSync(cvFile);
if (!cvExists) {
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    if (/cv-mariska\.pdf/i.test(line)) {
      findings.push({
        type: 'cv-mariska.pdf (file belum ada di CV/)',
        line: lineNum,
        snippet: line.trim()
      });
    }
  });
}

console.log('='.repeat(60));
console.log('LAPORAN PENGECEKAN DATA DUMMY (tools/check-dummy.js)');
console.log('='.repeat(60));
console.log(`File target : ${htmlFile}`);
console.log(`Status CV   : ${cvExists ? '✓ Ada di CV/cv-mariska.pdf' : '✗ Belum ada di CV/cv-mariska.pdf'}`);
console.log(`Total temuan: ${findings.length}`);
console.log('-'.repeat(60));

if (findings.length > 0) {
  console.log('\nRincian Temuan:');
  findings.forEach((item, idx) => {
    console.log(`[${idx + 1}] Baris ${item.line} [${item.type}]`);
    console.log(`    ${item.snippet}`);
  });
  console.log('\n' + '='.repeat(60));
  console.log(`HASIL: Ditemukan ${findings.length} data placeholder/dummy.`);
  console.log('='.repeat(60));
  process.exit(1);
} else {
  console.log('\nHASIL: Tidak ditemukan data placeholder/dummy. Semua bersih!');
  console.log('='.repeat(60));
  process.exit(0);
}
