import { useState, useEffect } from 'react';
import { StoryMetadata } from '../types';
import { api } from '../api/client';

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
    
    api.stories.getContent(storyId)
      .then((res) => {
        // Inject ID into the data for convenience
        setStory({ ...res.data, id: storyId });
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        const msg = err.response?.status === 403 
            ? '403 Forbidden' 
            : err.response?.status === 404
                ? 'Story not found'
                : 'Failed to load story content';
        setError(msg);
        setLoading(false);
      });
  }, [storyId]);

  return { story, loading, error };
}
