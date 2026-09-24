import { create } from 'zustand';

interface IncomingAlert {
  requestId: string;
  bloodGroup: string;
  bagsNeeded: number;
  hospitalName: string;
  conveyanceAmount: number;
}

interface NotificationState {
  incomingAlert: IncomingAlert | null;
  hasUnread: boolean;

  setIncomingAlert: (alert: IncomingAlert | null) => void;
  clearAlert: () => void;
  setHasUnread: (hasUnread: boolean) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  incomingAlert: null,
  hasUnread: false,

  setIncomingAlert: (alert) => set({ incomingAlert: alert, hasUnread: !!alert }),
  clearAlert: () => set({ incomingAlert: null }),
  setHasUnread: (hasUnread) => set({ hasUnread }),
}));
