export interface StrapiLoginResponse {
  jwt: string;
  user: {
    id: number;
    username: string;
    email: string;
    theme?: string;
    roles?: { name: string }[];
  };
}
