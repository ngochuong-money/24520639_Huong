import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SimpleForm from '../src/components/SimpleForm.jsx';
import { useFormContext } from '../src/context/FormContext.jsx';
import { findPlayer } from '../src/data/players.js';
import formContextSource from '../src/context/FormContext.jsx?raw';

const himass = findPlayer('himass');

const renderForm = () => {
  const user = userEvent.setup();
  render(<SimpleForm player={himass} />);
  return user;
};

const fillValid = async (user) => {
  await user.type(screen.getByLabelText('Email'), 'player@team.gg');
  await user.type(screen.getByLabelText('Confirm email'), 'player@team.gg');
  await user.selectOptions(screen.getByLabelText('Reason'), 'false-positive');
  await user.type(screen.getByLabelText('Statement'), '  The flagged input came from a certified mouse.  ');
};

const inspectorValue = (key) => {
  const inspector = screen.getByRole('region', { name: /form state/i });
  const term = within(inspector).getByText(key, { selector: 'dt' });
  return term.nextElementSibling.textContent;
};

const mockFetch = (status, body) => {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('Sprint 2 — appeal form', () => {
  test('9. no errors are shown before interaction', async () => {
    renderForm();
    expect(await screen.findByLabelText('Email')).toBeInTheDocument();
    expect(screen.queryAllByRole('alert')).toHaveLength(0);
  });

  test('10. blur shows the error, typing removes it in real time', async () => {
    const user = renderForm();
    const email = await screen.findByLabelText('Email');
    await user.click(email);
    await user.tab();
    expect(screen.getByText('Email is required.')).toBeInTheDocument();

    await user.type(email, 'player@');
    expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument();

    await user.type(email, 'team.gg');
    expect(screen.queryByText(/email address|email is required/i)).not.toBeInTheDocument();
  });

  test('10b. FormContext contains no useEffect (derived validation only)', () => {
    expect(formContextSource).not.toMatch(/useEffect/);
  });

  test('11. invalid field exposes aria-invalid and aria-describedby', async () => {
    const user = renderForm();
    const confirm = await screen.findByLabelText('Confirm email');
    await user.type(screen.getByLabelText('Email'), 'player@team.gg');
    await user.type(confirm, 'other@team.gg');
    await user.tab();

    expect(confirm).toHaveAttribute('aria-invalid', 'true');
    expect(confirm).toHaveAccessibleDescription(/emails do not match/i);
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'false');
  });

  test('12. invalid submit shows all errors, sends nothing, focuses first invalid field', async () => {
    const fetchMock = mockFetch(201, {});
    const user = renderForm();
    await user.click(await screen.findByRole('button', { name: 'Submit appeal' }));

    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.getByText('Email is required.')).toBeInTheDocument();
    expect(screen.getByText('Select a reason.')).toBeInTheDocument();
    expect(screen.getByText('Statement is required.')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toHaveFocus();
  });

  test('13. ShowData reflects isValid live', async () => {
    const user = renderForm();
    await screen.findByLabelText('Email');
    expect(inspectorValue('isValid')).toBe('false');
    await fillValid(user);
    expect(inspectorValue('isValid')).toBe('true');
  });

  test('14. valid submit posts the trimmed payload and shows success', async () => {
    const fetchMock = mockFetch(201, { id: 'APL-001' });
    const user = renderForm();
    await screen.findByLabelText('Email');
    await fillValid(user);
    await user.click(screen.getByRole('button', { name: 'Submit appeal' }));

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/appeals');
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body)).toMatchObject({
      playerId: 'himass',
      matchId: 'VCS-2026-W47-M03',
      statement: 'The flagged input came from a certified mouse.',
    });
    expect(await screen.findByRole('status')).toHaveTextContent(/appeal submitted.*APL-001/i);
  });

  test('15. server field errors appear under the matching field', async () => {
    mockFetch(400, { error: 'Validation failed', fields: { matchId: 'Match not found for this player.' } });
    const user = renderForm();
    await screen.findByLabelText('Email');
    await fillValid(user);
    await user.click(screen.getByRole('button', { name: 'Submit appeal' }));

    expect(await screen.findByText('Match not found for this player.')).toBeInTheDocument();
    expect(screen.getByLabelText('Match ID')).toHaveAttribute('aria-invalid', 'true');
  });

  test('16. useFormContext outside the provider throws', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const Probe = () => {
      useFormContext();
      return null;
    };
    expect(() => render(<Probe />)).toThrow('useFormContext must be used inside <FormProvider>');
  });
});
