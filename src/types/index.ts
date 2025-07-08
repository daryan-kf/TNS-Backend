export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: "admin" | "user";
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url?: string;
  in_stock: boolean;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface AuthRequest extends Request {
  user?: User;
}
