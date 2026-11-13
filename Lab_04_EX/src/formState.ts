import { createContext } from 'react';
import type { Values, Errors } from './validation';

export type FormState = {
  values: Values;
  errors: Errors;
  isValid: boolean;
  setValue: (name: string, value: string) => void;
};

export const FormContext = createContext<FormState | null>(null);
