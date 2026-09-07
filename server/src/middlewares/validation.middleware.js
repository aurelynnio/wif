/**
 * Validation Middleware Factory
 * Create middleware to validate request body/params/query with Joi schema
 */

import ApiError from '../helpers/ApiError.js';

const VALIDATION_OPTIONS = {
  body: {
    abortEarly: false,
    stripUnknown: true,
  },
  params: {
    abortEarly: false,
  },
  query: {
    abortEarly: false,
    stripUnknown: true,
  },
};

const formatValidationDetails = (details, location) => {
  return details.map(detail => {
    const item = {
      field: detail.path.join('.'),
      message: detail.message,
    };

    if (location) {
      item.location = location;
    }

    return item;
  });
};

const validateSchemaPart = (schema, value, location) => {
  return schema.validate(value, VALIDATION_OPTIONS[location]);
};

const createValidationMiddleware = (location, errorMessage) => {
  return schema => {
    return (req, res, next) => {
      const { error, value } = validateSchemaPart(schema, req[location], location);

      if (error) {
        return next(
          ApiError.badRequest(errorMessage, {
            errorCode: 'VALIDATION_ERROR',
            details: formatValidationDetails(error.details),
          })
        );
      }

      req[location] = value;
      next();
    };
  };
};

/**
 * Validate request body
 * @param {Joi.Schema} schema - Joi schema for validation
 * @returns {Function} Express middleware
 */
export const validateBody = createValidationMiddleware('body', 'Invalid request body');


/**
 * Validate request params
 * @param {Joi.Schema} schema - Joi schema for validation
 * @returns {Function} Express middleware
 */
export const validateParams = createValidationMiddleware('params', 'Invalid request params');


/**
 * Validate request query
 * @param {Joi.Schema} schema - Joi schema for validation
 * @returns {Function} Express middleware
 */
export const validateQuery = createValidationMiddleware('query', 'Invalid request query');


/**
 * Validate multiple parts of request at once
 * @param {Object} schemas - Object containing schemas for body, params, query
 * @returns {Function} Express middleware
 */
export const validate = ({ body, params, query }) => {
  return (req, res, next) => {
    const errors = [];
    const schemas = { body, params, query };

    for (const [location, schema] of Object.entries(schemas)) {
      if (!schema) {
        continue;
      }

      const { error, value } = validateSchemaPart(schema, req[location], location);

      if (error) {
        errors.push(...formatValidationDetails(error.details, location));
        continue;
      }

      req[location] = value;
    }

    if (errors.length > 0) {
      return next(
        ApiError.badRequest('Invalid request data', {
          errorCode: 'VALIDATION_ERROR',
          details: errors,
        })
      );
    }

    next();
  };
};


export default {
  validateBody,
  validateParams,
  validateQuery,
  validate,
};
