export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  roles: string[];
  permissions: string[];
  scopes: {
    barangay_ids: string[];
    partner_ids: string[];
  };
}
