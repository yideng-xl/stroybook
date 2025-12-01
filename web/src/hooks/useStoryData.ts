import { useState, useEffect } from 'react';
import { StoryMetadata } from '../types';
import { getAssetUrl } from '../utils/url';

export function useStoryData(storyId: string | undefined) {
  const [story, setStory] = useState<StoryMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!storyId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    // Fetch from file server
    const fetchUrl = getAssetUrl(`/stories/${storyId}/story.json`);
    
    fetch(fetchUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load story: ${storyId}`);
        return res.json();
      })
      .then((data) => {
        // Inject ID into the data for convenience
        setStory({ ...data, id: storyId });
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, [storyId]);

  return { story, loading, error };
}
