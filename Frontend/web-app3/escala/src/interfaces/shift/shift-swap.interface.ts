import { Shift } from './shift.interface';
import { User } from '../user/user.interface';

export interface ShiftSwap {
  id: number;
  documentId: string;
  compensationRequired: boolean;
  compensationDate?: string;
  comments?: string;
  status: 'pending' | 'colleague_approved' | 'approved' | 'effective' | 'rejected' | 'cancelled';
  adminComments?: string;
  requester?: User;
  receiver?: User;
  originalShift?: Shift;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}
