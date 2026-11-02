// @ts-nocheck
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const FAVORITES_STORAGE_KEY = 'bdt222_user_favorites';

// Helper to safely load favorites from localStorage cache
export const getStoredFavorites = (): string[] => {
  try {
    const saved = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (saved !== null) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.error('Error reading favorites from cache:', err);
  }
  // Initial default favorites on first launch
  const initial = ['game-super-ace', 'game-aviator', 'game-fortune-gems-3'];
  try {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(initial));
  } catch {
    // ignore
  }
  return initial;
};

export interface FavoritesContextType {
  favorites: string[];
  toggleFavorite: (gameId: string, e?: React.MouseEvent) => void;
  isFavorite: (gameId: string) => boolean;
}

export const FavoritesContext = createContext<FavoritesContextType | null>(null);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<string[]>(getStoredFavorites);

  // Sync across browser tabs/windows
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === FAVORITES_STORAGE_KEY) {
        setFavorites(getStoredFavorites());
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const toggleFavorite = useCallback((gameId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setFavorites(prev => {
      const isFav = prev.includes(gameId);
      const next = isFav ? prev.filter(id => id !== gameId) : [...prev, gameId];
      try {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(next));
      } catch (err) {
        console.error('Error saving favorites to cache:', err);
      }
      return next;
    });
  }, []);

  const isFavorite = useCallback((gameId: string) => {
    return favorites.includes(gameId);
  }, [favorites]);

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = (): FavoritesContextType => {
  const context = useContext(FavoritesContext);
  if (!context) {
    // Fallback if rendered outside provider
    const [favorites, setFavorites] = useState<string[]>(getStoredFavorites);
    const toggleFavorite = useCallback((gameId: string, e?: React.MouseEvent) => {
      if (e) e.stopPropagation();
      setFavorites(prev => {
        const isFav = prev.includes(gameId);
        const next = isFav ? prev.filter(id => id !== gameId) : [...prev, gameId];
        try {
          localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(next));
        } catch {}
        return next;
      });
    }, []);
    const isFavorite = useCallback((id: string) => favorites.includes(id), [favorites]);
    return { favorites, toggleFavorite, isFavorite };
  }
  return context;
};
