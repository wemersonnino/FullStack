import AppProviders from '@/components/shared/AppProviders'
import HeaderPublic from '@/components/shared/HeaderPublic'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProviders>
      <HeaderPublic />
      <main className="min-h-screen">{children}</main>
    </AppProviders>
  )
}
