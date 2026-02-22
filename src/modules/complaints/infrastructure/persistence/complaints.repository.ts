import type { ComplaintDto, CreateComplaintParams } from '../dto';

export type { ComplaintDto, CreateComplaintParams } from '../dto';

export const COMPLAINTS_REPOSITORY = Symbol('COMPLAINTS_REPOSITORY');

export interface ComplaintsRepository {
  createComplaint(params: CreateComplaintParams): Promise<ComplaintDto | null>;
}
