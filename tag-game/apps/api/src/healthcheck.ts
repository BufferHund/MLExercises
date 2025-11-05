/**
 * 健康检查脚本
 * 用于在启动前检查数据库连接和基本配置
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface HealthCheckResult {
  success: boolean;
  checks: {
    name: string;
    status: 'OK' | 'FAILED';
    message?: string;
    duration?: number;
  }[];
  timestamp: string;
}

async function checkDatabase(): Promise<{ status: 'OK' | 'FAILED'; message?: string; duration: number }> {
  const start = Date.now();
  try {
    // 尝试执行一个简单的查询
    await prisma.$queryRaw`SELECT 1`;
    const duration = Date.now() - start;
    return { status: 'OK', duration };
  } catch (error) {
    const duration = Date.now() - start;
    return {
      status: 'FAILED',
      message: error instanceof Error ? error.message : '未知错误',
      duration
    };
  }
}

async function checkDatabaseSchema(): Promise<{ status: 'OK' | 'FAILED'; message?: string; duration: number }> {
  const start = Date.now();
  try {
    // 检查关键表是否存在
    await prisma.user.findFirst();
    await prisma.game.findFirst();
    const duration = Date.now() - start;
    return { status: 'OK', duration };
  } catch (error) {
    const duration = Date.now() - start;
    return {
      status: 'FAILED',
      message: error instanceof Error ? error.message : '数据库表结构不完整',
      duration
    };
  }
}

async function checkEnvironment(): Promise<{ status: 'OK' | 'FAILED'; message?: string; duration: number }> {
  const start = Date.now();
  const requiredEnvVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'PORT'
  ];

  const missing = requiredEnvVars.filter(key => !process.env[key]);

  if (missing.length > 0) {
    return {
      status: 'FAILED',
      message: `缺少必需的环境变量: ${missing.join(', ')}`,
      duration: Date.now() - start
    };
  }

  const duration = Date.now() - start;
  return { status: 'OK', duration };
}

async function runHealthCheck(): Promise<HealthCheckResult> {
  console.log('\n🔍 开始健康检查...\n');

  const result: HealthCheckResult = {
    success: true,
    checks: [],
    timestamp: new Date().toISOString()
  };

  // 检查环境变量
  console.log('📋 检查环境变量配置...');
  const envCheck = await checkEnvironment();
  result.checks.push({
    name: '环境变量',
    status: envCheck.status,
    message: envCheck.message,
    duration: envCheck.duration
  });
  console.log(`   ${envCheck.status === 'OK' ? '✅' : '❌'} 环境变量: ${envCheck.status} (${envCheck.duration}ms)`);
  if (envCheck.message) console.log(`      ${envCheck.message}`);

  // 检查数据库连接
  console.log('📦 检查数据库连接...');
  const dbCheck = await checkDatabase();
  result.checks.push({
    name: '数据库连接',
    status: dbCheck.status,
    message: dbCheck.message,
    duration: dbCheck.duration
  });
  console.log(`   ${dbCheck.status === 'OK' ? '✅' : '❌'} 数据库连接: ${dbCheck.status} (${dbCheck.duration}ms)`);
  if (dbCheck.message) console.log(`      ${dbCheck.message}`);

  // 检查数据库表结构
  if (dbCheck.status === 'OK') {
    console.log('🗂️  检查数据库表结构...');
    const schemaCheck = await checkDatabaseSchema();
    result.checks.push({
      name: '数据库表结构',
      status: schemaCheck.status,
      message: schemaCheck.message,
      duration: schemaCheck.duration
    });
    console.log(`   ${schemaCheck.status === 'OK' ? '✅' : '❌'} 数据库表结构: ${schemaCheck.status} (${schemaCheck.duration}ms)`);
    if (schemaCheck.message) console.log(`      ${schemaCheck.message}`);
  }

  // 判断总体结果
  result.success = result.checks.every(check => check.status === 'OK');

  console.log('\n' + '='.repeat(50));
  if (result.success) {
    console.log('✅ 所有检查通过！服务可以启动。');
  } else {
    console.log('❌ 部分检查失败，请修复后再启动服务。');
  }
  console.log('='.repeat(50) + '\n');

  return result;
}

// 主函数
async function main() {
  try {
    const result = await runHealthCheck();

    // 断开数据库连接
    await prisma.$disconnect();

    // 根据检查结果退出
    if (!result.success) {
      process.exit(1);
    }
    process.exit(0);
  } catch (error) {
    console.error('❌ 健康检查时发生错误:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// 如果是直接运行（不是被导入）
if (require.main === module) {
  main();
}

export { runHealthCheck };
