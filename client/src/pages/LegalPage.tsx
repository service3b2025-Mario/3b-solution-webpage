import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import Layout from "@/components/Layout";
import { Loader2 } from "lucide-react";

export default function LegalPage() {
  const params = useParams<{ slug: string }>();
  const { data: page, isLoading, error } = trpc.legalPages.getBySlug.useQuery(params.slug || "");

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-secondary" />
        </div>
      </Layout>
    );
  }

  if (error || !page) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Page Not Found</h1>
            <p className="text-muted-foreground">The requested page could not be found.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-primary py-16">
        <div className="container">
          <h1 className="text-3xl md:text-4xl font-bold text-white">{page.title}</h1>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 bg-background">
        <div className="container max-w-4xl">
          <div 
            className="prose prose-lg max-w-none text-foreground prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-a:text-secondary hover:prose-a:text-secondary/80"
            dangerouslySetInnerHTML={{ __html: page.content || "" }}
          />
        </div>
      </section>
    </Layout>
  );
}
