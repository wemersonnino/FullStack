import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from 'react';

type LoaderStatus = 'idle' | 'loading' | 'success' | 'error';

interface LoaderEntry<T = unknown> {
  status: LoaderStatus;
  data?: T;
  error?: Error;
}

type LoaderState = Record<string, LoaderEntry>;
type LoaderAction =
  | { type: 'start'; key: string }
  | { type: 'success'; key: string; data: unknown }
  | { type: 'error'; key: string; error: Error }
  | { type: 'reset'; key?: string };

interface RouterLoaderContextValue {
  state: LoaderState;
  dispatch: React.Dispatch<LoaderAction>;
}

const RouterLoaderContext = createContext<RouterLoaderContextValue | undefined>(undefined);

const reducer = (state: LoaderState, action: LoaderAction): LoaderState => {
  switch (action.type) {
    case 'start':
      return {
        ...state,
        [action.key]: { status: 'loading', data: state[action.key]?.data },
      };
    case 'success':
      return {
        ...state,
        [action.key]: { status: 'success', data: action.data },
      };
    case 'error':
      return {
        ...state,
        [action.key]: { status: 'error', error: action.error },
      };
    case 'reset':
      if (!action.key) return {};
      const { [action.key]: _removed, ...rest } = state;
      return rest;
    default:
      return state;
  }
};

export const RouterLoaderProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, {});
  const value = useMemo<RouterLoaderContextValue>(() => ({ state, dispatch }), [state]);
  return <RouterLoaderContext.Provider value={value}>{children}</RouterLoaderContext.Provider>;
};

interface UseRouterLoaderOptions {
  enabled?: boolean;
  deps?: unknown[];
  skipCache?: boolean;
}

interface UseRouterLoaderReturn<T> extends LoaderEntry<T> {
  reload: () => Promise<void>;
  reset: () => void;
}

const useRouterLoaderContext = () => {
  const ctx = useContext(RouterLoaderContext);
  if (!ctx) throw new Error('useRouterLoader must be used within RouterLoaderProvider');
  return ctx;
};

export function useRouterLoader<T>(
  key: string,
  loader: () => Promise<T>,
  options: UseRouterLoaderOptions = {}
): UseRouterLoaderReturn<T> {
  const { enabled = true, deps = [], skipCache = false } = options;
  const { state, dispatch } = useRouterLoaderContext();
  const inFlight = useRef<AbortController | null>(null);

  const runLoader = useCallback(async () => {
    if (!enabled) return;
    if (!skipCache && state[key]?.status === 'success') return;

    inFlight.current?.abort();
    const controller = new AbortController();
    inFlight.current = controller;

    dispatch({ type: 'start', key });

    try {
      const data = await loader();
      if (!controller.signal.aborted) {
        dispatch({ type: 'success', key, data });
      }
    } catch (error) {
      if (!controller.signal.aborted && error instanceof Error) {
        dispatch({ type: 'error', key, error });
      }
    }
  }, [enabled, skipCache, loader, key, state, dispatch]);

  const reset = useCallback(() => dispatch({ type: 'reset', key }), [dispatch, key]);

  useEffect(() => {
    runLoader();
    return () => inFlight.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runLoader, ...deps]);

  return {
    ...(state[key] ?? { status: enabled ? 'loading' : 'idle' }),
    reload: runLoader,
    reset,
  } as UseRouterLoaderReturn<T>;
}
