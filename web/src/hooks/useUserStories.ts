// useState, useEffect removed

import { useQuery } from '@tanstack/react-query'; // Assuming @tanstack/react-query is installed
import { Story, StoryStatus } from '../types';
import { api } from '../api/client';

interface UseUserStoriesOptions {
    userId: string | null; // Null for guests, but this hook is primarily for logged-in users
    status?: StoryStatus; // Optional: filter by status
    keyword?: string; // Optional: filter by keyword
    enabled?: boolean; // Controls whether the query runs
}

export function useUserStories({ userId, status, keyword, enabled = true }: UseUserStoriesOptions) {
    const queryKey = ['userStories', userId, status, keyword];

    const { data, isLoading, error, refetch } = useQuery<
        Story[],
        Error
    >({
        queryKey: queryKey,
        queryFn: async () => {
            if (!userId) return [];
            // Backend API: GET /api/stories?mine=true&keyword={keyword}
            // Backend uses the authentication token to identify the user.
            const response = await api.stories.listMy(keyword);
            return response.data;
        },
        enabled: enabled && !!userId, // Only run if userId is present and enabled is true
        refetchInterval: (data) => {
            // Poll every 5 seconds if there are stories still in GENERATING status
            if (Array.isArray(data) && data.some(story => story.status === StoryStatus.GENERATING)) {
                return 5000;
            }
            return false; // Stop polling if no stories are generating
        },
    });

    return { userStories: data || [], isLoading, error, refetch };
}
