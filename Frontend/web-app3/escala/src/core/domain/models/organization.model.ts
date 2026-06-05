export interface Sector {
  id: string;
  name: string;
  description?: string;
  active: boolean;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  sectorId?: string;
}
