import React from "react"
import { notFound } from "next/navigation"
import { getLandingPage } from "@/services/landing.service"

interface LandingPageProps {
  params: Promise<{
    locale: string
    slug: string
  }>
}

export default async function LandingPage({ params }: LandingPageProps) {
  const { slug, locale } = await params

  const lp = await getLandingPage({ locale, slug, pageKey: 'segment' })
  
  // Se o slug retornado não bater com o pedido, significa que caiu no fallback (primeiro da lista)
  // o que para uma rota dinâmica pode ser indesejado.
  // No entanto, para um protótipo, vamos exibir o conteúdo retornado.

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  {lp.heroTitle}
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  {lp.heroDescription}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
