import mongoose from 'mongoose';

export const CHANNELS = ['nasa', 'esports-tribunal', 'notNasa'];

const messageSchema = new mongoose.Schema(
  {
    channelId: { type: String, required: true, enum: CHANNELS, index: true },
    author: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
    text: { type: String, required: true, trim: true, minlength: 1, maxlength: 500 },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: {
      versionKey: false,
      transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        return ret;
      },
    },
  },
);

export const Message = mongoose.model('Message', messageSchema);
