import { atom, selector } from "recoil";

export type AuthUser = {
  id: string;
  username: string;
  email: string;
  globalRole?: string | null;
  imageUrl?: string | null;
};

export type EffectiveStore = {
  id: string;
  name: string;
  slug: string;
  timezone?: string | null;
  currency?: string | null;
  settings?: any;
  roles?: string[];
};

export type AuthState = {
  token: string | null;
  user: AuthUser | null ;
  effectiveStore: EffectiveStore | null;
  needsStoreSetup: boolean;
  needsStoreSelection?: boolean;
  suppliers?: Array<{ id: string; storeId: string | null; name: string; isActive: boolean }>;
  supplierId?: { id: string } | null;
  globalRole?: string | null;
};

const STORAGE_KEY = "synapstore:auth";

const parseJwt = (token: string): any | null => {
  try {
    const payload = token.split(".")[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
};

const isTokenExpired = (token: string | null) => {
  if (!token) return true;
  const payload = parseJwt(token);
  if (!payload?.exp) return true;
  const nowSeconds = Math.floor(Date.now() / 1000);
  return payload.exp < nowSeconds;
};


const persistenceEffect =
  (key: string) =>
    ({ setSelf, onSet }: any) => {
      try {
        const stored = localStorage.getItem(key);
        if (stored) {
          // Attempt to parse. If it fails (e.g. old encrypted data), catch block handles it.
          const parsed = JSON.parse(stored);
          setSelf(parsed);
        }
      } catch (e) {
        console.warn("Failed to retrieve/parse auth state from localStorage:", e);
        // Optional: clear it if it's invalid so next time we start fresh?
        // localStorage.removeItem(key);
      }

      onSet((newValue: AuthState, _: AuthState, isReset: boolean) => {
        if (isReset) {
          localStorage.removeItem(key);
        } else {
          localStorage.setItem(key, JSON.stringify(newValue));
        }
      });
    };


export const authState = atom<AuthState>({
  key: "authState",
  default: {
    token: null,
    user: null,
    effectiveStore: null,
    needsStoreSetup: false,
    needsStoreSelection: false,
    suppliers: [],
    supplierId: null,
    globalRole: null,
  },
  effects: [persistenceEffect(STORAGE_KEY)],
});

export const authStatus = selector({
  key: "authStatus",
  get: ({ get }) => {
    const state = get(authState);
    const expired = isTokenExpired(state.token);
    return {
      isAuthenticated: Boolean(state.token && !expired),
      isExpired: expired,
      user: state.user,
      effectiveStore: state.effectiveStore,
      needsStoreSetup: state.needsStoreSetup,
      needsStoreSelection: state.needsStoreSelection,
    };
  },
});

export const clearAuthState = () =>
({
  token: null,
  user: null,
  effectiveStore: null,
  needsStoreSetup: false,
  needsStoreSelection: false,
  suppliers: [],
  supplierId: null,
  globalRole: null,
} satisfies AuthState);

export const isTokenExpiredSafe = isTokenExpired;
