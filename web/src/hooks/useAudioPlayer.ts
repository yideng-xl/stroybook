import { useState, useEffect, useRef, useCallback } from 'react';

export interface AudioPlayerControls {
    isPlaying: boolean;
    play: (url: string) => Promise<void>;
    pause: () => void;
    stop: () => void;
    duration: number;
    currentTime: number;
}

export const useAudioPlayer = (): AudioPlayerControls => {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);

    // Initialize audio element
    useEffect(() => {
        const audio = new Audio();
        audioRef.current = audio;

        const handleEnded = () => setIsPlaying(false);
        const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
        const handleLoadedMetadata = () => setDuration(audio.duration);
        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);

        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('play', handlePlay);
        audio.addEventListener('pause', handlePause);

        return () => {
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('play', handlePlay);
            audio.removeEventListener('pause', handlePause);
            audio.pause();
            audioRef.current = null;
        };
    }, []);

    const play = useCallback(async (url: string) => {
        const audio = audioRef.current;
        if (!audio) return;

        // If the URL is different, load the new source
        // Construct full URL if relative
        const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;
        
        if (audio.src !== fullUrl) {
            audio.src = fullUrl;
            audio.load();
        }

        try {
            await audio.play();
        } catch (err) {
            console.error('Audio playback failed:', err);
            setIsPlaying(false);
        }
    }, []);

    const pause = useCallback(() => {
        audioRef.current?.pause();
    }, []);

    const stop = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
    }, []);

    return {
        isPlaying,
        play,
        pause,
        stop,
        duration,
        currentTime
    };
};
