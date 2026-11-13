import { useContext } from 'react';
import { FormContext, type FormState } from './formState';

export function useForm(): FormState {
  const ctx = useContext(FormContext);
  if (!ctx) throw new Error('useForm must be used inside FormProvider');
  return ctx;
}
