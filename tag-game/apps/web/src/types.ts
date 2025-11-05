export type Role = 'HUNTER' | 'RUNNER';
export type GameStatus = 'LOBBY' | 'RUNNING' | 'ENDED';
export type ItemType = 'STEALTH' | 'BOOST' | 'RADAR' | 'REFLECT';

export interface User {
  id: string;
  nickname: string;
  role?: Role;
  badgeCode: string;
  isAdmin: boolean;
  isEliminated: boolean;
  createdAt: string;
}

export interface Game {
  id: string;
  name: string;
  areaBounds?: string;
  status: GameStatus;
  startAt?: string;
  endAt?: string;
  createdAt: string;
  participations?: Participation[];
}

export interface Participation {
  id: string;
  userId: string;
  gameId: string;
  score: number;
  team: Role;
  user?: User;
}

export interface Item {
  id: string;
  code: string;
  type: ItemType;
  name: string;
  description?: string;
  durationSec: number;
  gameId: string;
  isUsed: boolean;
}

export interface Pickup {
  id: string;
  userId: string;
  itemId: string;
  gameId: string;
  used: boolean;
  expiresAt?: string;
  createdAt: string;
  item: Item;
}

export type VerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Capture {
  id: string;
  hunterId: string;
  runnerId: string;
  gameId: string;
  photoUrl: string;
  lat: number;
  lng: number;
  verificationStatus: VerificationStatus;
  verifiedBy?: string;
  verificationNote?: string;
  verifiedAt?: string;
  createdAt: string;
  hunter?: User;
  runner?: User;
}

export interface AreaBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface Position {
  userId: string;
  role: Role;
  lat: number;
  lng: number;
  lastSeenSec: number;
}
