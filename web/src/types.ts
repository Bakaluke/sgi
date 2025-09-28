import type { JSX } from "react";

export interface Address {
  id?: number;
  type?: string;
  cep: string;
  street: string;
  number: string;
  complement: string | null;
  neighborhood: string;
  city: string;
  state: string;
}

export interface Customer {
  id: number;
  type: 'fisica' | 'juridica';
  document: string;
  name: string;
  legal_name: string | null;
  email: string | null;
  phone: string | null;
  addresses: Address[];
}

export interface CustomerFormProps {
  customer?: Customer | null;
  onSuccess: (customer: Customer) => void;
  onCancel: () => void;
}

export type CustomerFormData = Omit<Customer, 'id' | 'addresses'> & {
  address: Omit<Address, 'id' | 'type' | 'customer_id'>;
};

export type ProductFormData = Omit<Product, 'id' | 'cost_price' | 'quantity_in_stock' | 'image_path' | 'category'>;

export interface Product {
  id: number;
  name: string;
  sku: string;
  type: 'produto' | 'servico';
  sale_price: number;
  cost_price: number;
  quantity_in_stock: number;
  description?: string;
  image_path?: string | null;
  category_id?: number | null;
  category?: Category;
}

export interface Category {
  id: number;
  name: string;
  description: string | null;
  products_count: number;
}

export interface QuoteItem {
  id: number;
  product: Product;
  quantity: number;
  unit_cost_price: number;
  unit_sale_price: number;
  discount_percentage: number;
  profit_margin: number | null;
  total_price: number;
  notes: string | null;
  file_path: string | null;
}

export interface Status {
  id: number;
  name: string;
  color: string;
}

export interface Quote {
  id: number;
  customer: Customer;
  user: User;
  status_id: number | null;
  status: Status | null;
  total_amount: number;
  subtotal: number;
  created_at: string;
  items: QuoteItem[];
  discount_percentage: number;
  payment_method_id: number | null;
  payment_method: PaymentMethod | null;
  payment_term_id: number | null;
  payment_term: PaymentTerm | null;
  delivery_method_id: number | null;
  delivery_method: DeliveryMethod | null;
  negotiation_source_id: number | null;
  negotiation_source: NegotiationSource | null;
  delivery_datetime: string | null;
  notes: string | null;
  customer_data: CustomerDataSnapshot;
}

export interface CustomerDataSnapshot {
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface PaymentMethod {
  id: number;
  name: string;
}

export interface DeliveryMethod {
  id: number;
  name: string;
}

export interface PaymentTerm {
  id: number;
  name: string;
  number_of_installments: number;
  days_for_first_installment: number;
  days_between_installments: number;
}

export interface ProtectedRouteProps {
  children: JSX.Element;
  allowedRoles?: string[];
  requiredPermission?: string;
}

export interface StatusInfo {
  name: string;
  color: string;
}

export interface ProductAlert {
  id: number;
  name: string;
  quantity_in_stock: number;
}

export interface QuoteAlert {
  id: number;
  customer: { name: string; };
  created_at: string;
}

export interface ProductStat {
  product_name: string;
  total_quantity: number;
}

export interface Stats {
  quoteStats: { counts: { [key: string]: number }, statuses: StatusInfo[] } | null;
  orderStats: { counts: { [key: string]: number }, statuses: StatusInfo[] } | null;
  quotesOverTime: { date: string, count: number }[];
  kpis: { approvedValue: number; averageTicket: number; forecastValue: number; };
  lowStockProducts: ProductAlert[];
  staleQuotes: QuoteAlert[];
  topSellingProducts: ProductStat[];
}

export interface ProductionOrder {
  user: { name: string };
  id: number;
  quote_id: number;
  customer: { name: string };
  status: Status | null;
  status_id: number | null;
  created_at: string;
  quote: { items: QuoteItem[]; };
}

export interface SettingsData {
  legal_name: string;
  company_fantasy_name: string;
  cnpj: string;
  email: string;
  phone: string;
  cep: string;
  street: string;
  number: string;
  complement: string | null;
  neighborhood: string;
  city: string;
  state: string;
  logo_path: string | null;
  website: string | null;
}

export interface Permission {
  id: number;
  name: string;
}

export interface Role {
  id: number;
  name: string;
  display_name: string;
  permissions: Permission[];
}

export interface QuoteStatus {
  id: number;
  name: string;
  color: string;
}

export interface ProductionStatus {
  id: number;
  name: string;
  color: string;
}

export interface NegotiationSource {
  id: number;
  name: string;
}

export interface StockMovement {
  id: number;
  created_at: string;
  type: string;
  quantity: number;
  notes: string | null;
}

export type StockMovementPayload = {
  product_id: number;
  type: string;
  quantity: number;
  notes: string;
  cost_price: number | null;
};

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  roles: Role[];
  permissions: string[];
  role: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (userData: User, token: string) => void;
  logout: () => void;
  can: (permissionName: string) => boolean;
}

export interface Settings {
  company_fantasy_name: string | null;
}

export interface SettingsContextType {
  settings: Settings | null;
}

export interface ReceivableInstallment {
  id: number;
  account_receivable_id: number;
  installment_number: number;
  amount: number;
  due_date: string;
  paid_at: string | null;
  status: string;
}

export interface AccountReceivable {
  id: number;
  quote_id: number;
  customer_id: number;
  production_order_id: number;
  total_amount: number;
  paid_amount: number;
  due_date: string;
  paid_at: string | null;
  status: string;
  created_at: string;
  customer: { name: string; };
  quote: { id: number; };
  installments: ReceivableInstallment[];
}

export interface AccountPayable {
  quote: number;
  customer: { name: string; };
  id: number;
  description: string;
  supplier: string | null;
  total_amount: number;
  paid_amount: number;
  due_date: string;
  paid_at: string | null;
  status: string;
  created_at: string;
}

export interface ReportData {
  total_revenue: number;
  quote_count: number;
  average_ticket: number;
}

export interface CustomerSalesReport {
  id: number;
  name: string;
  total_sold: number;
  quote_count: number;
}

export interface ItemSalesReport {
  product_name: string;
  sale_date: string;
  total_quantity: number;
}

export interface CashFlowData {
  month: string;
  'A Receber': number;
  'A Pagar': number;
}
