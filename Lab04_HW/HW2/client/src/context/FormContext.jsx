import { createContext, useContext, useMemo, useState } from 'react';

// eslint-disable-next-line react-refresh/only-export-components
export const FormContext = createContext(null);

const trimValues = (values) =>
  Object.fromEntries(
    Object.entries(values).map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value]),
  );

/**
 * onSubmit(payload) must resolve to:
 *   { ok: true,  message }                 → success
 *   { ok: false, message, fields? }        → handled failure (400/404/409…)
 * It may also throw; the provider then shows a generic message.
 */
export function FormProvider({ initialValues = {}, validate = () => ({}), onSubmit, children }) {
  const [values, setValues] = useState(initialValues);
  const [touched, setTouched] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [status, setStatus] = useState('idle');
  const [serverMessage, setServerMessage] = useState(null);
  const [serverErrors, setServerErrors] = useState({});

  // Derived during render — never stored in state, never synced by an effect
  const errors = useMemo(() => validate(values), [validate, values]);
  const isValid = Object.keys(errors).length === 0;

  const visibleErrors = { ...serverErrors };
  Object.entries(errors).forEach(([name, message]) => {
    if (touched[name] || submitAttempted) visibleErrors[name] = message;
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setServerErrors((prev) => {
      if (!(name in prev)) return prev;
      const { [name]: _removed, ...rest } = prev;
      return rest;
    });
  };

  const handleBlur = (event) => {
    const { name } = event.target;
    setTouched((prev) => (prev[name] ? prev : { ...prev, [name]: true }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (status === 'submitting') return;

    if (!isValid) {
      setSubmitAttempted(true);
      const firstInvalid = Array.from(event.currentTarget.elements).find((el) => errors[el.name]);
      firstInvalid?.focus();
      return;
    }

    setStatus('submitting');
    setServerMessage(null);
    setServerErrors({});

    try {
      const result = await onSubmit(trimValues(values));
      if (result.ok) {
        setStatus('success');
        setServerMessage(result.message);
        setValues(initialValues);
        setTouched({});
        setSubmitAttempted(false);
      } else {
        setStatus('error');
        setServerMessage(result.message);
        setServerErrors(result.fields ?? {});
      }
    } catch {
      setStatus('error');
      setServerMessage('Something went wrong. Please try again.');
    }
  };

  const value = {
    values,
    errors,
    visibleErrors,
    isValid,
    touched,
    status,
    serverMessage,
    handleChange,
    handleBlur,
    handleSubmit,
  };

  return <FormContext.Provider value={value}>{children}</FormContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useFormContext = () => {
  const context = useContext(FormContext);
  if (context === null) {
    throw new Error('useFormContext must be used inside <FormProvider>');
  }
  return context;
};
