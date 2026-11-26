import { Router } from 'express';
import { Profile } from '../models/Profile.js';
import { Swipe } from '../models/Swipe.js';
import { validateSwipe } from '../../shared/swipeRules.js';

const DUPLICATE_KEY = 11000;
const clean = (value) => (typeof value === 'string' ? value.trim() : '');

export const swipesRouter = Router();

swipesRouter.get('/', async (req, res, next) => {
  try {
    const swipes = await Swipe.find()
      .sort({ createdAt: 1, _id: 1 }) // stable oldest-first order for the LIFO stack
      .select('-_id -__v')
      .lean()
      .exec();
    return res.json(swipes);
  } catch (err) {
    return next(err);
  }
});

swipesRouter.post('/', async (req, res, next) => {
  try {
    const body = req.body ?? {};

    // 1. Shared validation (parity with the client)
    const fields = validateSwipe(body);
    if (Object.keys(fields).length > 0) {
      return res.status(400).json({ error: 'Validation failed.', fields });
    }

    const profileId = clean(body.profileId);
    const direction = clean(body.direction);

    // 2. Profile must exist
    if (!(await Profile.exists({ id: profileId }).exec())) {
      return res.status(404).json({ error: 'Profile not found.' });
    }

    // 3. One swipe per profile
    if (await Swipe.exists({ profileId }).exec()) {
      return res.status(409).json({ error: 'Profile already swiped.' });
    }

    // 4. Persist whitelisted fields only
    const swipe = await Swipe.create({ profileId, direction });
    return res.status(201).json(swipe);
  } catch (err) {
    if (err.code === DUPLICATE_KEY) {
      return res.status(409).json({ error: 'Profile already swiped.' }); // concurrent duplicate
    }
    return next(err);
  }
});

swipesRouter.delete('/', async (req, res, next) => {
  try {
    await Swipe.deleteMany({}).exec();
    return res.status(204).end();
  } catch (err) {
    return next(err);
  }
});

swipesRouter.delete('/:id', async (req, res, next) => {
  try {
    const { deletedCount } = await Swipe.deleteOne({ id: req.params.id }).exec();
    if (deletedCount === 0) return res.status(404).json({ error: 'Swipe not found.' });
    return res.status(204).end();
  } catch (err) {
    return next(err);
  }
});
