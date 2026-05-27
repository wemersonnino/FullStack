import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import { FileText } from "lucide-react";
import { ArticleBlock, ArticleMedia } from "@/interfaces/article/article.interface";
import { ArticleSlider } from "@/components/article/ArticleSlider";

interface ArticleBlocksRendererProps {
  blocks: ArticleBlock[];
  fallbackContent?: string;
}

function isImage(file?: ArticleMedia) {
  return Boolean(file?.url && (file.mime?.startsWith("image/") || file.ext?.match(/\.(avif|gif|jpe?g|png|webp|svg)$/i)));
}

function isVideo(file?: ArticleMedia) {
  return Boolean(file?.url && (file.mime?.startsWith("video/") || file.ext?.match(/\.(mp4|mov|m4v|webm)$/i)));
}

function MarkdownBlock({ body }: { body: string }) {
  if (!body.trim()) return null;

  return (
    <div className="prose prose-lg dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={{
          a({ href, children, ...props }) {
            const safeHref = href?.trim();
            if (!safeHref) return <span>{children}</span>;

            return (
              <a href={safeHref} {...props}>
                {children}
              </a>
            );
          },
        }}
      >
        {body}
      </ReactMarkdown>
    </div>
  );
}

function MediaBlock({ file }: { file?: ArticleMedia }) {
  if (!file?.url) return null;

  if (isImage(file)) {
    return (
      <figure className="my-10">
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-900">
          <Image
            src={file.url}
            alt={file.alternativeText || file.name || "Imagem do artigo"}
            fill
            sizes="(min-width: 1024px) 896px, 100vw"
            className="object-cover"
          />
        </div>
        {file.caption && <figcaption className="mt-3 text-sm text-gray-500">{file.caption}</figcaption>}
      </figure>
    );
  }

  if (isVideo(file)) {
    return (
      <figure className="my-10">
        <video controls className="aspect-video w-full rounded-lg bg-black" preload="metadata">
          <source src={file.url} type={file.mime} />
        </video>
        {file.caption && <figcaption className="mt-3 text-sm text-gray-500">{file.caption}</figcaption>}
      </figure>
    );
  }

  return (
    <p className="my-8">
      <a
        href={file.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition hover:bg-gray-50 dark:hover:bg-gray-900"
      >
        <FileText className="size-4" />
        {file.name || "Abrir arquivo"}
      </a>
    </p>
  );
}

function QuoteBlock({ title, body }: { title?: string; body?: string }) {
  if (!title?.trim() && !body?.trim()) return null;

  return (
    <blockquote className="my-10 border-l-4 border-blue-600 pl-6">
      {body && <p className="text-xl font-medium leading-relaxed text-gray-900 dark:text-gray-100">{body}</p>}
      {title && <cite className="mt-3 block text-sm not-italic text-gray-500">{title}</cite>}
    </blockquote>
  );
}

function renderBlock(block: ArticleBlock) {
  switch (block.__component) {
    case "shared.rich-text": {
      const richText = block as Extract<ArticleBlock, { __component: "shared.rich-text" }>;
      return <MarkdownBlock body={richText.body} />;
    }
    case "shared.media": {
      const media = block as Extract<ArticleBlock, { __component: "shared.media" }>;
      return <MediaBlock file={media.file} />;
    }
    case "shared.slider": {
      const slider = block as Extract<ArticleBlock, { __component: "shared.slider" }>;
      return <ArticleSlider files={slider.files} />;
    }
    case "shared.quote": {
      const quote = block as Extract<ArticleBlock, { __component: "shared.quote" }>;
      return <QuoteBlock title={quote.title} body={quote.body} />;
    }
    default:
      return null;
  }
}

export function ArticleBlocksRenderer({ blocks, fallbackContent }: ArticleBlocksRendererProps) {
  if (!blocks.length) {
    return <MarkdownBlock body={fallbackContent || "Conteudo ainda nao disponivel para este artigo."} />;
  }

  return (
    <div className="space-y-8">
      {blocks.map((block, index) => (
        <section key={`${block.__component}-${block.id || index}`}>{renderBlock(block)}</section>
      ))}
    </div>
  );
}
