import { Router } from 'express';
import { Appeal } from '../models/Appeal.js';
import { findPlayer } from '../../shared/players.js';
import { validateAppeal } from '../../shared/validateAppeal.js';

const clean = (value) => (typeof value === 'string' ? value.trim() : '');

export const appealsRouter = Router();

appealsRouter.get('/:playerId', async (req, res, next) => {
  try {
    const player = findPlayer(req.params.playerId);
    if (!player) return res.status(404).json({ error: 'Player not found.' });

    const appeals = await Appeal.find({ playerId: player.id })
      .select('-email')
      .sort({ createdAt: -1 })
      .exec();
    return res.json(appeals);
  } catch (err) {
    return next(err);
  }
});

appealsRouter.post('/', async (req, res, next) => {
  try {
    const body = req.body ?? {};

    // 1. Player must exist
    const player = findPlayer(clean(body.playerId));
    if (!player) return res.status(404).json({ error: 'Player not found.' });

    // 2. Shared validation (parity with the client)
    const fields = validateAppeal(body);
    if (Object.keys(fields).length > 0) {
      return res.status(400).json({ error: 'Validation failed.', fields });
    }

    // 3. Deadline enforced with the server clock
    if (Date.now() >= Date.parse(player.appealDeadline)) {
      return res.status(409).json({ error: 'The appeal window has closed.' });
    }

    // 4. Persist whitelisted fields only (no ...req.body)
    const appeal = await Appeal.create({
      playerId: player.id,
      matchId: clean(body.matchId),
      email: clean(body.email),
      reason: clean(body.reason),
      statement: clean(body.statement),
      evidenceUrl: clean(body.evidenceUrl),
    });
    return res.status(201).json(appeal);
  } catch (err) {
    return next(err);
  }
});
