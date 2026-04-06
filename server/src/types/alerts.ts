

export type AlertType = 'warning' | 'success' | 'info' | 'danger';

export interface ClientAlert {
  _id: string;
  userId: string;
  type: AlertType;
  message: string;
  isRead: boolean;
  data: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  readAt?: string;
}

export interface MarkReadPayload {
  id?: string;
}

export interface AlertsResponse {
  alerts: ClientAlert[];
  unreadCount: number;
  refreshedAt: string;
}

