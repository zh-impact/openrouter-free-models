// Cloudflare Pages Function - 通用 API 代理
// 将所有 /api/* 请求转发到 Workers 后端

export async function onRequest(context: any) {
  const { request, env } = context;
  const url = new URL(request.url);

  // Workers 后端 URL（从环境变量读取）
  const workersApi = env.WORKERS_API_URL || 'https://openrouter-free-models-api.hz-studio.workers.dev';

  // 构建完整的目标 URL
  const targetUrl = `${workersApi}${url.pathname}${url.search}`;

  console.log(`Proxying: ${url.pathname} -> ${targetUrl}`);

  // 转发请求
  const response = await fetch(targetUrl, {
    method: request.method,
    headers: request.headers,
    body: request.body,
  });

  // 克隆响应以修改头信息（如果需要）
  const newResponse = new Response(response.body, response);

  // 添加 CORS 头（如果需要）
  newResponse.headers.set('Access-Control-Allow-Origin', '*');

  return newResponse;
}
