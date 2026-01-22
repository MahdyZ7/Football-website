'use client';

import React, { createContext, useContext, useRef, useState, useCallback, useEffect } from 'react';

interface TournamentAudioContextType {
  isPlaying: boolean;
  hasStarted: boolean;
  startAudio: () => void;
  stopAudio: () => void;
  toggleAudio: () => void;
}

const TournamentAudioContext = createContext<TournamentAudioContextType | null>(null);

export function TournamentAudioProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  // Initialize audio element once
  useEffect(() => {
    if (typeof window !== 'undefined' && !audioRef.current) {
      audioRef.current = new Audio('/Bundesliga_Hymm.mp3');
      audioRef.current.addEventListener('ended', () => setIsPlaying(false));
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const startAudio = useCallback(() => {
    if (audioRef.current && !hasStarted) {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
      setHasStarted(true);
    }
  }, [hasStarted]);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const toggleAudio = useCallback(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().catch(() => {});
        setIsPlaying(true);
        setHasStarted(true);
      }
    }
  }, [isPlaying]);

  return (
    <TournamentAudioContext.Provider value={{ isPlaying, hasStarted, startAudio, stopAudio, toggleAudio }}>
      {children}
    </TournamentAudioContext.Provider>
  );
}

export function useTournamentAudio() {
  const context = useContext(TournamentAudioContext);
  if (!context) {
    throw new Error('useTournamentAudio must be used within a TournamentAudioProvider');
  }
  return context;
}
