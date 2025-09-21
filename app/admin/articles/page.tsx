import WhyArticlesManager from "@/components/admin/WhyArticlesManager";
import ScrollReveal from "@/components/ux/ScrollReveal";

export default function ArticlesManagementPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <ScrollReveal>
        <div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight font-playfair">
            <span className="text-px-fg">Why Choose </span>
            <span className="bg-gradient-to-r from-px-cyan via-px-magenta to-px-yellow bg-clip-text text-transparent animate-gradient">
              Articles
            </span>
          </h1>
          <p className="text-lg text-px-muted max-w-2xl mt-4">
            Manage "Why Choose Pixel Print" articles for the homepage
          </p>
        </div>
      </ScrollReveal>

      {/* Articles Manager */}
      <ScrollReveal>
        <WhyArticlesManager />
      </ScrollReveal>
    </div>
  );
}
