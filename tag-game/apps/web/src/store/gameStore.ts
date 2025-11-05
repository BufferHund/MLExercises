import { create } from 'zustand';
import type { User, Game, Position } from '../types';

interface GameState {
  user: User | null;
  game: Game | null;
  nearby: Position[];
  setUser: (user: User | null) => void;
  setGame: (game: Game | null) => void;
  setNearby: (nearby: Position[]) => void;
}

export const useGameStore = create<GameState>((set) => ({
  user: null,
  game: null,
  nearby: [],
  setUser: (user) => set({ user }),
  setGame: (game) => set({ game }),
  setNearby: (nearby) => set({ nearby }),
}));
