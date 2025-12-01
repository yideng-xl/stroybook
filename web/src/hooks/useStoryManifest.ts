import { useState, useEffect } from 'react';
import { StoryManifest } from '../types';
import { api } from '../api/client';

export function useStoryManifest() {
  const [manifest, setManifest] = useState<StoryManifest>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.stories.list()
      .then((res) => {
        // Transform Backend API response to Frontend Manifest type
        const data = res.data.map((item: any) => ({
            id: item.id,
            titleZh: item.titleZh,
            titleEn: item.titleEn,
            styles: (item.styles || []).map((s: any) => ({
                id: s.name, 
                name: s.name,
                nameEn: s.nameEn,
                coverImage: s.coverImage
            })),
            defaultStyle: (item.styles && item.styles.length > 0) ? item.styles[0].name : ''
        }));
        setManifest(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to load stories from server');
        setLoading(false);
      });
  }, []);

  return { manifest, loading, error };
}
