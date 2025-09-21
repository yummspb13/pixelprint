'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Plus,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Eye,
  Edit,
  Trash2,
  Download,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import AdminCard from "@/components/admin/AdminCard";
import ScrollReveal from "@/components/ux/ScrollReveal";
import WaveLoader from "@/components/ui/WaveLoader";
import { toast } from "sonner";

interface Customer {
  email: string;
  name: string;
  phone: string | null;
  totalOrders: number;
  totalSpent: number;
  averageOrder: number;
  lastOrderDate: Date | null;
  firstOrderDate: Date | null;
  statusCounts: Record<string, number>;
  recentOrders: Array<{
    totalAmount: number;
    createdAt: Date;
    status: string;
  }>;
}

const statusColors = {
  active: "bg-green-100 text-green-800",
  vip: "bg-purple-100 text-purple-800",
  inactive: "bg-gray-100 text-gray-800"
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    // Filter customers based on search term
    const filtered = customers.filter(customer =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.phone && customer.phone.includes(searchTerm))
    );
    setFilteredCustomers(filtered);
  }, [customers, searchTerm]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/customers');
      const data = await response.json();

      if (data.ok) {
        setCustomers(data.customers);
      } else {
        toast.error('Failed to load customers');
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const exportCustomers = async () => {
    try {
      const response = await fetch('/api/admin/customers/export');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `customers-export-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Customers exported successfully');
      } else {
        toast.error('Failed to export customers');
      }
    } catch (error) {
      console.error('Error exporting customers:', error);
      toast.error('Failed to export customers');
    }
  };

  const getCustomerStatus = (customer: Customer) => {
    if (customer.totalSpent > 5000) return 'vip';
    if (customer.totalOrders > 0) return 'active';
    return 'inactive';
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <WaveLoader />
      </div>
    );
  }
  return (
    <div className="space-y-8">
      {/* Header */}
      <ScrollReveal>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight font-playfair">
              <span className="text-px-fg">Customer </span>
              <span className="bg-gradient-to-r from-px-cyan via-px-magenta to-px-yellow bg-clip-text text-transparent animate-gradient">
                Management
              </span>
            </h1>
            <p className="text-lg text-px-muted max-w-2xl mt-2">
              Manage your customer database and relationships
            </p>
          </div>
          <div className="flex space-x-2">
            <Button 
              onClick={exportCustomers}
              variant="outline"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button 
              onClick={fetchCustomers}
              variant="outline"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </ScrollReveal>

      {/* Search and Filters */}
      <ScrollReveal>
        <AdminCard title="Search and Filters">
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-px-muted" />
              <Input
                type="text"
                placeholder="Search customers..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <div className="flex space-x-2">
              <Badge variant="outline">All: {filteredCustomers.length}</Badge>
              <Badge variant="outline" className="text-green-600">Active: {filteredCustomers.filter(c => getCustomerStatus(c) === 'active').length}</Badge>
              <Badge variant="outline" className="text-purple-600">VIP: {filteredCustomers.filter(c => getCustomerStatus(c) === 'vip').length}</Badge>
            </div>
          </div>
        </AdminCard>
      </ScrollReveal>

      {/* Customers List */}
      <ScrollReveal>
        <AdminCard title="Customers List">
          <div className="space-y-4">
            {filteredCustomers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-px-muted mx-auto mb-4" />
                <p className="text-px-muted">No customers found</p>
              </div>
            ) : (
              filteredCustomers.map((customer) => {
                const status = getCustomerStatus(customer);
                return (
                  <div key={customer.email} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-px-cyan to-px-magenta text-white rounded-full flex items-center justify-center font-semibold">
                          {customer.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold text-px-fg">{customer.name}</h3>
                            <Badge className={statusColors[status as keyof typeof statusColors]}>
                              {status.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-px-muted">
                            <div className="flex items-center space-x-1">
                              <Mail className="h-3 w-3" />
                              <span>{customer.email}</span>
                            </div>
                            {customer.phone && (
                              <div className="flex items-center space-x-1">
                                <Phone className="h-3 w-3" />
                                <span>{customer.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="space-y-1 mb-3">
                          <div className="text-sm text-px-muted">
                            <span className="font-medium">{customer.totalOrders}</span> orders
                          </div>
                          <div className="text-sm text-px-muted">
                            Total: <span className="font-medium text-px-cyan">{formatCurrency(customer.totalSpent)}</span>
                          </div>
                          <div className="text-xs text-px-muted">
                            Avg: <span className="font-medium">{formatCurrency(customer.averageOrder)}</span>
                          </div>
                          <div className="text-xs text-px-muted">
                            Last order: {formatDate(customer.lastOrderDate)}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </AdminCard>
      </ScrollReveal>

      {/* Customer Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <ScrollReveal>
          <AdminCard title="Total Customers">
            <div className="text-center">
              <div className="w-12 h-12 bg-px-cyan/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="h-6 w-6 text-px-cyan" />
              </div>
              <h3 className="text-2xl font-bold text-px-fg">{customers.length}</h3>
              <p className="text-sm text-px-muted">Total Customers</p>
            </div>
          </AdminCard>
        </ScrollReveal>

        <ScrollReveal>
          <AdminCard title="Active Customers">
            <div className="text-center">
              <div className="w-12 h-12 bg-px-magenta/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Calendar className="h-6 w-6 text-px-magenta" />
              </div>
              <h3 className="text-2xl font-bold text-px-fg">
                {customers.filter(c => getCustomerStatus(c) === 'active').length}
              </h3>
              <p className="text-sm text-px-muted">Active Customers</p>
            </div>
          </AdminCard>
        </ScrollReveal>

        <ScrollReveal>
          <AdminCard title="VIP Customers">
            <div className="text-center">
              <div className="w-12 h-12 bg-px-yellow/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="h-6 w-6 text-px-yellow" />
              </div>
              <h3 className="text-2xl font-bold text-px-fg">
                {customers.filter(c => getCustomerStatus(c) === 'vip').length}
              </h3>
              <p className="text-sm text-px-muted">VIP Customers</p>
            </div>
          </AdminCard>
        </ScrollReveal>

        <ScrollReveal>
          <AdminCard title="Total Revenue">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-px-fg">
                {formatCurrency(customers.reduce((sum, c) => sum + c.totalSpent, 0))}
              </h3>
              <p className="text-sm text-px-muted">Total Revenue</p>
            </div>
          </AdminCard>
        </ScrollReveal>
      </div>
    </div>
  );
}
