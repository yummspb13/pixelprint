"use client";

import { useState, useEffect } from 'react';
import { Search, TrendingUp, Clock, Users, BarChart3 } from 'lucide-react';

interface SearchLog {
  id: number;
  query: string;
  resultsCount: number;
  userAgent?: string;
  ip?: string;
  timestamp: string;
}

interface SearchStats {
  total: number;
  popularQueries: Array<{
    query: string;
    _count: { query: number };
  }>;
  dailyStats: Array<{
    date: string;
    searches: number;
    unique_queries: number;
  }>;
}

export default function SearchLogs() {
  const [logs, setLogs] = useState<SearchLog[]>([]);
  const [stats, setStats] = useState<SearchStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSearchLogs();
  }, []);

  const fetchSearchLogs = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/search/log');
      const data = await response.json();
      
      if (data.ok) {
        setLogs(data.logs);
        setStats(data.stats);
      } else {
        setError(data.error || 'Failed to fetch search logs');
      }
    } catch (err) {
      setError('Failed to fetch search logs');
      console.error('Error fetching search logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getBrowserInfo = (userAgent: string) => {
    if (!userAgent) return 'Unknown';
    
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Other';
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button 
            onClick={fetchSearchLogs}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-px-fg flex items-center gap-2">
            <Search className="h-6 w-6 text-px-cyan" />
            Search Analytics
          </h2>
          <p className="text-px-muted mt-1">Track user search behavior and popular queries</p>
        </div>
        <button 
          onClick={fetchSearchLogs}
          className="px-4 py-2 bg-px-cyan text-white rounded-lg hover:bg-px-cyan/90 transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-px-cyan" />
              <span className="text-sm font-medium text-px-muted">Total Searches</span>
            </div>
            <p className="text-2xl font-bold text-px-fg mt-1">{stats.total}</p>
          </div>
          
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-px-magenta" />
              <span className="text-sm font-medium text-px-muted">Unique Queries</span>
            </div>
            <p className="text-2xl font-bold text-px-fg mt-1">{stats.popularQueries.length}</p>
          </div>
          
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-px-yellow" />
              <span className="text-sm font-medium text-px-muted">Today's Searches</span>
            </div>
            <p className="text-2xl font-bold text-px-fg mt-1">
              {stats.dailyStats[0]?.searches || 0}
            </p>
          </div>
          
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium text-px-muted">Avg Results</span>
            </div>
            <p className="text-2xl font-bold text-px-fg mt-1">
              {logs.length > 0 ? Math.round(logs.reduce((acc, log) => acc + log.resultsCount, 0) / logs.length) : 0}
            </p>
          </div>
        </div>
      )}

      {/* Popular Queries */}
      {stats && stats.popularQueries.length > 0 && (
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-px-fg mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-px-magenta" />
            Most Popular Queries
          </h3>
          <div className="space-y-2">
            {stats.popularQueries.slice(0, 10).map((item, index) => (
              <div key={item.query} className="flex items-center justify-between py-2 px-3 bg-zinc-50 rounded-lg">
                <span className="font-medium text-px-fg">"{item.query}"</span>
                <span className="text-sm text-px-muted bg-px-cyan/10 text-px-cyan px-2 py-1 rounded-full">
                  {item._count.query} searches
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Searches */}
      <div className="bg-white rounded-lg border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-px-fg flex items-center gap-2">
            <Clock className="h-5 w-5 text-px-cyan" />
            Recent Searches
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-px-muted uppercase tracking-wider">
                  Query
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-px-muted uppercase tracking-wider">
                  Results
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-px-muted uppercase tracking-wider">
                  Browser
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-px-muted uppercase tracking-wider">
                  Time
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-zinc-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-px-fg">
                      "{log.query}"
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      log.resultsCount > 0 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {log.resultsCount} results
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-px-muted">
                    {getBrowserInfo(log.userAgent || '')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-px-muted">
                    {formatDate(log.timestamp)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {logs.length === 0 && (
          <div className="p-6 text-center text-px-muted">
            No search logs found yet.
          </div>
        )}
      </div>
    </div>
  );
}
