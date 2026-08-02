const Joi = require('joi');

const createResourceSchema = Joi.object({
  name: Joi.string().trim().min(1).required(),
});

module.exports = {
  createResourceSchema,
};
