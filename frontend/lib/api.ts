const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('farmstand_token');
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(err.message || 'Request failed');
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// ── Auth ──────────────────────────────────────────────
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'FARMER' | 'BUYER';
  accessToken: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: 'FARMER' | 'BUYER';
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const authApi = {
  register: (data: RegisterPayload) =>
    request<AuthUser>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data: LoginPayload) =>
    request<AuthUser>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  logout: () =>
    request<void>('/auth/logout', { method: 'POST' }),
};

// ── Listings ──────────────────────────────────────────
export type ListingCategory = 'Vegetables' | 'Tubers' | 'Fruits' | 'Staples';
export type ListingStatus = 'ACTIVE' | 'SOLD_OUT';

export interface Listing {
  id: string;
  title: string;
  category: ListingCategory;
  description?: string;
  price: number;
  unit: string;
  quantity: number;
  location: string;
  imageUrl?: string;
  status: ListingStatus;
  farmerId: string;
  farmerName?: string;
  createdAt: string;
}

export interface PaginatedListings {
  items: Listing[];
  page: number;
  pageSize: number;
  total: number;
}

export interface ListingsQuery {
  q?: string;
  category?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  page?: number;
  pageSize?: number;
}

export interface CreateListingPayload {
  title: string;
  category: ListingCategory;
  description?: string;
  price: number;
  unit: string;
  quantity: number;
  location: string;
  imageUrl: string;
}

export const listingsApi = {
  getAll: (params: ListingsQuery = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params)
        .filter(([, v]) => v !== undefined && v !== '')
        .map(([k, v]) => [k, String(v)]),
    ).toString();
    return request<PaginatedListings>(`/listings${qs ? `?${qs}` : ''}`);
  },
  getOne: (id: string) => request<Listing>(`/listings/${id}`),
  create: (data: CreateListingPayload) =>
    request<Listing>('/listings', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<CreateListingPayload & { status: ListingStatus }>) =>
    request<Listing>(`/listings/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) =>
    request<void>(`/listings/${id}`, { method: 'DELETE' }),
};

// ── Orders ────────────────────────────────────────────
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'FULFILLED' | 'CANCELLED';

export interface Order {
  id: string;
  listingId: string;
  listingTitle: string;
  quantity: number;
  unit: string;
  unitPriceAtOrder: number;
  total: number;
  status: OrderStatus;
  buyerId: string;
  buyerName: string;
  farmerId: string;
  farmerName: string;
  createdAt: string;
  // Nested relations returned by the backend includes
  listing?: { title: string };
  buyer?: { name: string };
  farmer?: { name: string };
}

export const ordersApi = {
  create: (data: { listingId: string; quantity: number }) =>
    request<Order>('/orders', { method: 'POST', body: JSON.stringify(data) }),
  mine: (status?: OrderStatus) =>
    request<Order[]>(`/orders/mine${status ? `?status=${status}` : ''}`),
  received: (status?: OrderStatus) =>
    request<Order[]>(`/orders/received${status ? `?status=${status}` : ''}`),
  updateStatus: (id: string, status: OrderStatus) =>
    request<Order>(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
};
