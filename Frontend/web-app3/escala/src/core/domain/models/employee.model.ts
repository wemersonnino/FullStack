export interface Employee {
  id: string;
  fullName: string;
  email: string;
  active: boolean;
  sector?: {
    id: string;
    name: string;
  };
  project?: {
    id: string;
    name: string;
  };
  user?: {
    id: string;
    username: string;
    email: string;
  };
}
