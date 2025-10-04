import Joi from 'joi';

export const schemas = {
  emotionReading: Joi.object({
    emotions: Joi.object({
      happy: Joi.number().min(0).max(1),
      sad: Joi.number().min(0).max(1),
      angry: Joi.number().min(0).max(1),
      surprised: Joi.number().min(0).max(1),
      fearful: Joi.number().min(0).max(1),
      disgusted: Joi.number().min(0).max(1),
      neutral: Joi.number().min(0).max(1)
    }).required(),
    blinkCount: Joi.number().integer().min(0).default(0),
    sessionId: Joi.string().optional()
  }),

  userRegister: Joi.object({
    username: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
  }),

  userLogin: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  journalEntry: Joi.object({
    content: Joi.string().min(1).max(5000).required(),
    moodRating: Joi.number().integer().min(1).max(10).required(),
    tags: Joi.array().items(Joi.string()).optional()
  })
};

export function validate(schema, data) {
  const { error, value } = schema.validate(data);
  if (error) {
    throw new Error(error.details[0].message);
  }
  return value;
}
