import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { parse } from 'yaml';

const root = resolve(import.meta.dirname, '..');
const schema = JSON.parse(await readFile(resolve(root, 'content/schema.json'), 'utf8'));
const files = [
  { locale: 'fr', path: resolve(root, 'content/cv.fr.yaml') },
  { locale: 'en', path: resolve(root, 'content/cv.en.yaml') },
];

const ajv = new Ajv2020({ allErrors: true });
addFormats(ajv);
const validate = ajv.compile(schema);
const documents = [];
let failed = false;

for (const file of files) {
  const document = parse(await readFile(file.path, 'utf8'));
  documents.push(document);

  if (!validate(document)) {
    failed = true;
    console.error(`Invalid content: ${file.path}`);
    for (const error of validate.errors ?? []) {
      console.error(`  ${error.instancePath || '/'} ${error.message}`);
    }
  }

  if (document.metadata?.locale !== file.locale) {
    failed = true;
    console.error(`${file.path}: expected locale ${file.locale}`);
  }

  for (const section of ['experiences', 'education']) {
    for (const entry of document[section] ?? []) {
      if (entry.endDate && entry.endDate < entry.startDate) {
        failed = true;
        console.error(`${file.path}: ${section}.${entry.id} ends before it starts`);
      }
    }
  }
}

for (const section of ['experiences', 'education', 'volunteering', 'skills', 'languages']) {
  const [first, ...others] = documents.map((document) =>
    (document[section] ?? [])
      .map(({ id }) => id)
      .sort()
      .join(','),
  );
  if (others.some((ids) => ids !== first)) {
    failed = true;
    console.error(`Translations do not expose the same IDs in section: ${section}`);
  }
}

if (failed) process.exit(1);
console.log(`Validated ${files.length} CV content files.`);
