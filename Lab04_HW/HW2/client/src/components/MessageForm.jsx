import { FormProvider, useFormContext } from '../context/FormContext.jsx';
import { validateMessage, TEXT_MAX } from '@shared/validateMessage.js';
import InputField from './InputField.jsx';

function MessageFormBody() {
  const { values, status, serverMessage, handleSubmit } = useFormContext();
  const isSubmitting = status === 'submitting';

  return (
    <form noValidate onSubmit={handleSubmit} aria-label="Post a message" className="appeal-form message-form">
      <fieldset>
        <legend>New message</legend>
        <InputField name="author" label="Your name" autoComplete="nickname" required />
        <InputField name="text" label="Message" as="textarea" hint={`${values.text.trim().length}/${TEXT_MAX} characters`} required />
      </fieldset>
      <button type="submit" className="action-link" disabled={isSubmitting}>Post message</button>
      <p role="status" aria-live="polite" className={`form-status form-status--${status}`}>
        {isSubmitting ? 'Posting…' : serverMessage}
      </p>
    </form>
  );
}

export default function MessageForm({ postMessage }) {
  const handlePost = async (payload) => {
    const result = await postMessage(payload);
    return result.ok ? { ok: true, message: 'Message posted.' } : result;
  };

  return (
    <FormProvider initialValues={{ author: '', text: '' }} validate={validateMessage} onSubmit={handlePost}>
      <MessageFormBody />
    </FormProvider>
  );
}
