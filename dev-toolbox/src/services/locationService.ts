// 获取用户IP和位置信息
export async function getUserLocation() {
  try {
    // 使用免费的IP定位API
    const response = await fetch('https://ipapi.co/json/');
    if (!response.ok) {
      throw new Error('Failed to fetch location');
    }

    const data = await response.json();

    return {
      ip: data.ip || '',
      city: data.city || '未知',
      country: data.country_name || '未知',
      region: data.region || '',
      latitude: data.latitude || 0,
      longitude: data.longitude || 0,
    };
  } catch (error) {
    console.error('Error fetching location:', error);
    // 返回默认值
    return {
      ip: '',
      city: '北京',
      country: '中国',
      region: '',
      latitude: 39.9042,
      longitude: 116.4074,
    };
  }
}
