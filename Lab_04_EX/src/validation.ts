export type Rule = {
  required?: boolean;
  minLength?: number;
};
export type Rules = Record<string, Rule>;
export type Values = Record<string, string>;
export type Errors = Record<string, string>;

export function evaluateErrors(values: Values, rules: Rules): Errors {
  const errors: Errors = {};
  for (const [name, rule] of Object.entries(rules)) {
    const value = values[name] ?? '';
    if (rule.required && !value.trim()) {
      errors[name] = 'Required';
    } else if (rule.minLength && value.length < rule.minLength) {
      errors[name] = `At least ${rule.minLength} characters`;
    }
  }
  return errors;
}

export function isFormValid(errors: Errors): boolean {
  return Object.keys(errors).length === 0;
}
