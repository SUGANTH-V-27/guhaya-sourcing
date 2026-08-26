export interface AppState {
  currentBrandId: string | null;
  currentModelId: string | null;
}

let appState: AppState = {
  currentBrandId: null,
  currentModelId: null,
};

const listeners = new Set<(state: AppState) => void>();

export const appStore = {
  getState(): AppState {
    return appState;
  },

  setState(nextState: Partial<AppState>) {
    appState = { ...appState, ...nextState };
    listeners.forEach((l) => l(appState));
  },

  subscribe(listener: (state: AppState) => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
