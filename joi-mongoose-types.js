'use strict';

/**
 * @module joi-mongoose-types
 */

function ensureArray(value) {
  return Array.isArray(value) ? value : [value];
}

/**
 * Extension options
 * @typedef {Object} ExtensionOptions
 * @property {string} mongooseObjectIdJoiName The name to be utilized for ObjectId validation on Joi
 * @property {string} mongooseDocumentJoiName The name to be utilized for Document validation on Joi
 */

/**
 * Creates an array for extend joi library with mongoose types
 * @param {*} joi Joi library
 * @param {*} mongoose  Mongoose library
 * @param {ExtensionOptions} options The extension options
 */
function joiMongooseTypes(
  joi,
  mongoose,
  {
    mongooseObjectIdJoiName = 'mongooseObjectId',
    mongooseDocumentJoiName = 'mongooseDocument',
  } = {},
) {
  const MONGOOSE_OBJECT_ID = mongoose.SchemaTypes.ObjectId;
  const MONGODB_OBJECT_ID = mongoose.mongo.ObjectID;
  const MONGOOSE_MODEL = mongoose.Model;

  const JOI_SCHEMA = {
    OBJECT_ID_STRING: joi
      .string()
      .hex()
      .length(24),
    MONGODB_OBJECT_ID_INSTANCE: joi.object().type(MONGODB_OBJECT_ID),
    MONGOOSE_OBJECT_ID_INSTANCE: joi.object().type(MONGOOSE_OBJECT_ID),
    MONGOOSE_MODEL: joi
      .func()
      .keys({
        base: joi
          .object()
          .equal(mongoose)
          .required(),
        modelName: joi.string().required(),
      })
      .unknown(),
    MONGOOSE_MODEL_INSTANCE: joi.object().type(MONGOOSE_MODEL),
    MONGOOSE_MODEL_NAME_STRING: joi.string(),
  };

  const ALTERNATIVES = {
    OBJECT_ID_COMPARATION: [
      JOI_SCHEMA.OBJECT_ID_STRING,
      JOI_SCHEMA.MONGODB_OBJECT_ID_INSTANCE,
      JOI_SCHEMA.MONGOOSE_OBJECT_ID_INSTANCE,
      JOI_SCHEMA.MONGOOSE_MODEL_INSTANCE,
    ],
    MODEL_COMPARATION: [
      JOI_SCHEMA.MONGOOSE_MODEL_NAME_STRING,
      JOI_SCHEMA.MONGOOSE_MODEL,
      JOI_SCHEMA.MONGOOSE_MODEL_INSTANCE,
    ],
  };

  function mongooseInstanceofGetter(value) {
    if (typeof value === 'string') {
      return 'string';
    }
    if (
      value instanceof MONGOOSE_OBJECT_ID ||
      value instanceof MONGODB_OBJECT_ID
    ) {
      return 'mongoose-oid';
    }
    if (value instanceof MONGOOSE_MODEL) {
      return 'mongoose-doc';
    }
    return 'unknown';
  }

  function objectIdStringExtractor(value) {
    switch (mongooseInstanceofGetter(value)) {
      case 'string':
        return value;
      case 'mongoose-oid':
        return value.toString();
      case 'mongoose-doc':
        return mongooseInstanceofGetter(value._id) === 'mongoose-oid'
          ? value._id.toString()
          : mongooseInstanceofGetter(value.id) === 'string'
          ? value.id
          : undefined;
      default:
        return undefined;
    }
  }

  return [
    {
      name: mongooseObjectIdJoiName,
      // eslint-disable-next-line no-unused-vars
      coerce(value, state, options) {
        return objectIdStringExtractor(value);
      },
      base: JOI_SCHEMA.OBJECT_ID_STRING,
      language: {
        sameId: 'Different ObjectId',
      },
      rules: [
        {
          name: 'same',
          params: {
            toCompare: joi.alternatives(
              ...ALTERNATIVES.OBJECT_ID_COMPARATION,
              joi
                .array()
                .items(joi.alternatives(...ALTERNATIVES.OBJECT_ID_COMPARATION)),
            ),
          },
          validate(params, value, state, options) {
            const comparisons = ensureArray(params.toCompare);
            const ids = comparisons.map(objectIdStringExtractor);
            if (ids.includes(value)) {
              return value;
            }
            return this.createError(
              `${mongooseObjectIdJoiName}.sameId`,
              {
                v: value,
              },
              state,
              options,
            );
          },
        },
      ],
    },
    {
      name: mongooseDocumentJoiName,
      base: JOI_SCHEMA.MONGOOSE_MODEL_INSTANCE,
      language: {
        sameId: 'ObjectId diferente do informado',
      },
      rules: [
        {
          name: 'model',
          params: {
            toCompare: joi.alternatives(
              ...ALTERNATIVES.MODEL_COMPARATION,
              joi
                .array()
                .items(joi.alternatives(...ALTERNATIVES.MODEL_COMPARATION)),
            ),
          },
          setup(params) {
            const comparisons = ensureArray(params.toCompare);
            const models = comparisons.map(model => {
              if (typeof model === 'string') {
                return joi.object().type(mongoose.model(model));
              }
              if (model instanceof MONGOOSE_MODEL) {
                return joi.object().type(model.constructor);
              }
              return joi.object().type(mongoose.model(model.modelName));
            });
            return joi.alternatives(...models);
          },
        },
      ],
    },
  ];
}

module.exports = joiMongooseTypes;
