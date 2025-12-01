import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export const ReadingTimer: React.FC = () => {
    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setSeconds(s => s + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const formatTime = (totalSeconds: number) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="hidden md:flex items-center gap-1 text-yellow-100 bg-black/20 px-3 py-1 rounded-full text-xs font-mono">
            <Clock size={14} />
            <span>{formatTime(seconds)}</span>
        </div>
    );
};
