export type LoginUser = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  profile_picture?: string;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
};