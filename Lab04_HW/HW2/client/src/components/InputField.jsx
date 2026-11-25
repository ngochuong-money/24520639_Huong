import { useId } from 'react';
import { useFormContext } from '../context/FormContext.jsx';

export default function InputField({ name, label, as = 'input', type = 'text', hint, options = [], ...rest }) {
  const { values, visibleErrors, handleChange, handleBlur } = useFormContext();
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  const error = visibleErrors[name];
  const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(' ') || undefined;

  const controlProps = {
    id,
    name,
    value: values[name] ?? '',
    onChange: handleChange,
    onBlur: handleBlur,
    'aria-invalid': Boolean(error),
    'aria-describedby': describedBy,
    className: 'field-control',
    ...rest,
  };

  let control;
  if (as === 'textarea') {
    control = <textarea {...controlProps} />;
  } else if (as === 'select') {
    control = (
      <select {...controlProps}>
        <option value="">Select…</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  } else {
    control = <input type={type} {...controlProps} />;
  }

  return (
    <>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      {control}
      {hint && (
        <p id={hintId} className="field-hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="field-error">
          {error}
        </p>
      )}
    </>
  );
}
