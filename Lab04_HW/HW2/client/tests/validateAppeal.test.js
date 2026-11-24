import { validateAppeal, APPEAL_REASONS } from '@shared/validateAppeal.js';

const valid = {
  playerId: 'himass',
  matchId: 'VCS-2026-W47-M03',
  email: 'player@team.gg',
  confirmEmail: 'PLAYER@team.gg',
  reason: 'false-positive',
  statement: 'x'.repeat(30),
  evidenceUrl: '',
};
const withValues = (patch) => ({ ...valid, ...patch });

describe('validateAppeal', () => {
  test('1. exposes the four appeal reasons', () => {
    expect(APPEAL_REASONS.map((r) => r.value)).toEqual([
      'false-positive',
      'misidentified',
      'disproportionate',
      'new-evidence',
    ]);
  });

  test('1b. valid payload returns no errors', () => {
    expect(validateAppeal(valid)).toEqual({});
  });

  test.each([
    ['matchId', 'Match ID is required.'],
    ['email', 'Email is required.'],
    ['confirmEmail', 'Please confirm your email.'],
    ['reason', 'Select a reason.'],
    ['statement', 'Statement is required.'],
  ])('2. empty %s → required message', (field, message) => {
    expect(validateAppeal(withValues({ [field]: '   ' }))[field]).toBe(message);
  });

  test('3. bad matchId format', () => {
    expect(validateAppeal(withValues({ matchId: 'VCS-26-47' })).matchId).toBe(
      'Use the format VCS-YYYY-Www-Mnn.',
    );
  });

  test('4. invalid email', () => {
    expect(validateAppeal(withValues({ email: 'player@', confirmEmail: 'player@' })).email).toBe(
      'Enter a valid email address.',
    );
  });

  test('5. confirmEmail must match email (case-insensitive)', () => {
    expect(validateAppeal(withValues({ confirmEmail: 'other@team.gg' })).confirmEmail).toBe(
      'Emails do not match.',
    );
    expect(validateAppeal(valid).confirmEmail).toBeUndefined();
  });

  test.each([
    [29, 'Statement must be at least 30 characters.'],
    [30, undefined],
    [1000, undefined],
    [1001, 'Statement must be at most 1000 characters.'],
  ])('6. statement of %i chars', (length, expected) => {
    expect(validateAppeal(withValues({ statement: 'x'.repeat(length) })).statement).toBe(expected);
  });

  test.each([
    ['', undefined],
    ['http://clips.gg/123', 'Evidence must be an https:// URL.'],
    ['not a url', 'Evidence must be an https:// URL.'],
    ['https://clips.gg/123', undefined],
  ])('7. evidenceUrl "%s"', (evidenceUrl, expected) => {
    expect(validateAppeal(withValues({ evidenceUrl })).evidenceUrl).toBe(expected);
  });

  test('8. unknown playerId when playerIds is provided', () => {
    const options = { playerIds: ['himass', 'tanvuu'] };
    expect(validateAppeal(withValues({ playerId: 'ghost' }), options).playerId).toBe('Unknown player.');
    expect(validateAppeal(valid, options).playerId).toBeUndefined();
  });
});
