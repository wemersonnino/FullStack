"use client"

import { useRouter } from "next/navigation"
import { signIn, signOut, useSession } from "next-auth/react"
import { toast } from "sonner"
import { useAppStore } from "@/stores/app.store"
import { httpPost } from "@/lib/http/request"
import { ThemeEnum } from "@/interfaces/enums/theme.enum"

// Tipos básicos (opcionalmente usar DTOs se já existirem)
interface RegisterPayload {
  username: string
  email: string
  password: string
}
interface ForgotPayload {
  email: string
}
interface ResetPayload {
  code: string
  password: string
  passwordConfirmation: string
}

export function useAuth() {
  const router = useRouter()
  const { data: session, update } = useSession()
  const { setLoading } = useAppStore()

  // 🔐 Login com NextAuth + Strapi
  async function login(email: string, password: string) {
    setLoading(true)
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (res?.ok) {
        toast.success("Login realizado com sucesso")
        router.push("/dashboard")
      } else {
        toast.error("Credenciais inválidas")
      }
    } catch (err) {
      console.error("Erro no login:", err)
      toast.error("Erro ao conectar-se")
    } finally {
      setLoading(false)
    }
  }

  // 🧍‍♀️ Registro
  async function register(data: RegisterPayload) {
    setLoading(true)
    try {
      const res = await httpPost("/api/auth/local/register", data)
      if (res) {
        toast.success("Conta criada com sucesso! Faça login.")
        router.push("/login")
      } else {
        toast.error("Erro ao registrar. Tente novamente.")
      }
    } catch (err) {
      console.error("Erro no registro:", err)
      toast.error("Erro ao registrar")
    } finally {
      setLoading(false)
    }
  }

  // 📧 Esqueci senha
  async function forgotPassword(data: ForgotPayload) {
    setLoading(true)
    try {
      const res = await httpPost("/api/auth/forgot-password", data)
      if (res) {
        toast.success("Email de recuperação enviado com sucesso!")
      } else {
        toast.error("Não foi possível enviar o email.")
      }
    } catch (err) {
      console.error("Erro em forgotPassword:", err)
      toast.error("Erro ao enviar email.")
    } finally {
      setLoading(false)
    }
  }

  // 🔑 Redefinir senha
  async function resetPassword(data: ResetPayload) {
    setLoading(true)
    try {
      const res = await httpPost("/api/auth/reset-password", data)
      if (res) {
        toast.success("Senha redefinida! Faça login.")
        router.push("/login")
      } else {
        toast.error("Erro ao redefinir senha. Código inválido?")
      }
    } catch (err) {
      console.error("Erro ao redefinir senha:", err)
      toast.error("Erro ao redefinir senha.")
    } finally {
      setLoading(false)
    }
  }

  // 🚪 Logout
  async function logout() {
    setLoading(true)
    try {
      await signOut({ callbackUrl: "/login" })
      toast.success("Sessão encerrada.")
    } catch (err) {
      console.error("Erro no logout:", err)
    } finally {
      setLoading(false)
    }
  }

  // 🎨 Atualizar tema do usuário logado
  async function updateTheme(theme: ThemeEnum) {
    if (!session?.user?.token) return
    try {
      setLoading(true)
      const res = await httpPost("/api/users/theme", { theme })
      if (res) {
        await update({ user: { ...session.user, theme } })
        toast.success(`Tema alterado para ${theme}`)
      }
    } catch (err) {
      console.error("Erro ao atualizar tema:", err)
      toast.error("Erro ao salvar preferência de tema.")
    } finally {
      setLoading(false)
    }
  }

  return {
    login,
    register,
    forgotPassword,
    resetPassword,
    logout,
    updateTheme,
    session,
  }
}
