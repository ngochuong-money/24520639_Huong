import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider } from '../src/context/FormContext.jsx';
import InputField from '../src/components/InputField.jsx';

const requireName = (values) => (values.name?.trim() ? {} : { name: 'Name is required.' });

const renderField = (props, { validate = requireName, initialValues = { name: '' } } = {}) => {
  const user = userEvent.setup();
  render(
    <FormProvider initialValues={initialValues} validate={validate} onSubmit={async () => ({ ok: true })}>
      <InputField {...props} />
    </FormProvider>,
  );
  return user;
};

describe('InputField', () => {
  test('label is bound to the control via useId', () => {
    renderField({ name: 'name', label: 'Name' });
    const input = screen.getByLabelText('Name');
    expect(input.tagName).toBe('INPUT');
    expect(input.id).not.toBe('');
  });

  test('valid/untouched field: aria-invalid="false", no alert', () => {
    renderField({ name: 'name', label: 'Name' });
    expect(screen.getByLabelText('Name')).toHaveAttribute('aria-invalid', 'false');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  test('touched invalid field: aria-invalid, alert, aria-describedby → error', async () => {
    const user = renderField({ name: 'name', label: 'Name' });
    const input = screen.getByLabelText('Name');
    await user.click(input);
    await user.tab();

    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent('Name is required.');
    expect(input).toHaveAccessibleDescription('Name is required.');
  });

  test('hint and error are both referenced by aria-describedby', async () => {
    const user = renderField({ name: 'name', label: 'Name', hint: 'As shown on your licence.' });
    const input = screen.getByLabelText('Name');
    expect(input).toHaveAccessibleDescription('As shown on your licence.');
    await user.click(input);
    await user.tab();
    expect(input).toHaveAccessibleDescription('As shown on your licence. Name is required.');
  });

  test('renders a textarea when as="textarea"', () => {
    renderField({ name: 'name', label: 'Name', as: 'textarea' });
    expect(screen.getByLabelText('Name').tagName).toBe('TEXTAREA');
  });

  test('renders a select with placeholder + options when as="select"', async () => {
    const options = [
      { value: 'a', label: 'Option A' },
      { value: 'b', label: 'Option B' },
    ];
    const user = renderField(
      { name: 'reason', label: 'Reason', as: 'select', options },
      { validate: () => ({}), initialValues: { reason: '' } },
    );
    const select = screen.getByLabelText('Reason');
    expect(select.tagName).toBe('SELECT');
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['Select…', 'Option A', 'Option B']);
    await user.selectOptions(select, 'b');
    expect(select).toHaveValue('b');
  });

  test('typing updates the value through context', async () => {
    const user = renderField({ name: 'name', label: 'Name' });
    const input = screen.getByLabelText('Name');
    await user.type(input, 'Himass');
    expect(input).toHaveValue('Himass');
  });
});
