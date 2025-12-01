import { useState, useEffect } from 'react';
import { StoryManifest } from '../types';

export function useStoryManifest() {
  const [manifest, setManifest] = useState<StoryManifest>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/story-manifest.json')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load manifest');
        return res.json();
      })
      .then((data) => {
        setManifest(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return { manifest, loading, error };
}
