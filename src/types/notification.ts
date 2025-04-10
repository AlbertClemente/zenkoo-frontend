export interface Notification {
  id: string;
  message: string;
  created_at: string;
  is_read: boolean;
  type?: string;
}