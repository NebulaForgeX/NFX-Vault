import type { Nullable } from "nfx-ui/types";
import { makePersistStore } from "nfx-ui/stores";
import { safeNullable } from "nfx-ui/utils";

interface AuthState {
  isAuthValid: boolean;
  accessToken: Nullable<string>;
  refreshToken: Nullable<string>;
  currentUserId: string;
  displayName: Nullable<string>;
  userEmail: Nullable<string>;
  avatarImageId: Nullable<string>;
}

interface AuthActions {
  setIsAuthValid: (v: boolean) => void;
  setTokens: (tokens: { accessToken: string; refreshToken: string | null | undefined }) => void;
  setFromUser: (user: { id: string; displayName?: string; email?: string; avatarImageId?: string | null }) => void;
  clearAuth: () => void;
}

const emptyUserId = "00000000-0000-0000-0000-000000000000";

export const VAULT_AUTH_STORAGE_KEY = "nfx-vault-auth-storage";

const { store: AuthStore, useStore: useAuthStore } = makePersistStore<AuthState, AuthActions>({
  name: VAULT_AUTH_STORAGE_KEY,
  initialState: {
    isAuthValid: false,
    accessToken: null,
    refreshToken: null,
    currentUserId: emptyUserId,
    displayName: null,
    userEmail: null,
    avatarImageId: null,
  },
  actions: (set) => ({
    setIsAuthValid: (v) => set({ isAuthValid: v }),

    setTokens: (tokens) =>
      set({
        accessToken: tokens.accessToken,
        refreshToken: safeNullable(tokens.refreshToken),
      }),

    setFromUser: (user) =>
      set({
        currentUserId: user.id,
        displayName: safeNullable(user.displayName),
        userEmail: safeNullable(user.email),
        avatarImageId: safeNullable(user.avatarImageId),
      }),

    clearAuth: () =>
      set({
        isAuthValid: false,
        accessToken: null,
        refreshToken: null,
        currentUserId: emptyUserId,
        displayName: null,
        userEmail: null,
        avatarImageId: null,
      }),
  }),
});

export { AuthStore, useAuthStore };
export default AuthStore;
