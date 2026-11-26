import { Router } from 'express';
import { Profile } from '../models/Profile.js';

export const profilesRouter = Router();

profilesRouter.get('/', async (req, res, next) => {
  try {
    const profiles = await Profile.find()
      .sort({ order: 1 })
      .select('-_id -__v') // .lean() skips toJSON, so hide internals here
      .lean()
      .exec();
    return res.json(profiles);
  } catch (err) {
    return next(err);
  }
});
