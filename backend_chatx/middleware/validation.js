import Joi from 'joi';

export const messageValidation = {
  create: Joi.object({
    message: Joi.string().required().min(1).max(1000).trim(),
    user: Joi.string().required().min(1).max(50).trim(),
    room: Joi.string().optional().max(50).trim()
  }),

  query: Joi.object({
    limit: Joi.number().integer().min(1).max(100).default(50),
    skip: Joi.number().integer().min(0).default(0),
    room: Joi.string().optional().max(50).trim()
  })
};

export const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body);
    
    if (error) {
      const validationError = new Error(error.details[0].message);
      validationError.isJoi = true;
      validationError.details = error.details;
      return next(validationError);
    }
    
    req.validatedData = value;
    next();
  };
};
