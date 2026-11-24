import { createContext, useContext } from 'react';

// Stub — implemented in WBS 2.3
export const FormContext = createContext(null);

export function FormProvider({ children }) {
  return children;
}

export const useFormContext = () => useContext(FormContext);
