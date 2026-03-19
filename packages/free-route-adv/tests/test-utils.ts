import type { OpenRouterModel } from '@openrouter-free-models/shared';

/**
 * Mock OpenRouter model for testing
 */
export function createMockModel(overrides: Partial<OpenRouterModel> = {}): OpenRouterModel {
  return {
    id: 'google/gemini-pro',
    name: 'Gemini Pro',
    description: 'Google Gemini Pro model',
    context_length: 128000,
    pricing: {
      prompt: '0',
      completion: '0',
    },
    architecture: {
      modality: 'text',
    },
    ...overrides,
  };
}

/**
 * Create multiple mock models
 */
export function createMockModels(count: number): OpenRouterModel[] {
  const providers = ['google', 'anthropic', 'meta', 'mistralai'];
  const models: OpenRouterModel[] = [];

  for (let i = 0; i < count; i++) {
    const provider = providers[i % providers.length];
    models.push(
      createMockModel({
        id: `${provider}/model-${i}`,
        name: `${provider.toUpperCase()} Model ${i}`,
        description: `Test model ${i} from ${provider}`,
        context_length: 32000 + i * 1000,
        architecture: {
          modality: i % 2 === 0 ? 'text' : 'text+image',
        },
      })
    );
  }

  return models;
}

/**
 * Mock fetch response
 */
export function createMockResponse(data: any, status: number = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    json: async () => data,
    headers: new Headers(),
  } as Response;
}

/**
 * Mock fetch implementation
 */
export function createMockFetch(mockResponses: Array<{ data: any; status?: number }>) {
  let callCount = 0;
  return {
    fetch: async (url: string, options?: RequestInit) => {
      const response = mockResponses[callCount] || mockResponses[mockResponses.length - 1];
      callCount++;
      return createMockResponse(response.data, response.status || 200);
    },
    getCallCount: () => callCount,
  };
}

/**
 * Wait for async operations
 */
export function waitFor(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Mock timer utilities
 */
export function mockTimer() {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });
}
