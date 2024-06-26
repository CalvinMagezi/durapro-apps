export interface ProfileType {
  id: string;
  _id?: string;
  updated_at: string;
  username: string;
  full_name: string;
  created_at: string;
  email: string;
  phone_number: string;
  role: string;
  first_login: boolean;
  redeemed_codes: CashbackCodeType[];
  role_id: string;
  position: string;
}

export interface BanlistUserType {
  id: string;
  created_at: string;
  reason: string;
  phone_number: string;
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

export interface EmployeeType {
  id: string;
  name: string;
  email: string;
}

export interface CommissionType {
  id: string;
  created_at: string;
  employee_id: EmployeeType;
  month: string;
  target: number;
  sales: number;
  commission: number;
  base_tier: number;
  one_percent: number;
  two_percent: number;
  five_percent: number;
}

export interface CashbackFeedbackType {
  id: string;
  created_at: string;
  first_name: string;
  last_name: string;
  contact: string;
  shop_name: string;
  city: string;
  site_location: string;
  qty_bought: number;
  redeemed: number;
  not_redeemed: number;
  comment: string;
  user_id: string;
}

export interface CashbackCodeType {
  _id: string;
  _createdAt: string;
  code: string;
  product_name: string;
  redeemed_by: string;
  redeemed: boolean;
  redeemed_on: string;
  funds_disbursed: boolean;
  disbursed_on: string;
  mm_confirmation: string;
}

interface CashbackUserWithCodesType {
  codes: CashbackCodeType[];
  first_time_redeemed: boolean;
}

interface CashbackUsersWithCodesType {
  [phone_number: string]: CashbackUserWithCodesType;
}

export interface TilerProfileType {
  _id: string;
  createdAt: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  shop_name: string;
  city: string;
  site_location: string;
  quantity_bought: string;
  total_redeemed_codes: number;
  total_paid_codes: number;
  total_unpaid_codes: number;
  comment: string;
  redeemed_codes?: CashbackCodeType[];
  tracked_by?: ProfileType;
}

export interface CashbackTrackingRequestType {
  id: string;
  created_at: string;
  request_by: string;
  request_for: string;
  isConflict: boolean;
  notes: string;
}

export interface TilerTransactionType {
  id: string;
  created_at: string;
  transaction_date: string;
  tiler_profile: TilerProfileType;
  shop_name: string;
  city: string;
  site_location: string;
  quantity_bought: string;
  comment: string;
}

export interface CashbackUserType {
  _id: string;
  _createdAt: string;
  first_login: boolean;
  phone_number: string;
  role: string;
  uid: string;
  redeemed_codes: CashbackCodeType[];
}

export interface EquipmentType {
  created_at?: string | null;
  description?: string | null;
  id?: string;
  location?: string | null;
  name?: string | null;
  service_days?: string | null;
  image_url?: string | null;
  start_track_time?: string | null;
  next_service_time?: string | null;
  needs_servicing?: boolean | null;
}

export interface EquipmentPartType {
  created_at: string | null;
  description: string | null;
  id: string;
  last_serviced: string | null;
  name: string | null;
  needs_servicing: boolean | null;
  next_servicing: string | null;
  parent: string | null;
  service_days: string | null;
}
