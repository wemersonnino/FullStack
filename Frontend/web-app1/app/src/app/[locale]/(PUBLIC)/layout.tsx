import AppProviders from '@/components/shareds/AppProviders'
import HeaderPublic from '@/components/shareds/HeaderPublic'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProviders>
      <HeaderPublic />
      <main className="min-h-screen">{children}</main>
    </AppProviders>
  )
}
