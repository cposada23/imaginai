export const DB_NAME = "imaginai";
export const DB_VERSION = 1;

export const STORE_PROMPT_JOBS = "promptJobs";
export const STORE_GENERATED_IMAGES = "generatedImages";

export const INDEX_STATUS = "status";
export const INDEX_CREATED_AT = "createdAt";
export const INDEX_UPDATED_AT = "updatedAt";
export const INDEX_JOB_ID = "jobId";

export type JobStatus =
  | "queued"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled";

export interface PromptJob {
  id: string;
  prompt: string;
  negativePrompt?: string;
  model?: string;
  status: JobStatus;
  createdAt: number; // epoch ms
  updatedAt: number; // epoch ms
  error?: string | null;
}

export interface GeneratedImage {
  id: string;
  jobId: string;
  blob: Blob;
  mimeType: string; // e.g. "image/png"
  width: number;
  height: number;
  seed?: number;
  createdAt: number; // epoch ms
}

export interface ObjectStoreDefinition {
  name: string;
  keyPath: string;
  indexes: string[];
}

export const OBJECT_STORES: ObjectStoreDefinition[] = [
  {
    name: STORE_PROMPT_JOBS,
    keyPath: "id",
    indexes: [INDEX_STATUS, INDEX_CREATED_AT, INDEX_UPDATED_AT],
  },
  {
    name: STORE_GENERATED_IMAGES,
    keyPath: "id",
    indexes: [INDEX_JOB_ID, INDEX_CREATED_AT],
  },
];


