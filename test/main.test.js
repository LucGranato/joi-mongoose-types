const assert = require('assert'),
	mongoose = require('mongoose'),
	Joi = require('joi'),
	JoiMongooseExtension = require('../index');

describe('Joi extension (joi-mongoose) test', function(){

	before(function () {
		this.personSchema = new mongoose.Schema({
			name: {
				type: String,
				required: true
			},
			father: {
				type: mongoose.SchemaTypes.ObjectId,
				ref: 'person',
				required: false
			}
		});
		this.personModel = mongoose.model('person', this.personSchema);

		this.father = new this.personModel({
			name: 'Darth Vader'
		});

		this.soon = new this.personModel({
			name: 'Luke',
			father: this.father
		});
	});

	it('Apply Joi extension', function () {
		this.joi = Joi.extend(JoiMongooseExtension(mongoose, {
			mongooseObjectIdJoiName: 'oid',
			mongooseDocumentJoiName: 'doc'
		}));
		assert.ok(typeof this.joi.oid == 'function', 'Didnt added new mongoose ObjectId validation');
		assert.ok(typeof this.joi.doc == 'function', 'Didnt added new mongoose document validation');
	});

	// ========================================= VALIDATION =========================================
	it('Mongoose ObjectId validation from _id', function () {
		assert.ok(this.father._id instanceof mongoose.mongo.ObjectID);
		this.joi.assert(
			this.father._id,
			this.joi.oid().required()
		);
	});
	it('Mongoose ObjectId validation from id', function () {
		assert.ok(typeof this.father.id === 'string');
		this.joi.assert(
			this.father.id,
			this.joi.oid().required()
		);
	});
	it('Mongoose ObjectId validation from document', function () {
		assert.ok(this.father instanceof mongoose.Model);
		this.joi.validate(
			this.father,
			this.joi.oid().required()
		);
	});
	it('Mongoose ObjectId optional validation', function () {
		this.joi.assert(
			undefined,
			this.joi.oid().optional()
		);
		assert.ok(this.father._id instanceof mongoose.mongo.ObjectID);
		this.joi.assert(
			this.father._id,
			this.joi.oid().optional()
		);
	});
	// ========================================= VALIDATION =========================================

	// ========================================= COMPARE _ID ========================================
	it('Mongoose ObjectId compare _id with same _id', function () {
		assert.ok(this.father._id instanceof mongoose.mongo.ObjectID);
		this.joi.assert(
			this.father._id,
			this.joi.oid().required().same(this.father._id)
		);
		this.joi.assert(
			this.father._id,
			this.joi.oid().required().same([this.father._id])
		);
	});
	it('Mongoose ObjectId compare _id with same id', function () {
		assert.ok(this.father._id instanceof mongoose.mongo.ObjectID);
		assert.ok(typeof this.father.id === 'string');
		this.joi.assert(
			this.father._id,
			this.joi.oid().required().same(this.father.id)
		);
		this.joi.assert(
			this.father._id,
			this.joi.oid().required().same([this.father.id])
		);
	});
	it('Mongoose ObjectId compare _id with same document', function () {
		assert.ok(this.father instanceof mongoose.Model);
		assert.ok(this.father._id instanceof mongoose.mongo.ObjectID);
		this.joi.assert(
			this.father._id,
			this.joi.oid().required().same(this.father)
		);
		this.joi.assert(
			this.father._id,
			this.joi.oid().required().same([this.father])
		);
	});
	// ========================================= COMPARE _ID ========================================

	// ========================================= COMPARE ID =========================================
	it('Mongoose ObjectId compare id with same _id', function () {
		assert.ok(this.father._id instanceof mongoose.mongo.ObjectID);
		assert.ok(typeof this.father.id === 'string');
		this.joi.assert(
			this.father.id,
			this.joi.oid().required().same(this.father._id)
		);
		this.joi.assert(
			this.father.id,
			this.joi.oid().required().same([this.father._id])
		);
	});
	it('Mongoose ObjectId compare id with same id', function () {
		assert.ok(typeof this.father.id === 'string');
		this.joi.assert(
			this.father.id,
			this.joi.oid().required().same(this.father.id)
		);
		this.joi.assert(
			this.father.id,
			this.joi.oid().required().same([this.father.id])
		);
	});
	it('Mongoose ObjectId compare id with same document', function () {
		assert.ok(this.father instanceof mongoose.Model);
		assert.ok(typeof this.father.id === 'string');
		this.joi.assert(
			this.father.id,
			this.joi.oid().required().same(this.father)
		);
		this.joi.assert(
			this.father.id,
			this.joi.oid().required().same([this.father])
		);
	});
	// ========================================= COMPARE ID =========================================

	// ========================================= COMPARE MODEL ======================================
	it('Mongoose ObjectId compare document with same _id', function () {
		assert.ok(this.father instanceof mongoose.Model);
		assert.ok(this.father._id instanceof mongoose.mongo.ObjectID);
		this.joi.assert(
			this.father,
			this.joi.oid().required().same(this.father._id)
		);
		this.joi.assert(
			this.father,
			this.joi.oid().required().same([this.father._id])
		);
	});
	it('Mongoose ObjectId compare document with same id', function () {
		assert.ok(this.father instanceof mongoose.Model);
		assert.ok(typeof this.father.id === 'string');
		this.joi.assert(
			this.father,
			this.joi.oid().required().same(this.father.id)
		);
		this.joi.assert(
			this.father,
			this.joi.oid().required().same([this.father.id])
		);
	});
	it('Mongoose ObjectId compare document with same document', function () {
		assert.ok(this.father instanceof mongoose.Model);
		this.joi.assert(
			this.father,
			this.joi.oid().required().same(this.father)
		);
		this.joi.assert(
			this.father,
			this.joi.oid().required().same([this.father])
		);
	});
	// ========================================= COMPARE MODEL ======================================

});