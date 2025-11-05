# 管理员功能指南

## 概述

本系统新增了管理员功能，支持：
1. 创建道具并生成二维码
2. 审核捕捉记录
3. 管理游戏
4. 短助记游戏 ID（如 `ABC123`）

## 成为管理员

### 方式一：注册时指定（推荐）

登录时在请求中添加 `isAdmin: true`：

```javascript
POST /auth/anon
{
  "nickname": "管理员小明",
  "isAdmin": true
}
```

### 方式二：已有管理员授权

如果已经有管理员账号，可以授权其他用户：

```javascript
POST /admin/users/:userId/make-admin
Authorization: Bearer <admin_token>
```

## 游戏管理

### 创建游戏

创建游戏会自动生成短助记 ID（格式：3个字母+3个数字）：

```javascript
POST /games
Authorization: Bearer <token>
{
  "name": "周末猎捕",
  "areaBounds": {
    "north": 39.92,
    "south": 39.91,
    "east": 116.41,
    "west": 116.40
  }
}

// 响应
{
  "game": {
    "id": "ABC123",  // 短助记 ID
    "name": "周末猎捕",
    "creatorId": "xxx",
    "status": "LOBBY",
    ...
  }
}
```

玩家可以用 `ABC123` 这样的短 ID 快速加入游戏。

## 道具管理

### 1. 创建道具

管理员可以为游戏创建道具：

```javascript
POST /admin/items
Authorization: Bearer <admin_token>
{
  "gameId": "ABC123",
  "type": "STEALTH",  // STEALTH | BOOST | RADAR | REFLECT
  "name": "隐身斗篷",
  "description": "使用后30秒内敌人无法看到你的位置",
  "durationSec": 30,
  "count": 10  // 批量创建10个道具
}

// 响应
{
  "items": [
    {
      "id": "xxx",
      "code": "abc123def456",  // 12位随机码
      "type": "STEALTH",
      "name": "隐身斗篷",
      "description": "...",
      "gameId": "ABC123",
      "isUsed": false,
      ...
    },
    // ... 共10个道具
  ]
}
```

### 2. 获取道具二维码

#### 单个道具

```javascript
GET /admin/items/:code/qr
Authorization: Bearer <admin_token>

// 响应
{
  "item": {
    "id": "xxx",
    "code": "abc123def456",
    "type": "STEALTH",
    "name": "隐身斗篷",
    ...
  },
  "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANS..."  // Base64 图片
}
```

#### 批量获取游戏所有道具

```javascript
GET /admin/games/:gameId/items
Authorization: Bearer <admin_token>

// 响应
{
  "game": {
    "id": "ABC123",
    "name": "周末猎捕"
  },
  "items": [
    {
      "id": "xxx",
      "code": "abc123def456",
      "name": "隐身斗篷",
      "qrCode": "data:image/png;base64,...",
      ...
    },
    // ... 所有道具
  ]
}
```

### 3. 打印二维码

前端可以将 Base64 图片显示并打印：

```html
<!-- 显示二维码 -->
<img src="data:image/png;base64,..." alt="道具二维码" />

<!-- 或生成 PDF -->
<script>
  // 使用 jsPDF 等库生成 PDF
  const items = response.items;
  items.forEach(item => {
    pdf.addImage(item.qrCode, 'PNG', x, y, width, height);
    pdf.text(item.name, x, y);
    pdf.text(item.description, x, y);
  });
  pdf.save('items-qr-codes.pdf');
</script>
```

## 捕捉审核

### 1. 获取待审核列表

```javascript
GET /admin/games/:gameId/captures/pending
Authorization: Bearer <admin_token>

// 响应
{
  "captures": [
    {
      "id": "xxx",
      "hunter": {
        "id": "xxx",
        "nickname": "猎人小张",
        "badgeCode": "xxx"
      },
      "runner": {
        "id": "xxx",
        "nickname": "逃跑者小李",
        "badgeCode": "xxx"
      },
      "photoUrl": "/uploads/xxx.jpg",
      "lat": 39.915,
      "lng": 116.404,
      "verificationStatus": "PENDING",
      "createdAt": "2025-01-15T10:30:00Z"
    },
    ...
  ]
}
```

### 2. 审核捕捉

管理员或 AI Agent 可以审核捕捉：

```javascript
POST /admin/captures/:id/verify
Authorization: Bearer <admin_token>
{
  "status": "APPROVED",  // APPROVED | REJECTED
  "note": "照片清晰，徽章可见，审核通过"
}

// 响应
{
  "capture": {
    "id": "xxx",
    "verificationStatus": "APPROVED",
    "verifiedBy": "admin_user_id",
    "verificationNote": "照片清晰，徽章可见，审核通过",
    "verifiedAt": "2025-01-15T10:35:00Z",
    ...
  }
}
```

**审核通过后自动**：
- 将被捕玩家标记为 `isEliminated: true`
- 猎人获得 10 分奖励
- 被捕玩家只能查看道具位置，无法捕捉他人

## 道具使用规则

1. **一次性使用**：每个道具的 `code` 唯一，扫描拾取后 `isUsed` 标记为 `true`
2. **单游戏绑定**：道具创建时绑定到特定游戏，只能在该游戏中使用
3. **防重复**：同一玩家不能重复拾取同一道具（数据库约束）

## 道具类型说明

| 类型 | 名称 | 效果 | 建议时长 |
|------|------|------|----------|
| STEALTH | 隐身 | 隐藏位置信息 | 30-60秒 |
| BOOST | 加速 | 免疫下次捕捉 | 一次性 |
| RADAR | 雷达 | 捕捉额外+2分 | 一次性 |
| REFLECT | 反射 | 反弹捕捉（未实现）| - |

## 前端集成示例

### 管理员界面

```typescript
// 创建道具
async function createItems(gameId: string) {
  const response = await fetch('/admin/items', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      gameId,
      type: 'STEALTH',
      name: '隐身斗篷',
      description: '使用后30秒内隐身',
      durationSec: 30,
      count: 10
    })
  });
  const data = await response.json();
  return data.items;
}

// 获取并打印二维码
async function printItemQRCodes(gameId: string) {
  const response = await fetch(`/admin/games/${gameId}/items`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();

  // 生成 PDF
  const pdf = new jsPDF();
  data.items.forEach((item, index) => {
    if (index > 0) pdf.addPage();

    // 添加二维码
    pdf.addImage(item.qrCode, 'PNG', 50, 50, 100, 100);

    // 添加道具信息
    pdf.text(item.name, 105, 160, { align: 'center' });
    pdf.setFontSize(10);
    pdf.text(item.description || '', 105, 170, { align: 'center' });
    pdf.text(`游戏: ${data.game.name} (${data.game.id})`, 105, 180, { align: 'center' });
  });

  pdf.save(`items-${gameId}.pdf`);
}

// 审核捕捉
async function verifyCapture(captureId: string, approved: boolean, note: string) {
  const response = await fetch(`/admin/captures/${captureId}/verify`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      status: approved ? 'APPROVED' : 'REJECTED',
      note
    })
  });
  return response.json();
}
```

### 玩家捕捉界面

```typescript
// 拍照并上传
async function capturePlayer(runnerId: string, photo: File, position: {lat: number, lng: number}) {
  const formData = new FormData();
  formData.append('runnerId', runnerId);
  formData.append('photo', photo);
  formData.append('lat', position.lat.toString());
  formData.append('lng', position.lng.toString());

  const response = await fetch('/captures', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  });

  return response.json();
  // 返回 { capture: { verificationStatus: 'PENDING', ... } }
}

// 调用相机
function openCamera() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.capture = 'environment';  // 使用后置摄像头

  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      handlePhotoCapture(file);
    }
  };

  input.click();
}
```

## 权限总结

| 操作 | 普通玩家 | 被捕玩家 | 管理员 |
|------|----------|----------|---------|
| 查看地图 | ✅ | ✅ | ✅ |
| 查看道具位置 | ✅ | ✅ | ✅ |
| 拾取道具 | ✅ | ✅ | ✅ |
| 捕捉他人 | ✅ | ❌ | ✅ |
| 创建游戏 | ✅ | ✅ | ✅ |
| 创建道具 | ❌ | ❌ | ✅ |
| 审核捕捉 | ❌ | ❌ | ✅ |

## 注意事项

1. **管理员权限**：谨慎授予，建议线下核实身份
2. **道具安全**：打印的二维码应妥善保管，避免提前泄露
3. **审核及时性**：建议在5分钟内完成审核，保持游戏流畅性
4. **照片验证**：确保照片清晰显示被捕玩家的徽章二维码
5. **游戏 ID**：虽然是短 ID，但仍有 26^3 × 10^3 = 17,576,000 种组合，冲突概率极低
