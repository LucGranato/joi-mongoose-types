'use strict';

const Joi = require('@hapi/joi');
const assert = require('assert');
const mongoose = require('mongoose');
const JoiMongooseExtension = require('../joi-mongoose-types');

const carSchema = new mongoose.Schema({
  model: String,
});
const Car = mongoose.model('car', carSchema);
const van = new Car({
  model: 'van',
});

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  father: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'person',
    required: false,
  },
});
const Person = mongoose.model('person', personSchema);

const father = new Person({
  name: 'Darth Vader',
});

const soon = new Person({
  name: 'Luke',
  father,
});

const joi = Joi.extend(
  JoiMongooseExtension(Joi, mongoose, {
    mongooseObjectIdJoiName: 'oid',
    mongooseDocumentJoiName: 'doc',
  }),
);

function assertPersonDocument(someone) {
  assert.ok(someone instanceof mongoose.Model);
  assert.ok(someone instanceof Person);
  return someone;
}

describe('Joi extension (joi-mongoose) test', () => {
  it('Apply Joi extension', () => {
    assert.ok(
      typeof joi.oid == 'function',
      'Didnt added new mongoose ObjectId validation',
    );
    assert.ok(
      typeof joi.doc == 'function',
      'Didnt added new mongoose document validation',
    );
  });

  describe('ObjectId', () => {
    describe('Type validation', () => {
      it('From _id', () => {
        assertPersonDocument(father);
        assert.ok(father._id instanceof mongoose.mongo.ObjectID);
        const id = joi.attempt(father._id, joi.oid().required());
        assert.equal(typeof id, 'string');
        assert.equal(id, father._id.toString());
      });
      it('From id', () => {
        assertPersonDocument(father);
        assert.equal(typeof father.id, 'string');
        const id = joi.attempt(father.id, joi.oid().required());
        assert.equal(typeof id, 'string');
        assert.equal(id, father.id);
      });
      it('From document', () => {
        assertPersonDocument(father);
        const id = joi.attempt(father, joi.oid().required());
        assert.equal(typeof id, 'string');
        assert.equal(id, father.id);
      });
      it('Optional', () => {
        const nothing = joi.assert(undefined, joi.oid().optional());
        assert.equal(nothing, undefined);
      });
    });

    describe('Same _id', () => {
      it('With equal _id', () => {
        assert.ok(father._id instanceof mongoose.mongo.ObjectID);
        joi.assert(
          father._id,
          joi
            .oid()
            .required()
            .same(father._id),
        );
        joi.assert(
          father._id,
          joi
            .oid()
            .required()
            .same([father._id, soon._id]),
        );
        assert.throws(() => {
          joi.assert(
            father._id,
            joi
              .oid()
              .required()
              .same(soon._id),
          );
        });
      });
      it('With equal id', () => {
        assert.ok(father._id instanceof mongoose.mongo.ObjectID);
        assert.ok(typeof father.id === 'string');
        joi.assert(
          father._id,
          joi
            .oid()
            .required()
            .same(father.id),
        );
        joi.assert(
          father._id,
          joi
            .oid()
            .required()
            .same([father.id, soon.id]),
        );
        assert.throws(() => {
          joi.assert(
            father._id,
            joi
              .oid()
              .required()
              .same(soon.id),
          );
        });
      });
      it('With equal document', () => {
        assert.ok(father instanceof mongoose.Model);
        assert.ok(father._id instanceof mongoose.mongo.ObjectID);
        joi.assert(
          father._id,
          joi
            .oid()
            .required()
            .same(father),
        );
        joi.assert(
          father._id,
          joi
            .oid()
            .required()
            .same([father, soon]),
        );
        assert.throws(() => {
          joi.assert(
            father._id,
            joi
              .oid()
              .required()
              .same(soon),
          );
        });
      });
    });

    describe('Same id', () => {
      it('With equal _id', () => {
        assert.ok(father._id instanceof mongoose.mongo.ObjectID);
        assert.ok(typeof father.id === 'string');
        joi.assert(
          father.id,
          joi
            .oid()
            .required()
            .same(father._id),
        );
        joi.assert(
          father.id,
          joi
            .oid()
            .required()
            .same([father._id, soon._id]),
        );
        assert.throws(() => {
          joi.assert(
            father.id,
            joi
              .oid()
              .required()
              .same(soon._id),
          );
        });
      });
      it('With equal id', () => {
        assert.ok(typeof father.id === 'string');
        joi.assert(
          father.id,
          joi
            .oid()
            .required()
            .same(father.id),
        );
        joi.assert(
          father.id,
          joi
            .oid()
            .required()
            .same([father.id, soon.id]),
        );
        assert.throws(() => {
          joi.assert(
            father.id,
            joi
              .oid()
              .required()
              .same(soon.id),
          );
        });
      });
      it('With equal document', () => {
        assert.ok(father instanceof mongoose.Model);
        assert.ok(typeof father.id === 'string');
        joi.assert(
          father.id,
          joi
            .oid()
            .required()
            .same(father),
        );
        joi.assert(
          father.id,
          joi
            .oid()
            .required()
            .same([father, soon]),
        );
        assert.throws(() => {
          joi.assert(
            father.id,
            joi
              .oid()
              .required()
              .same(soon),
          );
        });
      });
    });

    describe('Same document', () => {
      it('With equal _id', () => {
        assert.ok(father instanceof mongoose.Model);
        assert.ok(father._id instanceof mongoose.mongo.ObjectID);
        joi.assert(
          father,
          joi
            .oid()
            .required()
            .same(father._id),
        );
        joi.assert(
          father,
          joi
            .oid()
            .required()
            .same([father._id, soon._id]),
        );
        assert.throws(() => {
          joi.assert(
            father,
            joi
              .oid()
              .required()
              .same(soon._id),
          );
        });
      });
      it('With equal id', () => {
        assert.ok(father instanceof mongoose.Model);
        assert.ok(typeof father.id === 'string');
        joi.assert(
          father,
          joi
            .oid()
            .required()
            .same(father.id),
        );
        joi.assert(
          father,
          joi
            .oid()
            .required()
            .same([father.id, soon.id]),
        );
        assert.throws(() => {
          joi.assert(
            father,
            joi
              .oid()
              .required()
              .same(soon.id),
          );
        });
      });
      it('With equal document', () => {
        assert.ok(father instanceof mongoose.Model);
        joi.assert(
          father,
          joi
            .oid()
            .required()
            .same(father),
        );
        joi.assert(
          father,
          joi
            .oid()
            .required()
            .same([father, soon]),
        );
        assert.throws(() => {
          joi.assert(
            father,
            joi
              .oid()
              .required()
              .same(soon),
          );
        });
      });
    });
  });

  describe('Model', () => {
    describe('Type validation', () => {
      it('Generic model', () => {
        assertPersonDocument(father);
        const output = joi.attempt(father, joi.doc().required());
        assertPersonDocument(output);
      });
      it('Model string', () => {
        assertPersonDocument(father);
        const output = joi.attempt(
          father,
          joi
            .doc()
            .model('person')
            .required(),
        );
        assertPersonDocument(output);
        assert.throws(() => {
          joi.assert(
            father,
            joi
              .doc()
              .model('car')
              .required(),
          );
        });
      });
      it('Model from other document', () => {
        assertPersonDocument(father);
        const output = joi.attempt(
          father,
          joi
            .doc()
            .model(father)
            .required(),
        );
        assertPersonDocument(output);
        assert.throws(() => {
          joi.assert(
            father,
            joi
              .doc()
              .model(van)
              .required(),
          );
        });
      });
      it('Model class', () => {
        assertPersonDocument(father);
        const output = joi.attempt(
          father,
          joi
            .doc()
            .model(Person)
            .required(),
        );
        assertPersonDocument(output);
        assert.throws(() => {
          joi.assert(
            father,
            joi
              .doc()
              .model(Car)
              .required(),
          );
        });
      });
    });
  });
});
