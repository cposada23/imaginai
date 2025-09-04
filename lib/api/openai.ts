import { getApiKey } from "@/lib/storage/local";

export type ImageSize = "512x512" | "1024x1024";

export type GenerateImageParams = {
  prompt: string;
  size?: ImageSize; // defaults to 1024x1024
  quality?: "standard" | "high"; // mapped to quality param if supported
  n?: number; // number of images to generate (1-4)
  responseFormat?: "b64_json" | "base64"; // we will return base64 string(s)
};

export type GeneratedImageResult = {
  data: string[]; // base64 strings
  created: number;
  model: string;
};

export class OpenAIError extends Error {
  code?: string | number;
  status?: number;
  constructor(message: string, opts?: { code?: string | number; status?: number }) {
    super(message);
    this.name = "OpenAIError";
    this.code = opts?.code;
    this.status = opts?.status;
  }
}

// Simple concurrency limiter
class ConcurrencyLimiter {
  private current = 0;
  private queue: Array<() => void> = [];
  constructor(private readonly maxConcurrent: number) {}

  async run<T>(fn: () => Promise<T>): Promise<T> {
    if (this.current >= this.maxConcurrent) {
      await new Promise<void>((resolve) => this.queue.push(resolve));
    }
    this.current++;
    try {
      const result = await fn();
      return result;
    } finally {
      this.current--;
      const next = this.queue.shift();
      if (next) next();
    }
  }
}

const limiter = new ConcurrencyLimiter(2);

function normalizeParams(params: GenerateImageParams): Required<GenerateImageParams> {
  return {
    prompt: params.prompt.trim(),
    size: params.size ?? "1024x1024",
    quality: params.quality ?? "standard",
    n: Math.min(Math.max(params.n ?? 1, 1), 4),
    responseFormat: params.responseFormat ?? "b64_json",
  } as Required<GenerateImageParams>;
}

function mapSize(input: string): ImageSize {
  if (input === "512" || input === "512x512") return "512x512";
  return "1024x1024";
}

async function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchWithRetry(input: RequestInfo, init: RequestInit, retries = 3): Promise<Response> {
  let attempt = 0;
  let delay = 500;
  while (true) {
    try {
      const res = await fetch(input, init);
      if (res.ok) return res;
      if (res.status >= 500 && attempt < retries) {
        attempt++;
        await sleep(delay);
        delay *= 2;
        continue;
      }
      // read error body
      let message = `OpenAI request failed with status ${res.status}`;
      try {
        const body = await res.json();
        message = body?.error?.message || message;
        throw new OpenAIError(message, { status: res.status, code: body?.error?.code });
      } catch {
        throw new OpenAIError(message, { status: res.status });
      }
    } catch (err) {
      if (attempt < retries) {
        attempt++;
        await sleep(delay);
        delay *= 2;
        continue;
      }
      throw err;
    }
  }
}

export async function generateImages(params: GenerateImageParams): Promise<GeneratedImageResult> {
  const key = getApiKey("openai");
  if (!key) throw new OpenAIError("Missing OpenAI API key. Please add it in Settings.");

  const norm = normalizeParams(params);

  const payload: Record<string, unknown> = {
    model: "gpt-image-1",
    prompt: norm.prompt,
    size: mapSize(norm.size),
    n: norm.n,
    response_format: "b64_json",
  };
  // quality: OpenAI images accepts "hd" flag historically; using quality param when supported
  if (norm.quality === "high") {
    // No official quality param in v1 images; keep for future compatibility
  }

  const res = await limiter.run(async () => {
    const r = await fetchWithRetry("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify(payload),
    });
    return r;
  });

  const json = (await res.json()) as {
    created: number;
    data: Array<{ b64_json?: string; url?: string }>;
    model?: string;
  };

  const base64List: string[] = (json.data || [])
    .map((d) => d.b64_json)
    .filter((v): v is string => Boolean(v));

  if (!base64List.length) {
    throw new OpenAIError("No image data returned by API");
  }

  return {
    data: base64List,
    created: json.created,
    model: json.model || "gpt-image-1",
  };
}


