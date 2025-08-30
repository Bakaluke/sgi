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

export type CustomerFormData = Omit<Customer, 'id' | 'addresses'> & {
    address: Omit<Address, 'id' | 'type' | 'customer_id'>;
};

export interface Product {
    id: number;
    name: string;
    sku: string;
}

export interface QuoteItem {
    id: number;
    product: Product;
    quantity: number;
    unit_sale_price: number;
    total_price: number;
}

export interface Status {
    id: number;
    name: string;
    color: string;
}

export interface Quote {
    id: number;
    customer: Customer;
    user: { name: string };
    status: Status | null;
    payment_method_id: number | null;
    delivery_method_id: number | null;
    total_amount: number;
    created_at: string;
    items: QuoteItem[];
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