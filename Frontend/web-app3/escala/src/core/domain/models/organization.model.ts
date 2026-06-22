export interface Sector {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  managerId?: string;
  managerName?: string;
  maxSeats?: number;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  sectorId?: string;
}
