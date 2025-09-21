// Temporary in-memory storage for demo purposes
// This will be shared across all API routes

export interface OrderItem {
  id: number;
  orderId: number;
  serviceName: string;
  serviceSlug: string;
  parameters: string; // JSON string
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  fileName?: string;
  fileSize?: number;
  notes?: string;
  createdAt: Date;
}

export interface Order {
  id: number;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  deliveryDate: Date;
  specialInstructions?: string;
  createdAt: Date;
  updatedAt: Date;
  orderItems: OrderItem[];
}

// In-memory storage
let orders: Order[] = [];
let orderCounter = 1;

export const mockDb = {
  orders: {
    create: (data: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => {
      const order: Order = {
        ...data,
        id: orderCounter++,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      orders.push(order);
      return order;
    },
    
    findMany: (where?: { customerEmail?: string }) => {
      if (where?.customerEmail) {
        return orders.filter(order => order.customerEmail === where.customerEmail);
      }
      return orders;
    },
    
    findFirst: (where: { orderNumber: string; customerEmail: string }) => {
      console.log('findFirst called with:', where);
      console.log('orders array:', orders);
      return orders.find(order => 
        order.orderNumber === where.orderNumber && 
        order.customerEmail === where.customerEmail
      );
    },
    
    findUnique: (where: { id: number }) => {
      return orders.find(order => order.id === where.id);
    },
    
    // Add direct access to orders array
    get all() {
      return orders;
    }
  }
};
