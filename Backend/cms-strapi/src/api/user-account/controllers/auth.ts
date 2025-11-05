import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret"

export default {
  async login(ctx) {
    const { identifier, password } = ctx.request.body
    if (!identifier || !password) return ctx.badRequest("Credenciais inválidas")

    const user = await strapi.db.query("api::user-account.user-account").findOne({
      where: { email: identifier },
    })

    if (!user) return ctx.unauthorized("Usuário não encontrado")
    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return ctx.unauthorized("Senha incorreta")

    const token = jwt.sign(
      { id: user.id, email: user.email, theme: user.theme, roles: user.roles },
      JWT_SECRET,
      { expiresIn: "7d" }
    )

    ctx.body = {
      jwt: token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        theme: user.theme,
      },
    }
  },

  async register(ctx) {
    const { username, email, password } = ctx.request.body
    if (!username || !email || !password) return ctx.badRequest("Campos obrigatórios faltando")

    const existing = await strapi.db.query("api::user-account.user-account").findOne({ where: { email } })
    if (existing) return ctx.conflict("Email já registrado")

    const hashed = await bcrypt.hash(password, 10)
    const user = await strapi.db.query("api::user-account.user-account").create({
      data: { username, email, password: hashed },
    })

    ctx.body = { message: "Usuário criado com sucesso", user }
  },

  async forgotPassword(ctx) {
    const { email } = ctx.request.body
    // implemente envio de token por email (Mailgun, Resend, etc.)
    ctx.body = { message: `Instruções enviadas para ${email}` }
  },
}
