/**
 * 使用 Haversine 公式计算两点间的距离（米）
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371e3; // 地球半径（米）
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * 检查坐标是否在矩形区域内
 */
export interface AreaBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export function isInsideBounds(
  lat: number,
  lng: number,
  bounds: AreaBounds
): boolean {
  return (
    lat >= bounds.south &&
    lat <= bounds.north &&
    lng >= bounds.west &&
    lng <= bounds.east
  );
}

/**
 * 过滤附近的敌人（不同阵营且未隐身）
 */
export interface Position {
  userId: string;
  role: 'HUNTER' | 'RUNNER';
  lat: number;
  lng: number;
  lastSeenSec: number;
  isStealthed?: boolean;
}

export function nearbyEnemies(
  myPos: { lat: number; lng: number; role: 'HUNTER' | 'RUNNER' },
  others: Position[],
  radiusMeters: number = 15
): Position[] {
  return others.filter((other) => {
    // 同阵营跳过
    if (other.role === myPos.role) return false;
    // 隐身跳过
    if (other.isStealthed) return false;
    // 距离过远跳过
    const distance = calculateDistance(myPos.lat, myPos.lng, other.lat, other.lng);
    return distance <= radiusMeters;
  });
}

/**
 * 获取所有附近玩家（包括队友和敌人）
 * 用于地图显示所有玩家位置
 */
export function nearbyPlayers(
  myPos: { lat: number; lng: number; role: 'HUNTER' | 'RUNNER' },
  others: Position[],
  radiusMeters: number = 1000 // 默认1公里范围，可以看到所有玩家
): Position[] {
  return others.filter((other) => {
    // 如果敌人隐身，跳过
    if (other.role !== myPos.role && other.isStealthed) return false;
    // 计算距离
    const distance = calculateDistance(myPos.lat, myPos.lng, other.lat, other.lng);
    return distance <= radiusMeters;
  });
}
