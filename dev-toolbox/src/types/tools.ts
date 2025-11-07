import type { LucideIcon } from 'lucide-react';

export type ToolCategory =
  | 'image'           // 图片工具
  | 'format'          // 格式化&压缩
  | 'network'         // 网络测试
  | 'hash'            // 哈希&密码
  | 'conversion'      // 进制转换
  | 'string'          // 字符串操作
  | 'basic';          // 基础工具

export interface Tool {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
  category: ToolCategory;
  description: string;
  isPremium?: boolean;  // 是否需要付费
}

export type ToolId = string;  // 动态工具ID
