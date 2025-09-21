'use client';

import { useState, useEffect } from 'react';
import AdminCard from './AdminCard';
import WaveLoader from '@/components/ui/WaveLoader';

interface PopularService {
  id: string;
  name: string;
  slug: string;
  totalOrders: number;
  totalQuantity: number;
  clickCount: number;
}

export default function PopularServices() {
  const [services, setServices] = useState<PopularService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPopularServices();
  }, []);

  const fetchPopularServices = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/dashboard/popular-services');
      const data = await response.json();

      if (data.ok) {
        setServices(data.services);
      } else {
        setError(data.error || 'Failed to fetch popular services');
      }
    } catch (err) {
      setError('Failed to fetch popular services');
      console.error('Error fetching popular services:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminCard title="Popular Services" className="h-64">
        <div className="flex items-center justify-center h-32">
          <WaveLoader />
        </div>
      </AdminCard>
    );
  }

  if (error) {
    return (
      <AdminCard title="Popular Services" className="h-64">
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <p className="text-sm text-red-500 mb-2">{error}</p>
            <button 
              onClick={fetchPopularServices}
              className="text-xs text-px-cyan hover:underline"
            >
              Try Again
            </button>
          </div>
        </div>
      </AdminCard>
    );
  }

  if (services.length === 0) {
    return (
      <AdminCard title="Popular Services" className="h-64">
        <div className="flex items-center justify-center h-32">
          <p className="text-sm text-px-muted">No services with orders yet</p>
        </div>
      </AdminCard>
    );
  }

  // Calculate max orders for percentage calculation
  const maxOrders = Math.max(...services.map(s => s.totalOrders));

  const getGradientClass = (index: number) => {
    const gradients = [
      'from-px-cyan to-px-magenta',
      'from-px-magenta to-px-yellow', 
      'from-px-yellow to-px-cyan',
      'from-px-cyan to-px-magenta',
      'from-px-magenta to-px-yellow'
    ];
    return gradients[index % gradients.length];
  };

  return (
    <AdminCard title="Popular Services" className="h-64">
      <div className="space-y-4">
        {services.map((service, index) => {
          const percentage = maxOrders > 0 ? (service.totalOrders / maxOrders) * 100 : 0;
          
          return (
            <div key={service.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium truncate">{service.name}</span>
                <span className="text-sm text-px-muted">{service.totalOrders} orders</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`bg-gradient-to-r ${getGradientClass(index)} h-2 rounded-full transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </AdminCard>
  );
}
