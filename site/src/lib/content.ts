import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';
import type { Cv, Locale } from './types';

const contentDirectory = fileURLToPath(new URL('../../../content/', import.meta.url));

const files: Record<Locale, string> = {
  fr: resolve(contentDirectory, 'cv.fr.yaml'),
  en: resolve(contentDirectory, 'cv.en.yaml'),
};

export async function getCv(locale: Locale): Promise<Cv> {
  const content = await readFile(files[locale], 'utf8');
  return parse(content) as Cv;
}
