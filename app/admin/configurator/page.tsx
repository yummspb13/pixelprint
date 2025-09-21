import { Metadata } from 'next';
import HomepageConfigurator from '@/components/admin/HomepageConfigurator';

export const metadata: Metadata = {
  title: 'Homepage Configurator - Pixel Print Admin',
  description: 'Configure sections and services displayed on the homepage',
};

export default function ConfiguratorPage() {
  return (
    <div className="min-h-screen bg-px-bg">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <HomepageConfigurator />
      </div>
    </div>
  );
}