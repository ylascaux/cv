export type Locale = 'fr' | 'en';

export interface Link {
  label: string;
  url: string;
}

export interface TimedEntry {
  id: string;
  role: string;
  organization: string;
  contract?: string;
  startDate: string;
  endDate: string | null;
  highlights: string[];
}

export interface Education {
  id: string;
  title: string;
  institution: string;
  startDate: string;
  endDate: string | null;
  description: string;
}

export interface Cv {
  metadata: {
    locale: Locale;
    lastReviewed: string;
    source: string;
  };
  profile: {
    name: string;
    title: string;
    location: string;
    status: string;
    summary: string;
    driverLicense: string;
    links: Link[];
  };
  experiences: TimedEntry[];
  education: Education[];
  volunteering: Array<{
    id: string;
    role: string;
    organization: string;
    highlights: string[];
  }>;
  skills: Array<{
    id: string;
    name: string;
    items: Array<{ name: string; details?: string }>;
  }>;
  languages: Array<{
    id: string;
    name: string;
    level: string;
  }>;
}
