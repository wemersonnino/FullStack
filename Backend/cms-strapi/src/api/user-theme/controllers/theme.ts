import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

export default {
  async updateTheme(ctx) {
    try {
      const authHeader = ctx.request.header.authorization;

      if (!authHeader) return ctx.unauthorized("Token não fornecido.");

      const token = authHeader.split(" ")[1];

      let payload;
      try {
        payload = jwt.verify(token, JWT_SECRET);
      } catch (err) {
        return ctx.unauthorized("Token inválido ou expirado.");
      }

      const userId = payload.id;
      const { theme } = ctx.request.body;
      const validThemes = ["light", "dark", "system"];

      if (!theme || !validThemes.includes(theme)) {
        return ctx.badRequest("Tema inválido. Use: light, dark ou system.");
      }

      await strapi.db.query("plugin::users-permissions.user").update({
        where: { id: userId },
        data: { theme },
      });

      const updatedUser = await strapi.db
        .query("plugin::users-permissions.user")
        .findOne({
          where: { id: userId },
          select: ["id", "username", "email", "theme"],
        });

      ctx.body = {
        message: "Tema atualizado com sucesso",
        user: updatedUser,
      };
    } catch (error) {
      strapi.log.error("Erro ao atualizar tema:", error);
      ctx.internalServerError("Erro interno ao atualizar tema.");
    }
  },
};
