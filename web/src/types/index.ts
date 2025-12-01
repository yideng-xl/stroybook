export interface StoryPage {
  pageNumber: number;
  textZh: string;
  textEn: string;
}

export interface StoryMetadata {
  id: string; // Folder name, e.g., "灰姑娘"
  titleZh: string;
  titleEn: string;
  styleZh: string;
  styleEn: string;
  fullStory: string;
  pages: StoryPage[];
}

export interface StoryStyle {
  id: string; // e.g., "迪士尼"
  name: string;
  nameEn?: string; // Optional
  coverImage: string;
}

export interface StoryManifestItem {
  id: string;
  titleZh: string;
  titleEn: string;
  styles: StoryStyle[];
  defaultStyle: string;
}

export type StoryManifest = StoryManifestItem[];

// New: Language Mode Definition
export type LanguageMode = 'zh' | 'en' | 'dual';
