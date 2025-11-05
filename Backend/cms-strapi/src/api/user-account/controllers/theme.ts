/**
 * Controller customizado para atualizar o tema do usuário logado
 */
export default {
  async updateTheme(ctx) {
    try {
      const user = ctx.state.user
      strapi.log.info("🔍 ctx.state.user:", user)

      if (!user) return ctx.unauthorized("Usuário não autenticado")

      const { theme } = ctx.request.body
      const validThemes = ["light", "dark", "system"]
      if (!theme || !validThemes.includes(theme)) {
        return ctx.badRequest("Tema inválido. Use: light, dark ou system.")
      }

      // Atualiza o campo "theme" do usuário autenticado (plugin users-permissions)
      const result = await strapi.db.query("plugin::users-permissions.user").update({
        where: { id: user.id },
        data: { theme },
      })
      strapi.log.info("🟢 Resultado do update:", result)

      // Busca o usuário atualizado
      const [updatedUser] = await strapi.db.query("plugin::users-permissions.user").findMany({
        where: { id: user.id },
        select: ["id", "username", "email", "theme"],
      })
      strapi.log.info("🟢 Resultado do findMany:", updatedUser)

      ctx.body = {
        message: "Tema atualizado com sucesso",
        user: updatedUser || null,
      }
    } catch (error) {
      strapi.log.error("❌ Erro ao atualizar tema:", error)
      ctx.internalServerError("Erro interno ao atualizar tema.")
    }
  },
}





