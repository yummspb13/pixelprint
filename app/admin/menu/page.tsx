import MenuManager from "@/components/admin/MenuManager";
import ScrollReveal from "@/components/ux/ScrollReveal";

export default function MenuManagementPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <ScrollReveal>
        <div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight font-playfair">
            <span className="text-px-fg">Menu </span>
            <span className="bg-gradient-to-r from-px-cyan via-px-magenta to-px-yellow bg-clip-text text-transparent animate-gradient">
              Management
            </span>
          </h1>
          <p className="text-lg text-px-muted max-w-2xl mt-4">
            Manage header menu tiles and navigation items
          </p>
        </div>
      </ScrollReveal>

      {/* Menu Manager */}
      <ScrollReveal>
        <MenuManager />
      </ScrollReveal>
    </div>
  );
}
