import axios from 'axios';
import type { User, Game, Participation, Item, Pickup, Capture } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 拦截器：添加 token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 认证
export const auth = {
  anonLogin: async (nickname: string) => {
    const { data } = await api.post<{ token: string; user: User }>(
      '/auth/anon',
      { nickname }
    );
    localStorage.setItem('token', data.token);
    return data;
  },
};

// 游戏
export const games = {
  create: async (name: string, areaBounds?: any) => {
    const { data } = await api.post<{ game: Game }>('/games', {
      name,
      areaBounds,
    });
    return data.game;
  },

  get: async (id: string) => {
    const { data } = await api.get<{ game: Game }>(`/games/${id}`);
    return data.game;
  },

  join: async (id: string) => {
    const { data } = await api.post<{ participation: Participation }>(
      `/games/${id}/join`
    );
    return data.participation;
  },

  assignTeams: async (id: string) => {
    const { data } = await api.post<{ participations: Participation[] }>(
      `/games/${id}/assign-teams`
    );
    return data.participations;
  },

  start: async (id: string) => {
    const { data } = await api.post<{ game: Game }>(`/games/${id}/start`);
    return data.game;
  },

  end: async (id: string) => {
    const { data } = await api.post<{ game: Game }>(`/games/${id}/end`);
    return data.game;
  },
};

// 道具
export const items = {
  query: async (code: string) => {
    const { data } = await api.get<{ item: Item }>(`/items/q/${code}`);
    return data.item;
  },

  pickup: async (code: string, gameId: string) => {
    const { data } = await api.post<{ pickup: Pickup }>('/items/pickups', {
      code,
      gameId,
    });
    return data.pickup;
  },

  use: async (pickupId: string) => {
    const { data } = await api.post<{ pickup: Pickup }>('/items/use', {
      pickupId,
    });
    return data.pickup;
  },

  myBackpack: async (gameId: string) => {
    const { data } = await api.get<{ pickups: Pickup[] }>(
      '/items/my-backpack',
      { params: { gameId } }
    );
    return data.pickups;
  },
};

// 抓捕
export const captures = {
  create: async (formData: FormData) => {
    const { data } = await api.post<{ capture: Capture; points: number; distance: number }>(
      '/captures',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return data;
  },

  list: async (gameId: string) => {
    const { data } = await api.get<{ captures: Capture[] }>('/captures', {
      params: { gameId },
    });
    return data.captures;
  },
};

// 排行榜
export const leaderboard = {
  get: async (gameId: string) => {
    const { data } = await api.get<{ leaderboard: Participation[] }>(
      '/leaderboard',
      { params: { gameId } }
    );
    return data.leaderboard;
  },
};

// 用户
export const users = {
  me: async () => {
    const { data } = await api.get<{ user: User }>('/users/me');
    return data.user;
  },

  badge: async () => {
    const { data } = await api.get<{
      badgeCode: string;
      badgeText: string;
      qrDataUrl: string;
    }>('/users/me/badge');
    return data;
  },
};

export default api;
