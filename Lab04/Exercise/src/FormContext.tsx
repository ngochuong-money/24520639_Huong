import { useState, type ReactNode } from 'react';
import { FormContext } from './formState';
import { evaluateErrors, isFormValid, type Rules, type Values } from './validation';

export function FormProvider({
  rules,
  children,
}: {
  rules: Rules;
  children: ReactNode;
}) {
  const [values, setValues] = useState<Values>({});
  const errors = evaluateErrors(values, rules);
  const isValid = isFormValid(errors);
  const setValue = (name: string, value: string) =>
    setValues((prev) => ({ ...prev, [name]: value }));

  return (
    <FormContext.Provider value={{ values, errors, isValid, setValue }}>
      {children}
    </FormContext.Provider>
  );
}

