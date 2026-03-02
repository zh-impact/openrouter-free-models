// API 基础 URL 配置
// 开发环境使用相对路径（通过 Vite 代理）
// 生产环境使用 Workers URL 或环境变量
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const API_URL = API_BASE_URL;

// 获取完整的 API URL
export function getApiUrl(path: string): string {
  // 如果已配置基础 URL，使用它
  if (API_BASE_URL) {
    return `${API_BASE_URL}${path}`;
  }

  // 否则使用相对路径（适用于前后端同域部署）
  return path;
}

// API 客户端
export async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const url = getApiUrl(path);

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}
