# Sprint 2 — Appeal Form Contract

> Requirement #2: Context-driven form system with real-time field validation
> Rule: errors are **derived during render** from `values` — no `useEffect`, no `errors` state

## 1. Field Rules

All string values are trimmed before validation (except `confirmEmail`, which is compared to trimmed `email`).

| Field | Control | Required | Rule | Error message |
|---|---|---|---|---|
| `playerId` | `<input readOnly>` | ✓ | Must exist in `players` | `Unknown player.` |
| `matchId` | `<input>` | ✓ | `/^VCS-\d{4}-W\d{2}-M\d{2}$/` (e.g. `VCS-2026-W47-M03`) | `Match ID is required.` / `Use the format VCS-YYYY-Www-Mnn.` |
| `email` | `<input type="email">` | ✓ | Basic email pattern `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` | `Email is required.` / `Enter a valid email address.` |
| `confirmEmail` | `<input type="email">` | ✓ | Equals `email` (case-insensitive) | `Please confirm your email.` / `Emails do not match.` |
| `reason` | `<select>` | ✓ | One of `APPEAL_REASONS` | `Select a reason.` |
| `statement` | `<textarea>` | ✓ | 30–1000 characters | `Statement is required.` / `Statement must be at least 30 characters.` / `Statement must be at most 1000 characters.` |
| `evidenceUrl` | `<input type="url">` | — | Empty, or a valid `https://` URL | `Evidence must be an https:// URL.` |

```js
export const APPEAL_REASONS = [
  { value: 'false-positive', label: 'Anti-cheat false positive' },
  { value: 'misidentified', label: 'Wrong player identified' },
  { value: 'disproportionate', label: 'Sanction is disproportionate' },
  { value: 'new-evidence', label: 'New evidence available' },
];
```

## 2. `shared/validateAppeal.js`

```js
validateAppeal(values, { playerIds } = {}) → { [field]: message }
```
- Pure function, no side effects, same file used by client and server
- Returns only failing fields; `{}` means valid
- One message per field (first failing rule wins)
- `playerIds` is optional: when given, `playerId` must be in it (the server always passes it)

## 3. `FormContext` (`client/src/context/FormContext.js`)

```js
FormContext = createContext(null)

<FormProvider initialValues validate onSubmit>{children}</FormProvider>

useFormContext() → {
  values,            // { [field]: string }
  errors,            // derived: validate(values) — every render
  visibleErrors,     // errors filtered by touched || submitAttempted
  isValid,           // Object.keys(errors).length === 0
  touched,           // { [field]: boolean }
  status,            // 'idle' | 'submitting' | 'success' | 'error'
  serverMessage,     // string | null
  handleChange,      // (event) => void — immutable update of values
  handleBlur,        // (event) => void — marks field touched
  handleSubmit,      // (event) => Promise<void>
}
```
- `useFormContext()` throws `Error('useFormContext must be used inside <FormProvider>')` when context is `null`
- State held: `values`, `touched`, `submitAttempted`, `status`, `serverMessage`, `serverErrors`
- Derived (not state): `errors`, `visibleErrors`, `isValid`

### Real-time behaviour
- An error becomes visible once its field is **touched** (first blur) **or** a submit was attempted
- After that, the error updates **on every keystroke** in the same render pass
- Server field errors (`400 { fields }`) are merged into `visibleErrors` until that field changes again

## 4. `InputField` (`client/src/components/InputField.jsx`)

**Props:** `{ name, label, as = 'input', type = 'text', hint, options = [], ...rest }`
- Reads `values[name]`, `visibleErrors[name]`, `handleChange`, `handleBlur` from context
- `useId()` → `id`; `${id}-error`, `${id}-hint`
- `<label htmlFor={id}>`; `aria-invalid={Boolean(error)}`
- `aria-describedby` = space-joined ids of hint and error (only those present)
- Error: `<p id={`${id}-error`} role="alert">`
- `as="select"` renders `<option value="">Select…</option>` + `options`

## 5. `SimpleForm` (`client/src/components/SimpleForm.jsx`)

**Props:** `{ player }`
- `<FormProvider initialValues={{ playerId: player.id, matchId: player.matchId, … }}>`
- `<form noValidate onSubmit={handleSubmit} aria-describedby={statusId}>`
- `<fieldset><legend>Contact</legend>` (email, confirmEmail) + `<fieldset><legend>Appeal</legend>` (matchId, reason, statement, evidenceUrl)
- `<button type="submit" disabled={status === 'submitting'}>`
- Status region: `<p id={statusId} role="status" aria-live="polite">{serverMessage}</p>`
- On invalid submit: no request; all errors become visible; focus moves to the first invalid field
- Sprint 2 submit target: `POST /api/appeals` (server built in Sprint 3; until then the request fails and the error message is shown)
- No `window.alert`

## 6. `ShowData` (`client/src/components/ShowData.jsx`)

**Props:** `{ data = {}, title = 'Form state' }`
- `<section aria-labelledby>` → `<h4>` → `<dl>` → keyed `<Fragment key={key}>` → `<dt>{key}</dt><dd>{String(value)}</dd>`
- Empty strings render as `—`
- Inside `SimpleForm`, it receives `{ ...values, isValid, status }`

## 7. Submit Flow

| Situation | Request | `status` | User sees |
|---|---|---|---|
| Invalid form | none | `idle` | All errors + focus on the first invalid field |
| Valid, request in flight | `POST /api/appeals` | `submitting` | Button disabled, "Submitting appeal…" |
| `201` | — | `success` | "Appeal submitted. Reference: {id}" + form reset |
| `400 { fields }` | — | `error` | Server field errors under each field |
| `409` / `404` / network error | — | `error` | Server message, or "Could not submit appeal. Please try again." |

## 8. Test Cases (→ WBS 2.2)

**`validateAppeal` (unit)**
1. Valid payload → `{}`
2. Each required field empty → its "required" message
3. Bad `matchId` format → format message
4. Invalid email → email message
5. `confirmEmail` mismatch → `Emails do not match.`; differing only by case → valid
6. Statement of 29 / 30 / 1000 / 1001 chars → boundary behaviour
7. `evidenceUrl`: empty → valid; `http://…` → error; `https://…` → valid
8. Unknown `playerId` with `playerIds` provided → `Unknown player.`

**Form (component)**
9. No errors shown before interaction
10. Blur an empty required field → error appears; typing a valid value removes it with no extra effect cycle
11. Invalid input sets `aria-invalid="true"` and `aria-describedby` points to the error text
12. Submitting an invalid form shows all errors, makes no request and focuses the first invalid field
13. `ShowData` reflects `isValid` live
14. Valid submit calls `fetch` with the trimmed payload and shows the success status
15. A `400 { fields }` response shows the server error under the matching field
16. `useFormContext()` outside the provider throws
