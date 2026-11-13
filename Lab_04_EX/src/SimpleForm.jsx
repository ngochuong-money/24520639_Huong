import { useState } from 'react';
import { Link } from 'react-router';
import { FormProvider } from './FormContext';
import { useForm } from './useForm';
import InputField from './InputField';
import ShowData from './ShowData';
import './SimpleForm.css';

const rules = {
  name: { required: true, minLength: 2 },
  email: { required: true },
};

function FormBody() {
  const { values, isValid } = useForm();
  const [submitted, setSubmitted] = useState(null);

  function handleSubmit(event) {
    event.preventDefault();
    if (!isValid) return;
    setSubmitted({ ...values });
  }

  return (
    <>
      <form onSubmit={handleSubmit} noValidate>
        <fieldset>
          <legend>Contact information</legend>
          <InputField name="name" label="Name" />
          <InputField name="email" label="Email" type="email" />
          <button type="submit" disabled={!isValid}>Submit</button>
        </fieldset>
      </form>
      <p role="status">{submitted ? 'Form submitted successfully.' : ''}</p>
      <ShowData data={submitted} />
    </>
  );
}

export default function SimpleForm() {
  return (
    <main className="simple-form-page">
      <Link to="/people">Back to people</Link>
      <h1>Simple form</h1>
      <FormProvider rules={rules}>
        <FormBody />
      </FormProvider>
    </main>
  );
}
