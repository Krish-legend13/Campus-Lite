import { create } from 'zustand';

interface UserState {
    userId: string | null;
    role: 'Student' | 'Admin' | null;
    consentGiven: boolean;
    setLogin: (id: string, role: 'Student' | 'Admin', consent: boolean) => void;
    logout: () => void;
}

export const useStore = create<UserState>((set) => ({
    userId: null,
    role: null,
    consentGiven: false,
    setLogin: (id, role, consent) => set({ userId: id, role, consentGiven: consent }),
    logout: () => set({ userId: null, role: null, consentGiven: false }),
}));
