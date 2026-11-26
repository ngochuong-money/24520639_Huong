import { describe, it, expect } from 'vitest';
import { evaluateErrors, isFormValid, validateMessage } from './validation';
import { messageValidationCases } from '../shared/messageValidationCases.js';

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

  it('flags a value longer than maxLength', () => {
    const errors = evaluateErrors(
      { text: 'a'.repeat(501) },
      { text: { required: true, maxLength: 500 } },
    );
    expect(errors.text).toBeDefined();
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

describe('client forum payload validation', () => {
  it.each(messageValidationCases)('$name', ({ body, details }) => {
    const result = validateMessage(body);
    expect(result.details).toEqual(details);
    if (Object.keys(details).length === 0) {
      expect(Object.keys(result.value).sort()).toEqual(['author', 'text']);
      expect(result.value.author).toBe(result.value.author.trim());
      expect(result.value.text).toBe(result.value.text.trim());
    }
  });
});
