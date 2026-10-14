# AI Failure Audit

## Defect 1 — Missing Double-Submit Protection

### Defect Description
The first version of the registration form changed the state to `SUBMITTING`, but it did not explicitly prevent a second submit event from being processed.

This could cause duplicate requests if the user submits the form multiple times quickly.

### Diagnostic Method
The issue was detected by reviewing the form state logic and testing repeated submissions in the browser.

The original submit handler did not contain a guard checking whether the form was already in the `SUBMITTING` state.

### Refactored Solution
A state guard was added before starting the submission process:

```js
if (currentFormState === FORM_STATE.SUBMITTING) {
    return;
}