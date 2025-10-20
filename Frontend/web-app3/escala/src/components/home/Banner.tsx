import { Banner as BannerType } from "@/interfaces/banner/banner.interface";
import Image from "next/image";

export const Banner = ({ data }: { data?: BannerType }) => {
  const defaultImage = "/public/default-banner.jpg"; // coloque essa imagem em /public
  const imageUrl = data?.image?.url || defaultImage;
  const title = data?.title || "Bem-vindo ao Portal Fundep";
  const subtitle = data?.subtitle || "Conteúdos, notícias e oportunidades.";
  const buttonText = data?.button_text || "Saiba mais";
  const buttonLink = data?.button_link || "#";

  return (
    <section className="relative flex flex-col items-center justify-center text-center py-16 bg-gray-100">
      <Image
        src={imageUrl}
        alt={data?.image?.alternativeText || "Banner padrão"}
        fill
        className="object-cover opacity-70 -z-10"
      />
      <div className="z-10 max-w-4xl space-y-4">
        <h2 className="text-4xl font-bold mb-4">{title}</h2>
        <p className="text-lg mb-8">{subtitle}</p>
        <a
          href={buttonLink}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
        >
          {buttonText}
        </a>
      </div>
    </section>
  );
};
