import { PrismaClient, ItemType } from '@prisma/client';
import { nanoid } from 'nanoid';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 清空现有数据
  await prisma.positionLog.deleteMany();
  await prisma.capture.deleteMany();
  await prisma.pickup.deleteMany();
  await prisma.participation.deleteMany();
  await prisma.item.deleteMany();
  await prisma.game.deleteMany();
  await prisma.user.deleteMany();

  // 创建道具
  const itemTypes = [
    { type: ItemType.STEALTH, durationSec: 30, count: 10 },
    { type: ItemType.BOOST, durationSec: 60, count: 8 },
    { type: ItemType.RADAR, durationSec: 45, count: 6 },
    { type: ItemType.REFLECT, durationSec: 20, count: 4 },
  ];

  const items = [];
  for (const itemDef of itemTypes) {
    for (let i = 0; i < itemDef.count; i++) {
      const item = await prisma.item.create({
        data: {
          code: `ITEM-${itemDef.type}-${nanoid(8)}`,
          type: itemDef.type,
          durationSec: itemDef.durationSec,
        },
      });
      items.push(item);
    }
  }

  console.log(`✅ Created ${items.length} items`);

  // 创建示例游戏
  const game = await prisma.game.create({
    data: {
      name: '测试游戏 - 校园猎捕',
      areaBounds: JSON.stringify({
        north: 39.9092,
        south: 39.9000,
        east: 116.3974,
        west: 116.3874,
      }),
      status: 'LOBBY',
    },
  });

  console.log(`✅ Created game: ${game.name} (${game.id})`);

  // 创建测试用户
  const testUsers = [];
  for (let i = 1; i <= 6; i++) {
    const user = await prisma.user.create({
      data: {
        nickname: `玩家${i}`,
        badgeCode: nanoid(12),
      },
    });
    testUsers.push(user);
  }

  console.log(`✅ Created ${testUsers.length} test users`);

  console.log('\n🎉 Database seeded successfully!');
  console.log(`\n📋 Item codes (save these for QR generation):`);
  items.slice(0, 5).forEach((item) => {
    console.log(`   ${item.type}: ${item.code}`);
  });
  console.log(`   ... and ${items.length - 5} more`);
  console.log(`\n🎮 Game ID: ${game.id}`);
  console.log(`👥 User IDs: ${testUsers.map(u => u.id.substring(0, 8)).join(', ')}...\n`);
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
