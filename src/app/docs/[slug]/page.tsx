import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getAllSlugs, getPageMeta } from "@/lib/docs";
import { getDocContent } from "@/lib/content";
import { DocBody } from "@/components/DocBody";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const meta = getPageMeta(slug);
  return {
    title: meta?.title ?? slug,
    description: meta?.description,
  };
}

export default async function DocPage({ params }: Props) {
  const { slug } = await params;
  const content = getDocContent(slug);
  if (!content) redirect("/");
  return <DocBody content={content} />;
}
