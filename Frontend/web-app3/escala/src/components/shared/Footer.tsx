import { FooterInterface } from "@/interfaces/footer/footer.interface";
import Image from "next/image";

function hasHref(url?: string | null) {
  return Boolean(url?.trim());
}

export const Footer = ({ data }: { data: FooterInterface | null }) => {
  if (!data) return null;

  return (
    <footer className="bg-gray-900 text-gray-200 py-8 mt-10">
      <div
        className="container mx-auto px-4 flex flex-col md:flex-row
      md:justify-between gap-8"
      >
        <div className="space-y-3">
          {data.logo?.url && (
            <Image
              src={data.logo.url}
              alt={data.logo.alternativeText || "Logo"}
              width={100}
              height={100}
            />
          )}
          <p className="text-sm text-gray-400 max-w-xs">{data.description}</p>
        </div>

        <div className="flex gap-12">
          <ul>
            {data.links?.map((l) => {
              const url = l.url?.trim();

              return (
                <li key={`${l.label}-${url || "text"}`}>
                  {hasHref(url) ? (
                    <a href={url} className="hover:underline">
                      {l.label}
                    </a>
                  ) : (
                    <span>{l.label}</span>
                  )}
                </li>
              );
            })}
          </ul>

          {data.social_links && (
            <ul>
              {data.social_links.map((s) => {
                const url = s.url?.trim();

                return (
                  <li key={`${s.platform}-${url || "text"}`}>
                    {hasHref(url) ? (
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {s.platform}
                      </a>
                    ) : (
                      <span>{s.platform}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
      {data.copyright && (
        <p className="text-center text-xs text-gray-500 mt-6">
          {data.copyright}
        </p>
      )}
    </footer>
  );
};
