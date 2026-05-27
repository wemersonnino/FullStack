export interface StrapiLoginResponse {
  jwt: string;
  user: {
    id: number;
    username: string;
    email: string;
    theme?: string;
    role?: { name: string };
  };
}
