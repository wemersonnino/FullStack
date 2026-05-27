export default {
  routes: [
    {
      method: "PATCH",
      path: "/users/theme",
      handler: "theme.updateTheme",
      config: {
        auth: false,        // fazemos a autenticação manual via JWT
        policies: [],
        middlewares: [],
      },
    },
  ],
};
