import { supabase, isSupabaseConfigured } from './supabase';
import type { Product } from './products-data';
import type { CartItem } from './cart-storage';

export { isSupabaseConfigured };

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  userId?: string | null;
  orderNumber: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
    pincode: string;
  };
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'completed' | 'failed';
  paymentMethod: 'qr_code';
  qrCodeData?: string;
  transactionId?: string;
  createdAt: string;
  estimatedDelivery?: string;
}

export interface Inquiry {
  id: string;
  userType: 'retail' | 'business' | 'contractor';
  fullName: string;
  phone: string;
  email: string;
  address: string;
  pincode: string;
  productName: string;
  brand: string;
  color: string;
  quantity: number;
  unit: string;
  specifications?: any;
  verificationCode?: string;
  isVerified: boolean;
  status: 'pending' | 'contacted' | 'quoted' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export const getProducts = async (): Promise<Product[]> => {
  if (!isSupabaseConfigured) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(p => ({
      id: p.id,
      name: p.name,
      brand: p.brand,
      category: p.category,
      color: p.colors,
      description: p.description,
      specifications: p.specifications,
      basePrice: Number(p.base_price),
      unitType: p.unit_type as 'metres' | 'coils',
      stockQuantity: p.stock_quantity,
      imageUrl: p.image_url,
      brochureUrl: p.brochure_url || undefined,
      isActive: p.is_active,
    }));
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

export const getAllProducts = async (): Promise<Product[]> => {
  if (!isSupabaseConfigured) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(p => ({
      id: p.id,
      name: p.name,
      brand: p.brand,
      category: p.category,
      color: p.colors,
      description: p.description,
      specifications: p.specifications,
      basePrice: Number(p.base_price),
      unitType: p.unit_type as 'metres' | 'coils',
      stockQuantity: p.stock_quantity,
      imageUrl: p.image_url,
      brochureUrl: p.brochure_url || undefined,
      isActive: p.is_active,
    }));
  } catch (error) {
    console.error('Error fetching all products:', error);
    return [];
  }
};

export const getProductById = async (id: string): Promise<Product | undefined> => {
  if (!isSupabaseConfigured) {
    return undefined;
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) return undefined;

    return {
      id: data.id,
      name: data.name,
      brand: data.brand,
      category: data.category,
      color: data.colors,
      description: data.description,
      specifications: data.specifications,
      basePrice: Number(data.base_price),
      unitType: data.unit_type as 'metres' | 'coils',
      stockQuantity: data.stock_quantity,
      imageUrl: data.image_url,
      brochureUrl: data.brochure_url || undefined,
      isActive: data.is_active,
    };
  } catch (error) {
    console.error('Error fetching product:', error);
    return undefined;
  }
};

export const saveProduct = async (product: Omit<Product, 'id'> & { id?: string }): Promise<Product | null> => {
  if (!isSupabaseConfigured) {
    return null;
  }

  try {
    const productData = {
      id: product.id,
      name: product.name,
      brand: product.brand,
      category: product.category,
      colors: product.color,
      description: product.description,
      specifications: product.specifications,
      base_price: product.basePrice,
      unit_type: product.unitType,
      stock_quantity: product.stockQuantity,
      image_url: product.imageUrl,
      brochure_url: product.brochureUrl,
      is_active: product.isActive,
    };

    if (product.id) {
      const { data, error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', product.id)
        .select()
        .single();

      if (error) throw error;
      return data ? {
        id: data.id,
        name: data.name,
        brand: data.brand,
        category: data.category,
        color: data.colors,
        description: data.description,
        specifications: data.specifications,
        basePrice: Number(data.base_price),
        unitType: data.unit_type as 'metres' | 'coils',
        stockQuantity: data.stock_quantity,
        imageUrl: data.image_url,
        brochureUrl: data.brochure_url || undefined,
        isActive: data.is_active,
      } : null;
    } else {
      const { data, error } = await supabase
        .from('products')
        .insert(productData)
        .select()
        .single();

      if (error) throw error;
      return data ? {
        id: data.id,
        name: data.name,
        brand: data.brand,
        category: data.category,
        color: data.colors,
        description: data.description,
        specifications: data.specifications,
        basePrice: Number(data.base_price),
        unitType: data.unit_type as 'metres' | 'coils',
        stockQuantity: data.stock_quantity,
        imageUrl: data.image_url,
        brochureUrl: data.brochure_url || undefined,
        isActive: data.is_active,
      } : null;
    }
  } catch (error) {
    console.error('Error saving product:', error);
    throw error;
  }
};

export const deleteProduct = async (id: string): Promise<boolean> => {
  if (!isSupabaseConfigured) {
    return false;
  }

  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting product:', error);
    return false;
  }
};

export const getUserCart = async (userId: string): Promise<CartItem[]> => {
  if (!isSupabaseConfigured || !userId) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('carts')
      .select('items')
      .eq('user_id', userId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') throw error;
    return data?.items || [];
  } catch (error) {
    console.error('Error fetching cart:', error);
    return [];
  }
};

export const saveUserCart = async (userId: string, items: CartItem[]): Promise<void> => {
  if (!isSupabaseConfigured || !userId) {
    return;
  }

  try {
    const { error } = await supabase
      .from('carts')
      .upsert({
        user_id: userId,
        items: items,
      }, { onConflict: 'user_id' });

    if (error) throw error;
  } catch (error) {
    console.error('Error saving cart:', error);
    throw error;
  }
};

export const getUserOrders = async (userId: string): Promise<Order[]> => {
  if (!isSupabaseConfigured || !userId) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(order => ({
      id: order.id,
      userId: order.user_id,
      orderNumber: order.order_number,
      customerInfo: {
        name: order.customer_name,
        email: order.customer_email,
        phone: order.customer_phone,
        address: order.customer_address,
        pincode: order.customer_pincode,
      },
      items: order.items,
      subtotal: Number(order.subtotal),
      shippingCost: Number(order.shipping_cost),
      totalAmount: Number(order.total_amount),
      status: order.status as Order['status'],
      paymentStatus: order.payment_status as Order['paymentStatus'],
      paymentMethod: order.payment_method as Order['paymentMethod'],
      paymentProofUrl: order.payment_proof_url || undefined,
      qrCodeData: order.qr_code_data || undefined,
      transactionId: order.transaction_id || undefined,
      createdAt: order.created_at,
      estimatedDelivery: order.estimated_delivery || undefined,
    }));
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
};

export const saveOrder = async (order: Omit<Order, 'id' | 'createdAt'> & { id?: string }): Promise<Order | null> => {
  if (!isSupabaseConfigured) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('orders')
      .insert({
        id: order.id,
        user_id: order.userId,
        order_number: order.orderNumber,
        customer_name: order.customerInfo.name,
        customer_email: order.customerInfo.email,
        customer_phone: order.customerInfo.phone,
        customer_address: order.customerInfo.address,
        customer_pincode: order.customerInfo.pincode,
        items: order.items,
        subtotal: order.subtotal,
        shipping_cost: order.shippingCost,
        total_amount: order.totalAmount,
        status: order.status,
        payment_status: order.paymentStatus,
        payment_method: order.paymentMethod,
        payment_proof_url: order.paymentProofUrl,
        qr_code_data: order.qrCodeData,
        transaction_id: order.transactionId,
        estimated_delivery: order.estimatedDelivery,
      })
      .select()
      .single();

    if (error) throw error;

    return data ? {
      id: data.id,
      userId: data.user_id,
      orderNumber: data.order_number,
      customerInfo: {
        name: data.customer_name,
        email: data.customer_email,
        phone: data.customer_phone,
        address: data.customer_address,
        pincode: data.customer_pincode,
      },
      items: data.items,
      subtotal: Number(data.subtotal),
      shippingCost: Number(data.shipping_cost),
      totalAmount: Number(data.total_amount),
      status: data.status as Order['status'],
      paymentStatus: data.payment_status as Order['paymentStatus'],
      paymentMethod: data.payment_method as Order['paymentMethod'],
      paymentProofUrl: data.payment_proof_url || undefined,
      qrCodeData: data.qr_code_data || undefined,
      transactionId: data.transaction_id || undefined,
      createdAt: data.created_at,
      estimatedDelivery: data.estimated_delivery || undefined,
    } : null;
  } catch (error) {
    console.error('Error saving order:', error);
    throw error;
  }
};

export const getAllOrders = async (): Promise<Order[]> => {
  if (!isSupabaseConfigured) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(order => ({
      id: order.id,
      userId: order.user_id,
      orderNumber: order.order_number,
      customerInfo: {
        name: order.customer_name,
        email: order.customer_email,
        phone: order.customer_phone,
        address: order.customer_address,
        pincode: order.customer_pincode,
      },
      items: order.items,
      subtotal: Number(order.subtotal),
      shippingCost: Number(order.shipping_cost),
      totalAmount: Number(order.total_amount),
      status: order.status as Order['status'],
      paymentStatus: order.payment_status as Order['paymentStatus'],
      paymentMethod: order.payment_method as Order['paymentMethod'],
      paymentProofUrl: order.payment_proof_url || undefined,
      qrCodeData: order.qr_code_data || undefined,
      transactionId: order.transaction_id || undefined,
      createdAt: order.created_at,
      estimatedDelivery: order.estimated_delivery || undefined,
    }));
  } catch (error) {
    console.error('Error fetching all orders:', error);
    return [];
  }
};

export const updateOrderStatus = async (
  orderId: string,
  status: Order['status'],
  paymentStatus?: Order['paymentStatus']
): Promise<void> => {
  if (!isSupabaseConfigured) {
    return;
  }

  try {
    const updateData: any = { status };
    if (paymentStatus) {
      updateData.payment_status = paymentStatus;
    }

    const { error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

export const saveInquiry = async (inquiry: Omit<Inquiry, 'id' | 'createdAt' | 'updatedAt' | 'isVerified' | 'status'>): Promise<Inquiry | null> => {
  if (!isSupabaseConfigured) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('inquiries')
      .insert({
        user_type: inquiry.userType,
        full_name: inquiry.fullName,
        phone: inquiry.phone,
        email: inquiry.email,
        address: inquiry.address,
        pincode: inquiry.pincode,
        product_name: inquiry.productName,
        brand: inquiry.brand,
        color: inquiry.color,
        quantity: inquiry.quantity,
        unit: inquiry.unit,
        specifications: inquiry.specifications,
        verification_code: inquiry.verificationCode,
      })
      .select()
      .single();

    if (error) throw error;

    return data ? {
      id: data.id,
      userType: data.user_type as Inquiry['userType'],
      fullName: data.full_name,
      phone: data.phone,
      email: data.email,
      address: data.address,
      pincode: data.pincode,
      productName: data.product_name,
      brand: data.brand,
      color: data.color,
      quantity: data.quantity,
      unit: data.unit,
      specifications: data.specifications,
      verificationCode: data.verification_code || undefined,
      isVerified: data.is_verified,
      status: data.status as Inquiry['status'],
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    } : null;
  } catch (error) {
    console.error('Error saving inquiry:', error);
    throw error;
  }
};

export const getAllInquiries = async (): Promise<Inquiry[]> => {
  if (!isSupabaseConfigured) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('inquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(inquiry => ({
      id: inquiry.id,
      userType: inquiry.user_type as Inquiry['userType'],
      fullName: inquiry.full_name,
      phone: inquiry.phone,
      email: inquiry.email,
      address: inquiry.address,
      pincode: inquiry.pincode,
      productName: inquiry.product_name,
      brand: inquiry.brand,
      color: inquiry.color,
      quantity: inquiry.quantity,
      unit: inquiry.unit,
      specifications: inquiry.specifications,
      verificationCode: inquiry.verification_code || undefined,
      isVerified: inquiry.is_verified,
      status: inquiry.status as Inquiry['status'],
      createdAt: inquiry.created_at,
      updatedAt: inquiry.updated_at,
    }));
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    return [];
  }
};

export const updateInquiryStatus = async (inquiryId: string, status: Inquiry['status']): Promise<void> => {
  if (!isSupabaseConfigured) {
    return;
  }

  try {
    const { error } = await supabase
      .from('inquiries')
      .update({ status })
      .eq('id', inquiryId);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating inquiry status:', error);
    throw error;
  }
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  if (!isSupabaseConfigured || !userId) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

export const saveUserProfile = async (userId: string, profile: Partial<UserProfile>): Promise<UserProfile | null> => {
  if (!isSupabaseConfigured || !userId) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .upsert({
        id: userId,
        email: profile.email || '',
        full_name: profile.full_name || '',
        phone: profile.phone,
      }, { onConflict: 'id' })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving user profile:', error);
    throw error;
  }
};

export const checkIsOwner = async (userId: string): Promise<boolean> => {
  if (!isSupabaseConfigured || !userId) {
    return false;
  }

  try {
    const { data, error } = await supabase
      .from('owner_credentials')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  } catch (error) {
    console.error('Error checking owner status:', error);
    return false;
  }
};

export const exportDataToCSV = (data: any[], filename: string) => {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header => {
        const value = row[header];
        if (typeof value === 'object' && value !== null) {
          return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        }
        return `"${String(value || '').replace(/"/g, '""')}"`;
      }).join(',')
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
