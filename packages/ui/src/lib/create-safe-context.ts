import { createContext, createElement, useContext } from "react";

interface SafeProviderProps<ContextValue> {
  children: React.ReactNode;
  value: ContextValue;
}

export const createSafeContext = <ContextValue>(errorMessage: string) => {
  const Context = createContext<ContextValue | null>(null);

  const useSafeContext = () => {
    const ctx = useContext(Context);
    if (ctx === null) throw new Error(errorMessage);
    return ctx;
  };

  const Provider = ({ children, value }: SafeProviderProps<ContextValue>) =>
    createElement(Context.Provider, { value }, children);

  return [Provider, useSafeContext] as const;
};
