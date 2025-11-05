/**
 * 生成短助记游戏 ID
 * 格式：3个字母 + 3个数字，如 ABC123
 */
export function generateGameId(): string {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // 去除容易混淆的 I, O
  const numbers = '0123456789';

  let id = '';

  // 3个字母
  for (let i = 0; i < 3; i++) {
    id += letters.charAt(Math.floor(Math.random() * letters.length));
  }

  // 3个数字
  for (let i = 0; i < 3; i++) {
    id += numbers.charAt(Math.floor(Math.random() * numbers.length));
  }

  return id;
}

/**
 * 验证游戏 ID 格式
 */
export function isValidGameId(id: string): boolean {
  // 必须是 3 个字母 + 3 个数字
  return /^[A-Z]{3}[0-9]{3}$/.test(id);
}
