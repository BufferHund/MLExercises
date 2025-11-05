import { User, Participation } from '@prisma/client';

/**
 * 分配阵营：1/3 猎人，2/3 逃亡者
 */
export function assignTeams(userIds: string[]): {
  userId: string;
  team: string;
}[] {
  const shuffled = [...userIds].sort(() => Math.random() - 0.5);
  const hunterCount = Math.max(1, Math.floor(shuffled.length / 3));

  return shuffled.map((userId, index) => ({
    userId,
    team: index < hunterCount ? "HUNTER" : "RUNNER",
  }));
}

/**
 * 计算抓捕积分
 * 基础 10 分，持有 RADAR 道具则 +2
 */
export function scoreCapture(hasRadar: boolean = false): number {
  return hasRadar ? 12 : 10;
}

/**
 * 检查道具效果是否生效
 */
export function isItemActive(expiresAt: Date | null): boolean {
  if (!expiresAt) return false;
  return expiresAt > new Date();
}
