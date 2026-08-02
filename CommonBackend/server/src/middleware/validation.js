const Joi = require('joi');

const validate = (schema, source = 'body') => (req, res, next) => {
  const target = req[source];

  if (!schema) {
    return next();
  }

  const { error, value } = schema.validate(target, {
    abortEarly: false,
    allowUnknown: false,
  });

  if (error) {
    const details = error.details.map((detail) => detail.message);
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: details,
    });
  }

  req[source] = value;
  return next();
};

const createValidationSchemas = () => ({
  register: Joi.object({
    name: Joi.string().trim().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  }),
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
  forgotPassword: Joi.object({
    email: Joi.string().email().required(),
  }),
  resetPassword: Joi.object({
    token: Joi.string().required(),
    newPassword: Joi.string().min(6).required(),
  }),
  changePassword: Joi.object({
    oldPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).required(),
  }),
});

module.exports = {
  validate,
  createValidationSchemas,
};
