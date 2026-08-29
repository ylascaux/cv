import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';
import type { Cv, Locale } from './types';

const files: Record<Locale, URL> = {
  fr: new URL('../../../content/cv.fr.yaml', import.meta.url),
  en: new URL('../../../content/cv.en.yaml', import.meta.url),
};

export async function getCv(locale: Locale): Promise<Cv> {
  const content = await readFile(fileURLToPath(files[locale]), 'utf8');
  return parse(content) as Cv;
}
