/**
 * Custom route to update user theme preference
 */
export default {
  routes: [
    {
      method: "PATCH",
      path: "/users/theme",
      handler: "theme.updateTheme",
      config: {
        auth: {
          enabled: true
        },
        policies: [],
        middlewares: [],
      },
    },
  ],
}
