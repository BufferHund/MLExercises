import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function generateQRCodes() {
  const outputDir = path.join(process.cwd(), 'qr');

  // 创建输出目录
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('🎨 Generating QR codes for items...\n');

  const items = await prisma.item.findMany();

  for (const item of items) {
    const qrPath = path.join(outputDir, `${item.code}.png`);

    await QRCode.toFile(qrPath, item.code, {
      width: 400,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    console.log(`✅ Generated: ${item.code} (${item.type})`);
  }

  console.log(`\n✨ Generated ${items.length} QR codes in ./qr/\n`);
  console.log('💡 Print these codes and place them around the game area!');
}

generateQRCodes()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
