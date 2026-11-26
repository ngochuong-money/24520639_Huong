import { useId } from 'react';
import { useForm } from './useForm';

export default function InputField({ name, label, type = 'text' }) {
  const { values, errors, setValue } = useForm();
  const id = useId();
  const errorId = `${id}-error`;
  const error = errors[name];

  return (
    <p className="field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        name={name}
        type={type}
        value={values[name] ?? ''}
        onChange={(event) => setValue(name, event.target.value)}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? errorId : undefined}
      />
      {error && (
        <span id={errorId} className="field-error" role="alert">
          {error}
        </span>
      )}
    </p>
  );
}
