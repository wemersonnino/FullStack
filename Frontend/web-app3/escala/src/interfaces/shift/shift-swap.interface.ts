import { Shift } from './shift.interface';
import { User } from '../user/user.interface';

export interface ShiftSwap {
  id: number;
  documentId: string;
  compensationRequired: boolean;
  compensationDate?: string;
  comments?: string;
  status: 'pending' | 'approved' | 'rejected';
  adminComments?: string;
  requester?: User;
  receiver?: User;
  originalShift?: Shift;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}
