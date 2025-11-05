export default {
  routes: [
    {
      method: "POST",
      path: "/user-accounts/login",
      handler: "auth.login",
      config: { auth: false },
    },
    {
      method: "POST",
      path: "/user-accounts/register",
      handler: "auth.register",
      config: { auth: false },
    },
    {
      method: "POST",
      path: "/user-accounts/forgot-password",
      handler: "auth.forgotPassword",
      config: { auth: false },
    },
  ],
}
