'use client';

import { useState, useEffect } from 'react';
import AdminCard from './AdminCard';
import WaveLoader from '@/components/ui/WaveLoader';

interface Notification {
  id: string;
  type: string;
  color: string;
  message: string;
  description: string;
  timeAgo: string;
  orderId: string;
  status: string;
}

export default function RecentNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/dashboard/notifications');
      const data = await response.json();

      if (data.ok) {
        setNotifications(data.notifications);
      } else {
        setError(data.error || 'Failed to fetch notifications');
      }
    } catch (err) {
      setError('Failed to fetch notifications');
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminCard title="Recent Notifications" className="h-64">
        <div className="flex items-center justify-center h-32">
          <WaveLoader />
        </div>
      </AdminCard>
    );
  }

  if (error) {
    return (
      <AdminCard title="Recent Notifications" className="h-64">
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <p className="text-sm text-red-500 mb-2">{error}</p>
            <button 
              onClick={fetchNotifications}
              className="text-xs text-px-cyan hover:underline"
            >
              Try Again
            </button>
          </div>
        </div>
      </AdminCard>
    );
  }

  if (notifications.length === 0) {
    return (
      <AdminCard title="Recent Notifications" className="h-64">
        <div className="flex items-center justify-center h-32">
          <p className="text-sm text-px-muted">No recent notifications</p>
        </div>
      </AdminCard>
    );
  }

  return (
    <AdminCard title="Recent Notifications" className="h-64">
      <div className="space-y-4 max-h-48 overflow-y-auto">
        {notifications.map((notification) => (
          <div key={notification.id} className="flex items-start space-x-3">
            <div 
              className={`w-2 h-2 rounded-full mt-2 bg-${notification.color.replace('px-', '')}`}
              style={{
                backgroundColor: notification.color === 'px-cyan' ? '#06b6d4' : 
                               notification.color === 'px-magenta' ? '#d946ef' : 
                               notification.color === 'px-yellow' ? '#eab308' : '#6b7280'
              }}
            ></div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{notification.message}</p>
              <p className="text-xs text-px-muted truncate">{notification.description}</p>
              <p className="text-xs text-px-muted">{notification.timeAgo}</p>
            </div>
          </div>
        ))}
      </div>
    </AdminCard>
  );
}
