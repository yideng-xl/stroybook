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

    // Generate or retrieve Guest ID
    let guestId = localStorage.getItem('guestId');
    if (!guestId) {
      guestId = Math.random().toString(36).substring(2, 15);
      localStorage.setItem('guestId', guestId);
    }

    // Pass guestId in headers (api client needs to support custom config or we update api method)
    // Updating api.stories.getContent to accept config is better, or simpler: adjust client.ts
    // For now, let's assume api method signature update in next step.
    api.stories.getContent(storyId, guestId)
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
