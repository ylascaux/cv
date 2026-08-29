import type { Locale } from './types';

export const translations = {
  fr: {
    skip: 'Aller au contenu',
    language: 'English version',
    languageCode: 'EN',
    languageHref: '/en/',
    about: 'Profil',
    experience: 'Expériences',
    education: 'Formations',
    volunteering: 'Engagement associatif',
    skills: 'Compétences',
    languages: 'Langues',
    present: 'Aujourd’hui',
    since: 'Depuis',
    source: 'Contenu initial importé depuis DoYouBuzz',
    downloadPdf: 'Télécharger le CV en PDF',
    downloadPath: '/downloads/yoann-lascaux-cv-fr.pdf',
  },
  en: {
    skip: 'Skip to content',
    language: 'Version française',
    languageCode: 'FR',
    languageHref: '/',
    about: 'Profile',
    experience: 'Experience',
    education: 'Education',
    volunteering: 'Volunteering',
    skills: 'Skills',
    languages: 'Languages',
    present: 'Present',
    since: 'Since',
    source: 'Initial content imported from DoYouBuzz',
    downloadPdf: 'Download the PDF resume',
    downloadPath: '/downloads/yoann-lascaux-cv-en.pdf',
  },
} as const satisfies Record<Locale, Record<string, string>>;

export function formatPeriod(startDate: string, endDate: string | null, locale: Locale): string {
  const formatter = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric', timeZone: 'UTC' });
  const format = (value: string) => formatter.format(new Date(`${value}-01T00:00:00Z`));
  return `${format(startDate)} — ${endDate ? format(endDate) : translations[locale].present}`;
}
