import { useId } from 'react';
import { FormProvider, useFormContext } from '../context/FormContext.jsx';
import { validateAppeal, APPEAL_REASONS, STATEMENT_MIN, STATEMENT_MAX } from '@shared/validateAppeal.js';
import InputField from './InputField.jsx';
import ShowData from './ShowData.jsx';

const GENERIC_ERROR = 'Could not submit appeal. Please try again.';

async function submitAppeal(payload) {
  try {
    const response = await fetch('/api/appeals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => ({}));

    if (response.ok) {
      return { ok: true, message: `Appeal submitted. Reference: ${data.id}` };
    }
    return { ok: false, message: data.error ?? GENERIC_ERROR, fields: data.fields };
  } catch {
    return { ok: false, message: GENERIC_ERROR };
  }
}

function AppealFormBody() {
  const { values, isValid, status, serverMessage, handleSubmit } = useFormContext();
  const statusId = useId();
  const statementLength = values.statement.trim().length;
  const isSubmitting = status === 'submitting';

  return (
    <>
      <form noValidate onSubmit={handleSubmit} aria-describedby={statusId} className="appeal-form">
        <fieldset>
          <legend>Case</legend>
          <InputField name="playerId" label="Player ID" readOnly />
        </fieldset>

        <fieldset>
          <legend>Contact</legend>
          <InputField name="email" label="Email" type="email" autoComplete="email" required />
          <InputField name="confirmEmail" label="Confirm email" type="email" autoComplete="off" required />
        </fieldset>

        <fieldset>
          <legend>Appeal</legend>
          <InputField name="matchId" label="Match ID" hint="Format: VCS-YYYY-Www-Mnn" required />
          <InputField name="reason" label="Reason" as="select" options={APPEAL_REASONS} required />
          <InputField
            name="statement"
            label="Statement"
            as="textarea"
            hint={`${statementLength}/${STATEMENT_MAX} characters (minimum ${STATEMENT_MIN})`}
            required
          />
          <InputField
            name="evidenceUrl"
            label="Evidence URL (optional)"
            type="url"
            hint="Link to a clip or screenshot (https:// only)"
          />
        </fieldset>

        <button type="submit" className="action-link" disabled={isSubmitting}>
          Submit appeal
        </button>

        <p id={statusId} role="status" aria-live="polite" className={`form-status form-status--${status}`}>
          {isSubmitting ? 'Submitting appeal…' : serverMessage}
        </p>
      </form>

      <ShowData data={{ ...values, isValid, status }} />
    </>
  );
}

export default function SimpleForm({ player }) {
  const initialValues = {
    playerId: player.id,
    matchId: player.matchId,
    email: '',
    confirmEmail: '',
    reason: '',
    statement: '',
    evidenceUrl: '',
  };

  return (
    <FormProvider key={player.id} initialValues={initialValues} validate={validateAppeal} onSubmit={submitAppeal}>
      <AppealFormBody />
    </FormProvider>
  );
}
