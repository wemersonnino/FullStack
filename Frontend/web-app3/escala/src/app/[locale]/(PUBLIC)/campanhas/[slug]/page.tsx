import React from "react"
import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"

interface CampaignPageProps {
  params: {
    locale: string
    slug: string
  }
}

export default async function CampaignPage({ params }: CampaignPageProps) {
  const { slug, locale } = await params
  
  // Here we would typically fetch the campaign data from Strapi via BFF
  // const campaign = await getCampaignBySlug(slug, locale)
  // if (!campaign) notFound()

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Campanha: {slug}
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Esta é uma página de campanha dinâmica. O conteúdo será carregado do CMS com base no slug.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
