import { create } from 'zustand';

interface MatchedDonor {
  id: string;
  name: string;
  phone: string;
  bloodGroup: string;
  latitude?: number;
  longitude?: number;
}

interface ActiveRequest {
  id: string;
  bloodGroup: string;
  bagsNeeded: number;
  hospitalName: string;
  hospitalLat: number;
  hospitalLng: number;
  conveyanceAmount: number;
  status: string;
  acceptanceType?: string;
  proxyName?: string;
  proxyPhone?: string;
  createdAt: string;
  matchedAt?: string;
}

interface RequestState {
  activeRequest: ActiveRequest | null;
  matchedDonor: MatchedDonor | null;
  isSearching: boolean;

  setActiveRequest: (request: ActiveRequest | null) => void;
  setMatchedDonor: (donor: MatchedDonor | null) => void;
  clearRequest: () => void;
  setSearching: (searching: boolean) => void;
}

export const useRequestStore = create<RequestState>((set) => ({
  activeRequest: null,
  matchedDonor: null,
  isSearching: false,

  setActiveRequest: (request) => set({ activeRequest: request }),
  setMatchedDonor: (donor) => set({ matchedDonor: donor }),
  clearRequest: () =>
    set({ activeRequest: null, matchedDonor: null, isSearching: false }),
  setSearching: (searching) => set({ isSearching: searching }),
}));
