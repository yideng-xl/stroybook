import { useState, useEffect } from 'react';
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
            // Backend API: GET /api/stories?status={status}&keyword={keyword}
            // The backend identifies the user via the Authentication token, so we don't need to pass userId as a param.
            
            // Fix: api.stories.list accepts (keyword, status). 
            // We were passing (keyword, userId, status) which was wrong.
            const response = await api.stories.list(keyword, status ? status.toString() : undefined);
            
            // Important: The backend /api/stories endpoint logic for logged-in users currently returns ALL stories (public + own).
            // But useUserStories is intended to fetch ONLY the current user's stories.
            // We need to filter the response here on the client side, 
            // OR ensure the backend has an endpoint specifically for "my stories".
            // Given the current backend logic:
            // if status is provided, it returns stories matching that status for the user.
            // if status is NOT provided, it returns ALL stories.
            
            // Let's filter by userId to be safe, assuming the API returns a mixed list or we want to be sure.
            const allStories: Story[] = response.data;
            return allStories.filter(story => story.userId === userId);
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
