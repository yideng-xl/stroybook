export interface StoryPage {
  pageNumber: number;
  textZh: string;
  textEn: string;
  audioUrlZh?: string;
  audioUrlEn?: string;
}

export enum StoryStatus {
  DRAFT = 'DRAFT',
  GENERATING = 'GENERATING',
  PUBLISHED = 'PUBLISHED',
  FAILED = 'FAILED',
}

export interface StoryStyle {
  id: string; // e.g., "迪士尼"
  name: string;
  nameEn?: string; // Optional
  coverImage: string;
}

// Comprehensive Story interface from backend entity
export interface Story {
  id: string;
  titleZh: string;
  titleEn: string;
  userId: string;
  status: StoryStatus;
  generationPrompt?: string;
  selectedStyleId?: string;
  errorMessage?: string;
  description?: string;
  createdAt: string; // ISO Date string
  updatedAt: string; // ISO Date string
  styles: StoryStyle[];
  pages?: StoryPage[]; // Optional for list view, full detail has it
}

export interface StoryManifestItem {
  id: string;
  titleZh: string;
  titleEn: string;
  styles: StoryStyle[];
  defaultStyle: string;
  status?: StoryStatus; // Add status for manifest, for unified display
  userId?: string; // Add userId for manifest, to distinguish user's own stories
}

export type StoryManifest = StoryManifestItem[];

// New: Language Mode Definition
export type LanguageMode = 'zh' | 'en' | 'dual';
