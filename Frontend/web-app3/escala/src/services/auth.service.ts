import { StrapiLoginResponse } from "@/interfaces/strapi/strapiLogin.interface";

export async function strapiLogin(
  email: string,
  password: string,
): Promise<StrapiLoginResponse | null> {
  const response = await fetch(`${process.env.STRAPI_API_URL}/api/auth/local`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      identifier: email,
      password,
    }),
    next: { revalidate: 0 },
    cache: "no-store",
  });
  if (!response.ok) return null;
  const data = await response.json();
  const rolesStrapi = (data?.user?.roles || []).map(
    (role: any) => role.name ?? role,
  );
  return { jwt: data.jwt, user: { ...data.user, roles: rolesStrapi } };
}
