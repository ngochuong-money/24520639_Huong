import { Router } from 'express';
import { Message, CHANNELS } from '../models/Message.js';
import { validateMessage } from '../validation.js';

const router = Router();

function checkChannel(req, res, next) {
  if (!CHANNELS.includes(req.params.channelId)) {
    return res.status(400).json({ error: 'Unknown channel' });
  }
  next();
}

router.get('/:channelId/messages', checkChannel, async (req, res) => {
  try {
    const messages = await Message.find({ channelId: req.params.channelId })
      .sort({ createdAt: 1 })
      .exec();
    res.status(200).json(messages);
  } catch (err) {
    console.error('GET messages failed:', err?.message ?? String(err));
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/:channelId/messages', checkChannel, async (req, res) => {
  try {
    if (!req.is('application/json')) {
      return res
        .status(415)
        .json({ error: 'Content-Type must be application/json' });
    }
    const { details, value } = validateMessage(req.body);
    if (Object.keys(details).length > 0) {
      return res.status(400).json({ error: 'Validation failed', details });
    }
    const created = await Message.create({
      channelId: req.params.channelId,
      ...value,
    });
    res.status(201).json(created);
  } catch (err) {
    console.error('POST messages failed:', err?.message ?? String(err));
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
