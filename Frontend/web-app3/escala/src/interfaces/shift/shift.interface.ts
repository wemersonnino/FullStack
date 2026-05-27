export interface Shift {
  id: number;
  documentId: string;
  date: string;
  workMode?: 'presencial' | 'remoto';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}
