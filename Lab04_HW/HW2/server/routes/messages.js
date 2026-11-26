import { Router } from 'express';
import { Message } from '../models/Message.js';
import { isChannel } from '../../shared/channels.js';
import { validateMessage } from '../../shared/validateMessage.js';

const PAGE_SIZE = 50;
const clean = (value) => (typeof value === 'string' ? value.trim() : '');

export const messagesRouter = Router();

messagesRouter.get('/:forum', async (req, res, next) => {
  try {
    const { forum } = req.params;
    if (!isChannel(forum)) return res.status(404).json({ error: 'Unknown channel.' });

    const latest = await Message.find({ forum }).sort({ createdAt: -1 }).limit(PAGE_SIZE).exec();
    return res.json(latest.toReversed()); // oldest first for display
  } catch (err) {
    return next(err);
  }
});

messagesRouter.post('/:forum', async (req, res, next) => {
  try {
    const { forum } = req.params;
    if (!isChannel(forum)) return res.status(404).json({ error: 'Unknown channel.' });

    const body = req.body ?? {};
    const fields = validateMessage(body);
    if (Object.keys(fields).length > 0) {
      return res.status(400).json({ error: 'Validation failed.', fields });
    }

    const message = await Message.create({ forum, author: clean(body.author), text: clean(body.text) });
    return res.status(201).json(message);
  } catch (err) {
    return next(err);
  }
});
