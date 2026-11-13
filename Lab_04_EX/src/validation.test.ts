import { describe, it, expect } from 'vitest';
import { evaluateErrors, isFormValid } from './validation';

const rules = {
  name: { required: true, minLength: 2 },
  email: { required: true },
};

describe('evaluateErrors', () => {
  it('returns an error for each empty required field', () => {
    const errors = evaluateErrors({}, rules);
    expect(errors.name).toBeDefined();
    expect(errors.email).toBeDefined();
  });

  it('flags a value shorter than minLength', () => {
    const errors = evaluateErrors({ name: 'A', email: 'a@b.c' }, rules);
    expect(errors.name).toBeDefined();
    expect(errors.email).toBeUndefined();
  });

  it('treats whitespace-only as empty', () => {
    const errors = evaluateErrors({ name: '   ', email: 'a@b.c' }, rules);
    expect(errors.name).toBeDefined();
  });

  it('returns no errors for valid values', () => {
    expect(evaluateErrors({ name: 'Ada', email: 'a@b.c' }, rules)).toEqual({});
  });

  it('is pure: same input gives same output', () => {
    const values = { name: 'A' };
    expect(evaluateErrors(values, rules)).toEqual(evaluateErrors(values, rules));
  });
});

describe('isFormValid', () => {
  it('is false when there are errors', () => {
    expect(isFormValid({ name: 'Required' })).toBe(false);
  });

  it('is true when errors is empty', () => {
    expect(isFormValid({})).toBe(true);
  });
});
