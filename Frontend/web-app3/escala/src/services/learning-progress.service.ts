import { httpGet, httpPatch, httpPost } from '@/lib/http/request';

const BASE_URL = '/api/bff/learning-progress';

export type LearningProgress = {
  id: string;
  module: string;
  topic: string;
  completed: boolean;
  notes?: string | null;
};

export type LearningProgressPayload = {
  module: string;
  topic: string;
  completed: boolean;
  notes?: string;
};

export async function getLearningProgress(authToken?: string) {
  return (await httpGet<LearningProgress[]>(BASE_URL, undefined, { authToken })) ?? [];
}

export async function createLearningProgress(payload: LearningProgressPayload) {
  return httpPost<LearningProgress>(BASE_URL, payload, { throwOnError: true });
}

export async function completeLearningProgress(id: string) {
  return httpPatch<void>(`${BASE_URL}/${id}/complete`, {}, { throwOnError: true });
}
