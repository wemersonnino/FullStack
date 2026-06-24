"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { signIn, signOut, useSession } from "next-auth/react"
import { toast } from "sonner"
import { useAppStore } from "@/stores/app.store"
import { ThemeEnum } from "@/interfaces/enums/theme.enum"
import { registerAccount } from "@/services/auth.service"
import { httpPost } from "@/lib/http/request"
import { API_ROUTES } from "@/constants/api"
import { ENV } from "@/constants/env"
import { getRecaptchaToken } from "@/lib/recaptcha"

// Tipos básicos (opcionalmente usar DTOs se já existirem)
interface RegisterPayload {
  username: string
  email: string
  password: string
  companySlug?: string
  recaptchaToken?: string
}
interface ForgotPayload {
  email: string
  companySlug?: string
  recaptchaToken?: string
}
interface ResetPayload {
  code: string
  password: string
  passwordConfirmation: string
  recaptchaToken?: string
}

export function useAuth() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, update } = useSession()
  const { setLoading } = useAppStore()

  // Login com NextAuth via BFF/Spring Boot
  async function login(email: string, password: string) {
    setLoading(true)
    try {
      const recaptchaToken = await getRecaptchaToken("login")
      const plan = searchParams.get('plan')
      const callbackUrl = plan ? `/dashboard/billing/plans` : "/dashboard"
      
      const res = await signIn("credentials", {
        email,
        password,
        companySlug: ENV.COMPANY_SLUG,
        recaptchaToken,
        redirect: false,
      })

      if (res?.ok) {
        toast.success("Login realizado com sucesso")
        router.push(callbackUrl)
        return true
      } else {
        toast.error("Credenciais inválidas")
        return false
      }
    } catch (err) {
      console.error("Erro no login:", err)
      toast.error("Erro ao conectar-se")
      return false
    } finally {
      setLoading(false)
    }
  }

  // 🧍‍♀️ Registro
  async function register(data: RegisterPayload) {
    setLoading(true)
    try {
      const recaptchaToken = await getRecaptchaToken("register")
      const res = await registerAccount({
        ...data,
        companySlug: data.companySlug || ENV.COMPANY_SLUG,
        recaptchaToken,
      })
      if (res) {
        toast.success("Conta criada com sucesso!")
        
        // Auto login or redirect to login with plan context
        const plan = searchParams.get('plan')
        const loginUrl = plan ? `/login?plan=${plan}` : "/login"
        router.push(loginUrl)
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
      const recaptchaToken = await getRecaptchaToken("forgot_password")
      const res = await httpPost("/api/bff/auth/forgot-password", {
        ...data,
        companySlug: data.companySlug || ENV.COMPANY_SLUG,
        recaptchaToken,
      })
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
      const recaptchaToken = await getRecaptchaToken("reset_password")
      const res = await httpPost("/api/bff/auth/reset-password", {
        ...data,
        recaptchaToken,
      })
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

  async function loginGoogle() {
    if (!ENV.GOOGLE_AUTH_ENABLED) {
      toast.error("Login Google nao configurado com credenciais reais.")
      return
    }
    const plan = searchParams.get('plan')
    const callbackUrl = plan ? `/dashboard/billing/plans` : "/dashboard"
    await signIn("google", { callbackUrl })
  }

  // 🎨 Atualizar tema do usuário logado
  async function updateTheme(theme: ThemeEnum) {
    if (!session?.user?.token) return
    try {
      setLoading(true)
      const res = await httpPost(`${API_ROUTES.UPDATE_USER_THEME}/${session.user.id}/theme`, { theme })
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
    loginGoogle,
    updateTheme,
    session,
  }
}
