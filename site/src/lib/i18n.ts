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
    currentRole: 'Poste actuel',
    moreDetails: 'Plus de détails',
    additionalResponsibilities: 'Missions complémentaires',
    technicalEnvironment: 'Environnement technique',
    contact: 'Contact',
    downloadPdf: 'Télécharger le CV en PDF',
    downloadPdfShort: 'CV PDF',
    downloadPath: '/downloads/yoann-lascaux-cv-fr.pdf',
    enableDarkTheme: 'Activer le thème sombre',
    enableLightTheme: 'Activer le thème clair',
    seoDescription:
      'CV de Yoann Lascaux, Senior Platform Engineer / SRE spécialisé en AWS, Kubernetes, Terraform, CI/CD, observabilité et plateformes Cloud.',
    socialImageAlt: 'Yoann Lascaux — Senior Platform Engineer / SRE',
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
    currentRole: 'Current role',
    moreDetails: 'More details',
    additionalResponsibilities: 'Additional responsibilities',
    technicalEnvironment: 'Technical environment',
    contact: 'Contact',
    downloadPdf: 'Download the PDF resume',
    downloadPdfShort: 'PDF resume',
    downloadPath: '/downloads/yoann-lascaux-cv-en.pdf',
    enableDarkTheme: 'Enable dark theme',
    enableLightTheme: 'Enable light theme',
    seoDescription:
      'Resume of Yoann Lascaux, Senior Platform Engineer / SRE specializing in AWS, Kubernetes, Terraform, CI/CD, observability and Cloud platforms.',
    socialImageAlt: 'Yoann Lascaux — Senior Platform Engineer / SRE',
  },
} as const satisfies Record<Locale, Record<string, string>>;

export function formatPeriod(startDate: string, endDate: string | null, locale: Locale): string {
  const formatter = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric', timeZone: 'UTC' });
  const format = (value: string) => formatter.format(new Date(`${value}-01T00:00:00Z`));
  return `${format(startDate)} — ${endDate ? format(endDate) : translations[locale].present}`;
}
