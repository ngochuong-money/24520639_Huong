import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import AppRoutes from '../src/routes/AppRoutes.jsx';

const NOW = new Date('2026-11-26T10:00:00+07:00'); // himass appeal window open
const json = (status, body) => ({ ok: status >= 200 && status < 300, status, json: async () => body });
const msg = (forum, n) => ({ id: `${forum}-${n}`, forum, author: 'Himass', text: `${forum} message ${n}`, createdAt: '2026-11-26T01:00:00.000Z' });

function setupServer() {
  let appeals = [{
    id: 'a1', playerId: 'himass', matchId: 'VCS-2026-W47-M03', reason: 'false-positive',
    statement: 'Earlier appeal about the macro detection.', evidenceUrl: '', createdAt: '2026-11-24T03:00:00.000Z',
  }];
  let messages = { nasa: [msg('nasa', 1)], 'esports-tribunal': [msg('esports-tribunal', 1)], notNasa: [] };

  const fetchMock = vi.fn(async (url, options = {}) => {
    if (url === '/api/time') return json(200, { now: Date.now() });
    if (url === '/api/appeals/himass') return json(200, appeals);
    if (url === '/api/appeals' && options.method === 'POST') {
      const { confirmEmail, email, ...rest } = JSON.parse(options.body);
      const created = { id: 'a2', ...rest, createdAt: NOW.toISOString() };
      appeals = [created, ...appeals];
      return json(201, { ...created, email });
    }
    const match = url.match(/^\/api\/messages\/(.+)$/);
    if (match) {
      const forum = decodeURIComponent(match[1]);
      if (options.method === 'POST') {
        const created = { id: `${forum}-new`, forum, ...JSON.parse(options.body), createdAt: NOW.toISOString() };
        messages = { ...messages, [forum]: [...messages[forum], created] };
        return json(201, created);
      }
      return json(200, messages[forum]);
    }
    return json(404, { error: 'Not found.' });
  });

  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

const renderAt = (path) => {
  const user = userEvent.setup();
  render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
    </MemoryRouter>,
  );
  return user;
};

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(NOW);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('Sprint 3 — tribunal integration', () => {
  test('a. default channel loads and is marked pressed', async () => {
    setupServer();
    renderAt('/dossier/himass');
    const discussion = await screen.findByRole('region', { name: 'Tribunal discussion' });
    expect(within(discussion).getByRole('button', { name: '#esports-tribunal' })).toHaveAttribute('aria-pressed', 'true');
    expect(await within(discussion).findByText('esports-tribunal message 1')).toBeInTheDocument();
  });

  test('b. switching channel loads that channel only', async () => {
    const fetchMock = setupServer();
    const user = renderAt('/dossier/himass');
    const discussion = await screen.findByRole('region', { name: 'Tribunal discussion' });
    await within(discussion).findByText('esports-tribunal message 1');

    await user.click(within(discussion).getByRole('button', { name: '#nasa' }));

    expect(await within(discussion).findByText('nasa message 1')).toBeInTheDocument();
    expect(within(discussion).queryByText('esports-tribunal message 1')).not.toBeInTheDocument();
    expect(within(discussion).getByRole('button', { name: '#nasa' })).toHaveAttribute('aria-pressed', 'true');
    expect(fetchMock).toHaveBeenCalledWith('/api/messages/nasa', expect.objectContaining({ signal: expect.any(AbortSignal) }));
  });

  test('c. message form validates with the shared rules, then posts and refreshes', async () => {
    const fetchMock = setupServer();
    const user = renderAt('/dossier/himass');
    const discussion = await screen.findByRole('region', { name: 'Tribunal discussion' });
    await within(discussion).findByText('esports-tribunal message 1');

    await user.click(within(discussion).getByRole('button', { name: 'Post message' }));
    expect(within(discussion).getByText('Author is required.')).toBeInTheDocument();
    expect(fetchMock.mock.calls.some(([, o]) => o?.method === 'POST')).toBe(false);

    await user.type(within(discussion).getByLabelText('Your name'), 'TanVuu');
    await user.type(within(discussion).getByLabelText('Message'), 'Hello tribunal');
    await user.click(within(discussion).getByRole('button', { name: 'Post message' }));

    expect(await within(discussion).findByText('Hello tribunal')).toBeInTheDocument();
    expect(within(discussion).getByRole('status')).toHaveTextContent('Message posted.');
  });

  test('d. appeal history lists existing appeals and refreshes after a submit', async () => {
    setupServer();
    const user = renderAt('/dossier/himass/appeal');
    const history = await screen.findByRole('region', { name: 'Appeal history' });
    expect(await within(history).findByText('Earlier appeal about the macro detection.')).toBeInTheDocument();

    await user.type(screen.getByLabelText('Email'), 'player@team.gg');
    await user.type(screen.getByLabelText('Confirm email'), 'player@team.gg');
    await user.selectOptions(screen.getByLabelText('Reason'), 'new-evidence');
    await user.type(screen.getByLabelText('Statement'), 'New replay footage clears the flagged input.');
    await user.click(screen.getByRole('button', { name: 'Submit appeal' }));

    expect(await within(history).findByText('New replay footage clears the flagged input.')).toBeInTheDocument();
    const items = within(history).getAllByRole('listitem');
    expect(items[0]).toHaveTextContent('New replay footage');
  });
});
