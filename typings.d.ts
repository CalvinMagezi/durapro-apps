export interface ProfileType {
  id: string;
  updated_at: string;
  username: string;
  full_name: string;
  created_at: string;
  email: string;
  phone_number: string;
  role: string;
  first_login: boolean;
}

export interface SupplierType {
  id: string;
  name: string;
  supplier_type: string;
  country: string;
  phone_number: string;
  email: string;
  fax: string;
  total_products: string;
  to_re_order: string;
  active_orders: string;
  supplier_type: string;
}

export interface SandRecoveryStatementType {
  id: string;
  supplier: string;
  date: string;
  product: string;
  no_of_bags: string;
  quantity_kgs: string;
  expected_bags: string;
  found_kgs: string;
  bal_kgs: string;
  grout_lg: string;
  grout_w: string;
  heavy_duty: string;
  fast_set: string;
  mabble: string;
  output_qty_normal_bags: string;
  output_qty_normal_kgs: string;
  qty_total_kgs: string;
  difference_kgs: string;
  amount_output: string;
  unit_cost: string;
  amount_est: string;
  balance: string;
  paid: string;
  recovery_unit_kgs: string;
  recovery_amount: string;
  balance_after_recovery: string;
  cumulative: string;
}
