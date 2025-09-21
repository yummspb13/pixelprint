"use client";
import { useState, useEffect } from "react";
import { 
  Search, 
  Filter, 
  Download, 
  Plus,
  Eye,
  Edit,
  Trash2,
  Loader2,
  X,
  Calendar,
  Mail,
  Phone,
  Package,
  FileImage,
  FileText,
  Receipt
} from "lucide-react";
import EditableInvoice from "@/components/invoice/EditableInvoice";
import { WaveLoader } from "@/components/ui/loaders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import AdminCard from "@/components/admin/AdminCard";
import ScrollReveal from "@/components/ux/ScrollReveal";
import { toast } from "sonner";

interface OrderItem {
  id: number;
  serviceName: string;
  serviceSlug: string;
  parameters: string; // JSON string
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  fileName?: string;
  fileSize?: number;
  notes?: string;
  createdAt: string;
}

interface Order {
  id: number;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  customerAddress?: string;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  deliveryDate: string;
  specialInstructions: string | null;
  deliveryAddress?: string;
  deliveryCity?: string;
  deliveryPostcode?: string;
  deliveryCountry?: string;
  deliveryContactName?: string;
  deliveryContactPhone?: string;
  deliveryCost?: number;
  createdAt: string;
  orderItems: OrderItem[];
}

const statusColors = {
  success: "bg-green-100 text-green-800",
  warning: "bg-yellow-100 text-yellow-800",
  danger: "bg-red-100 text-red-800",
  info: "bg-blue-100 text-blue-800"
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);
  const [sortField, setSortField] = useState<string>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [columnOrder, setColumnOrder] = useState<string[]>([
    "orderNumber", "customer", "amount", "status", "priority", "date", "actions"
  ]);

  // Load orders from API
  useEffect(() => {
    fetchOrders();
  }, []);

  // Load column order and sort settings from localStorage
  useEffect(() => {
    const savedColumnOrder = localStorage.getItem('orders-column-order');
    const savedSortField = localStorage.getItem('orders-sort-field');
    const savedSortDirection = localStorage.getItem('orders-sort-direction');
    
    if (savedColumnOrder) {
      setColumnOrder(JSON.parse(savedColumnOrder));
    }
    if (savedSortField) {
      setSortField(savedSortField);
    }
    if (savedSortDirection) {
      setSortDirection(savedSortDirection as "asc" | "desc");
    }
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/orders/');
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      } else {
        toast.error("Failed to load orders");
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error("Error loading orders");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast.success("Order status updated");
        fetchOrders(); // Refresh orders
      } else {
        toast.error("Failed to update order status");
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error("Error updating order status");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'processing': return 'warning';
      case 'cancelled': return 'danger';
      case 'pending_payment': return 'info';
      case 'pending_review': return 'info';
      default: return 'info';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsViewModalOpen(true);
  };

  const handleEditOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsEditModalOpen(true);
  };

  const handleGenerateInvoice = (order: Order) => {
    setInvoiceOrder(order);
    setIsInvoiceModalOpen(true);
  };

  // Sort function
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
    localStorage.setItem('orders-sort-field', field);
    localStorage.setItem('orders-sort-direction', sortField === field ? (sortDirection === "asc" ? "desc" : "asc") : "asc");
  };

  // Drag and drop for columns
  const handleDragStart = (e: React.DragEvent, columnId: string) => {
    e.dataTransfer.setData("text/plain", columnId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();
    const draggedColumnId = e.dataTransfer.getData("text/plain");
    
    if (draggedColumnId !== targetColumnId) {
      const newColumnOrder = [...columnOrder];
      const draggedIndex = newColumnOrder.indexOf(draggedColumnId);
      const targetIndex = newColumnOrder.indexOf(targetColumnId);
      
      newColumnOrder.splice(draggedIndex, 1);
      newColumnOrder.splice(targetIndex, 0, draggedColumnId);
      
      setColumnOrder(newColumnOrder);
      localStorage.setItem('orders-column-order', JSON.stringify(newColumnOrder));
    }
  };

  const handleCloseInvoice = () => {
    setIsInvoiceModalOpen(false);
    setInvoiceOrder(null);
    // Обновить данные заказа после закрытия инвойса
    fetchOrders();
  };

  const handleCloseModals = () => {
    setIsViewModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedOrder(null);
  };

  // Column configuration
  const columns = {
    orderNumber: { label: "Order", sortable: true, width: "w-24" },
    customer: { label: "Customer", sortable: true, width: "w-40" },
    amount: { label: "Amount", sortable: true, width: "w-20" },
    status: { label: "Status", sortable: true, width: "w-28" },
    priority: { label: "Priority", sortable: true, width: "w-24" },
    date: { label: "Date", sortable: true, width: "w-24" },
    actions: { label: "Actions", sortable: false, width: "w-20" }
  };

  // Render cell content based on column type
  const renderCell = (order: Order, columnId: string) => {
    switch (columnId) {
      case "orderNumber":
        return (
          <td key="orderNumber" className="px-3 py-3 whitespace-nowrap">
            <div>
              <button
                onClick={() => handleGenerateInvoice(order)}
                className="font-medium text-px-cyan hover:text-px-magenta hover:underline cursor-pointer text-xs"
              >
                {order.orderNumber}
              </button>
              <div className="mt-1 text-xs text-px-muted">
                {order.orderItems.map((item, index) => (
                  <div key={index} className="flex items-center space-x-1">
                    <span>{item.serviceName}</span>
                    <span className="text-px-cyan">({item.quantity} pcs)</span>
                    {item.fileName && (
                      <FileImage className="h-3 w-3 text-green-600" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </td>
        );
      case "customer":
        return (
          <td key="customer" className="px-3 py-3 whitespace-nowrap text-sm text-px-fg">
            <div>
              <div className="truncate max-w-40" title={order.customerName}>
                {order.customerName}
              </div>
              <div className="mt-1 text-xs text-px-muted">
                <div className="truncate max-w-40" title={order.customerEmail}>
                  {order.customerEmail}
                </div>
                <div className="truncate max-w-40" title={order.customerPhone || 'No phone'}>
                  {order.customerPhone || 'No phone'}
                </div>
              </div>
            </div>
          </td>
        );
      case "amount":
        return (
          <td key="amount" className="px-3 py-3 whitespace-nowrap font-medium text-px-fg text-sm">
            £{order.totalAmount.toFixed(2)}
          </td>
        );
      case "status":
        return (
          <td key="status" className="px-3 py-3 whitespace-nowrap">
            <Select 
              value={order.status} 
              onValueChange={(newStatus) => updateOrderStatus(order.id, newStatus)}
            >
              <SelectTrigger className="w-28 h-8">
                <Badge className={statusColors[getStatusColor(order.status)] + " text-xs"}>
                  {order.status.replace('_', ' ')}
                </Badge>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending_payment">Pending Payment</SelectItem>
                <SelectItem value="pending_review">Pending Review</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </td>
        );
      case "priority":
        return (
          <td key="priority" className="px-3 py-3 whitespace-nowrap">
            <Badge className="bg-blue-100 text-blue-800 text-xs">
              {order.paymentMethod}
            </Badge>
          </td>
        );
      case "date":
        return (
          <td key="date" className="px-3 py-3 whitespace-nowrap text-xs text-px-muted">
            {formatDate(order.createdAt)}
          </td>
        );
      case "actions":
        return (
          <td key="actions" className="px-3 py-3 whitespace-nowrap">
            <div className="flex items-center space-x-1">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 w-7 p-0"
                title="View details"
                onClick={() => handleViewOrder(order)}
              >
                <Eye className="h-3 w-3" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 w-7 p-0"
                title="Edit order"
                onClick={() => handleEditOrder(order)}
              >
                <Edit className="h-3 w-3" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 w-7 p-0 text-red-600 hover:text-red-800"
                title="Delete order"
                onClick={() => updateOrderStatus(order.id, 'cancelled')}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </td>
        );
      default:
        return null;
    }
  };

  const filteredOrders = orders
    .filter(order => {
    const matchesSearch = order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortField) {
        case "orderNumber":
          aValue = a.orderNumber;
          bValue = b.orderNumber;
          break;
        case "customer":
          aValue = a.customerName;
          bValue = b.customerName;
          break;
        case "amount":
          aValue = a.totalAmount;
          bValue = b.totalAmount;
          break;
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
        case "priority":
          aValue = a.paymentMethod;
          bValue = b.paymentMethod;
          break;
        case "date":
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        default:
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
      }
      
      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <ScrollReveal>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight font-playfair">
              <span className="text-px-fg">Order </span>
              <span className="bg-gradient-to-r from-px-cyan via-px-magenta to-px-yellow bg-clip-text text-transparent animate-gradient">
                Management
              </span>
            </h1>
            <p className="text-lg text-px-muted max-w-2xl mt-2">
              Manage orders and track their status
            </p>
          </div>
          <Button className="bg-gradient-to-r from-px-cyan to-px-magenta hover:from-px-cyan/90 hover:to-px-magenta/90 text-white">
            <Plus className="h-4 w-4 mr-2" />
            New Order
          </Button>
        </div>
      </ScrollReveal>

      {/* Filters */}
      <ScrollReveal>
        <AdminCard title="Search and Filters">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-px-fg mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-px-muted" />
                <Input
                  type="text"
                  placeholder="Search orders..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-px-fg mb-2">
                Status
              </label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="pending_payment">Pending Payment</SelectItem>
                  <SelectItem value="pending_review">Pending Review</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-px-fg mb-2">
                Priority
              </label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="All priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All priorities</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end space-x-2">
              <Button variant="outline" className="flex-1">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </AdminCard>
      </ScrollReveal>

      {/* Orders Table */}
      <ScrollReveal>
        <div className="admin-orders-table bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-px-fg mb-4">Orders List</h3>
          <div className="table-container">
            <table className="divide-y divide-gray-200" style={{ width: '100%', minWidth: '800px' }}>
              <thead>
                <tr>
                  {columnOrder.map((columnId) => {
                    const column = columns[columnId as keyof typeof columns];
                    return (
                      <th
                        key={columnId}
                        className={`px-3 py-3 text-left text-xs font-medium text-px-muted uppercase tracking-wider ${column.width} ${
                          column.sortable ? 'cursor-pointer hover:bg-gray-50 select-none' : ''
                        }`}
                        draggable={true}
                        onDragStart={(e) => handleDragStart(e, columnId)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, columnId)}
                        onClick={() => column.sortable && handleSort(columnId)}
                      >
                        <div className="flex items-center space-x-1">
                          <span>{column.label}</span>
                          {column.sortable && sortField === columnId && (
                            <span className="text-px-cyan">
                              {sortDirection === "asc" ? "↑" : "↓"}
                            </span>
                          )}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={columnOrder.length} className="px-6 py-8 text-center">
                      <div className="flex justify-center">
                        <WaveLoader 
                          size="md" 
                          text="Loading orders..." 
                          className="scale-75"
                        />
                      </div>
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={columnOrder.length} className="px-6 py-8 text-center text-px-muted">
                      No orders found
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      {columnOrder.map((columnId) => renderCell(order, columnId))}
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </ScrollReveal>

      {/* View Order Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto w-[95vw] sm:w-full">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-px-fg">
              Order Details - {selectedOrder?.orderNumber}
            </DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AdminCard title="Customer Information">
                  <div className="flex items-center mb-4">
                    <Package className="h-5 w-5 mr-2" />
                    <h3 className="text-lg font-semibold text-px-fg">Customer Information</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-px-muted" />
                      <span className="font-medium">Name:</span>
                      <span className="ml-2">{selectedOrder.customerName}</span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-px-muted" />
                      <span className="font-medium">Email:</span>
                      <span className="ml-2">{selectedOrder.customerEmail}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-px-muted" />
                      <span className="font-medium">Phone:</span>
                      <span className="ml-2">{selectedOrder.customerPhone || 'Not provided'}</span>
                    </div>
                  </div>
                </AdminCard>

                <AdminCard title="Order Information">
                  <div className="flex items-center mb-4">
                    <Calendar className="h-5 w-5 mr-2" />
                    <h3 className="text-lg font-semibold text-px-fg">Order Information</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium">Status:</span>
                      <Badge className={`ml-2 ${statusColors[getStatusColor(selectedOrder.status)]}`}>
                        {selectedOrder.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div>
                      <span className="font-medium">Payment Method:</span>
                      <span className="ml-2">{selectedOrder.paymentMethod}</span>
                    </div>
                    <div>
                      <span className="font-medium">Delivery Date:</span>
                      <span className="ml-2">{formatDate(selectedOrder.deliveryDate)}</span>
                    </div>
                    {selectedOrder.deliveryCost && (
                      <div>
                        <span className="font-medium">Delivery Cost:</span>
                        <span className="ml-2">£{selectedOrder.deliveryCost.toFixed(2)}</span>
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Total Amount:</span>
                      <span className="ml-2 font-bold text-px-cyan">£{selectedOrder.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </AdminCard>

                {/* Invoice Actions */}
                <AdminCard title="Invoice Actions">
                  <div className="flex items-center mb-4">
                    <Receipt className="h-5 w-5 mr-2" />
                    <h3 className="text-lg font-semibold text-px-fg">Invoice Actions</h3>
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      className="bg-gradient-to-r from-px-cyan to-px-magenta text-white"
                      onClick={() => {
                        // Generate standard invoice
                        const invoiceData = {
                          orderNumber: selectedOrder.orderNumber,
                          customerName: selectedOrder.customerName,
                          customerEmail: selectedOrder.customerEmail,
                          customerAddress: selectedOrder.deliveryAddress ? 
                            `${selectedOrder.deliveryAddress}, ${selectedOrder.deliveryCity || ''} ${selectedOrder.deliveryPostcode || ''} ${selectedOrder.deliveryCountry || ''}`.trim() : 
                            'Address not provided',
                          totalAmount: selectedOrder.totalAmount,
                          items: selectedOrder.orderItems,
                          date: new Date().toISOString().split('T')[0],
                          status: selectedOrder.status
                        };
                        
                        // Open invoice in new tab
                        const invoiceUrl = `/admin/invoice?data=${encodeURIComponent(JSON.stringify(invoiceData))}&type=standard`;
                        window.open(invoiceUrl, '_blank');
                      }}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Standard Invoice
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        // Generate simplified invoice
                        const invoiceData = {
                          orderNumber: selectedOrder.orderNumber,
                          customerName: selectedOrder.customerName,
                          customerEmail: selectedOrder.customerEmail,
                          customerAddress: selectedOrder.deliveryAddress ? 
                            `${selectedOrder.deliveryAddress}, ${selectedOrder.deliveryCity || ''} ${selectedOrder.deliveryPostcode || ''} ${selectedOrder.deliveryCountry || ''}`.trim() : 
                            'Address not provided',
                          totalAmount: selectedOrder.totalAmount,
                          items: selectedOrder.orderItems,
                          date: new Date().toISOString().split('T')[0],
                          status: selectedOrder.status
                        };
                        
                        // Open invoice in new tab
                        const invoiceUrl = `/admin/invoice?data=${encodeURIComponent(JSON.stringify(invoiceData))}&type=simplified`;
                        window.open(invoiceUrl, '_blank');
                      }}
                    >
                      <Receipt className="h-4 w-4 mr-2" />
                      Simplified Invoice
                    </Button>
                  </div>
                </AdminCard>
              </div>

              {/* Order Items */}
              <AdminCard title="Order Items">
                <h3 className="text-lg font-semibold text-px-fg mb-4">Order Items</h3>
                <div className="space-y-4">
                  {selectedOrder.orderItems.map((item, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-px-fg">{item.serviceName}</h4>
                          <div className="text-sm text-px-muted mt-1">
                            {Object.entries(JSON.parse(item.parameters)).map(([key, value]) => (
                              <span key={key} className="mr-2">
                                {key}: {value as string}
                              </span>
                            ))}
                          </div>
                          <p className="text-sm text-px-muted">Quantity: {item.quantity} pcs</p>
                          <p className="text-sm text-px-muted">Unit Price: £{item.unitPrice.toFixed(2)}</p>
                          {item.notes && (
                            <p className="text-sm text-px-muted mt-1">Notes: {item.notes}</p>
                          )}
                          {item.fileName && (
                            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
                              <FileImage className="h-4 w-4 text-green-600" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-green-800 truncate">
                                  {item.fileName}
                                </p>
                                <p className="text-xs text-green-600">
                                  {item.fileSize ? `${(item.fileSize / 1024 / 1024).toFixed(1)} MB` : 'Unknown size'}
                                </p>
                              </div>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-green-600 border-green-300 hover:bg-green-100"
                                onClick={() => {
                                  // Download file from server
                                  const downloadUrl = `/api/files/${selectedOrder.id}/${item.id}`;
                                  const link = document.createElement('a');
                                  link.href = downloadUrl;
                                  link.download = item.fileName || 'file';
                                  document.body.appendChild(link);
                                  link.click();
                                  document.body.removeChild(link);
                                  toast.success(`Downloading ${item.fileName}...`);
                                }}
                              >
                                <Download className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <p className="font-bold text-px-cyan">£{item.totalPrice.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </AdminCard>

              {/* Special Instructions */}
              {selectedOrder.specialInstructions && (
                <AdminCard title="Special Instructions">
                  <h3 className="text-lg font-semibold text-px-fg mb-4">Special Instructions</h3>
                  <p className="text-px-muted">{selectedOrder.specialInstructions}</p>
                </AdminCard>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Order Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl w-[95vw] sm:w-full">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-px-fg">
              Edit Order - {selectedOrder?.orderNumber}
            </DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-px-fg mb-2">
                    Customer Name
                  </label>
                  <Input 
                    defaultValue={selectedOrder.customerName}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-px-fg mb-2">
                    Customer Email
                  </label>
                  <Input 
                    defaultValue={selectedOrder.customerEmail}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-px-fg mb-2">
                    Customer Phone
                  </label>
                  <Input 
                    defaultValue={selectedOrder.customerPhone || ''}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-px-fg mb-2">
                    Status
                  </label>
                  <Select defaultValue={selectedOrder.status}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending_payment">Pending Payment</SelectItem>
                      <SelectItem value="pending_review">Pending Review</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={handleCloseModals}>
                  Cancel
                </Button>
                <Button 
                  className="bg-gradient-to-r from-px-cyan to-px-magenta hover:from-px-cyan/90 hover:to-px-magenta/90 text-white"
                  onClick={() => {
                    toast.success("Order updated successfully!");
                    handleCloseModals();
                    fetchOrders();
                  }}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Invoice Modal */}
      {isInvoiceModalOpen && invoiceOrder && (
        <EditableInvoice
          orderData={{
            orderNumber: invoiceOrder.orderNumber,
            customerName: invoiceOrder.customerName,
            customerEmail: invoiceOrder.customerEmail,
            customerAddress: invoiceOrder.deliveryAddress ? 
              `${invoiceOrder.deliveryAddress}, ${invoiceOrder.deliveryCity || ''} ${invoiceOrder.deliveryPostcode || ''} ${invoiceOrder.deliveryCountry || ''}`.trim() : 
              'Address not provided',
            totalAmount: invoiceOrder.totalAmount,
            items: invoiceOrder.orderItems,
            date: new Date().toISOString().split('T')[0],
            status: invoiceOrder.status
          }}
          onClose={handleCloseInvoice}
          onSave={(invoiceData) => {
            console.log('Invoice saved:', invoiceData);
            // Обновить данные заказа после сохранения инвойса
            fetchOrders();
          }}
        />
      )}
    </div>
  );
}