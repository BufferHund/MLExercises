import { cacheService, CACHE_DURATION, CACHE_KEYS } from './cacheService';

// Gemini API服务
export async function callGemini(apiKey: string, prompt: string) {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Gemini API call failed');
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return text;
  } catch (error) {
    console.error('Gemini API error:', error);
    throw error;
  }
}

// 获取天气数据（带缓存）
export async function getWeatherFromGemini(apiKey: string, city: string) {
  // 检查缓存
  const cacheKey = CACHE_KEYS.WEATHER(city);
  const cached = cacheService.get<any>(cacheKey);
  if (cached) {
    return cached;
  }

  const prompt = `请提供${city}今天的天气信息，以JSON格式返回，包含以下字段：
{
  "temperature": 温度(数字),
  "condition": "天气状况",
  "humidity": 湿度百分比(数字),
  "windSpeed": 风速km/h(数字),
  "forecast": [
    {"day": "今天", "high": 最高温, "low": 最低温, "condition": "sunny|cloudy|rainy"}
  ]
}
只返回JSON，不要其他解释文字。`;

  const response = await callGemini(apiKey, prompt);

  try {
    // 尝试从响应中提取JSON
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const weatherData = JSON.parse(jsonMatch[0]);
      // 缓存1小时
      cacheService.set(cacheKey, weatherData, CACHE_DURATION.ONE_HOUR);
      return weatherData;
    }
  } catch (e) {
    console.error('Failed to parse weather JSON:', e);
  }

  // 返回默认值
  return {
    temperature: 18,
    condition: '多云',
    humidity: 65,
    windSpeed: 12,
    forecast: [
      { day: '今天', high: 22, low: 15, condition: 'cloudy' },
    ],
  };
}

// 获取新闻数据（带缓存和轮播）
export async function getNewsFromGemini(apiKey: string) {
  // 检查缓存
  const cached = cacheService.get<any[]>(CACHE_KEYS.NEWS);
  if (cached) {
    return cached;
  }

  // 一次性请求10条新闻，可以轮播展示
  const prompt = `请提供10条今天的科技和AI领域新闻，以JSON数组格式返回，每条新闻包含：
[
  {
    "title": "新闻标题",
    "source": "来源",
    "time": "时间(如:2小时前)"
  }
]
只返回JSON数组，不要其他解释文字。`;

  const response = await callGemini(apiKey, prompt);

  try {
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const newsData = JSON.parse(jsonMatch[0]);
      // 缓存5分钟
      cacheService.set(CACHE_KEYS.NEWS, newsData, CACHE_DURATION.FIVE_MINUTES);
      return newsData;
    }
  } catch (e) {
    console.error('Failed to parse news JSON:', e);
  }

  return [];
}

// 获取每日一句
export async function getQuoteFromGemini(apiKey: string) {
  const prompt = `请提供一句励志的中文名言，以JSON格式返回：
{
  "text": "名言内容",
  "author": "作者"
}
只返回JSON，不要其他解释文字。`;

  const response = await callGemini(apiKey, prompt);

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error('Failed to parse quote JSON:', e);
  }

  return {
    text: '今天也要加油！',
    author: '匿名',
  };
}
