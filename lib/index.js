module.exports = function (mongoose, {
	mongooseObjectIdJoiName = 'mongooseObjectId'
} = {}) {

	const MONGOOSE_OBJECTID = mongoose.SchemaTypes.ObjectId,
		MONGODB_OBJECTID = mongoose.mongo.ObjectID,
		MONGOOSE_MODEL = mongoose.Model;

	function mongooseInstanceofGetter(value) {
		if(typeof value === 'string'){
			return 'string';
		}
		if(value instanceof MONGOOSE_OBJECTID || value instanceof MONGODB_OBJECTID){
			return 'mongoose-oid';
		}
		if(value instanceof MONGOOSE_MODEL){
			return 'mongoose-model';
		}
		return 'unknown';
	}

	function objectIdStringExtractor(value) {
		switch (mongooseInstanceofGetter(value)) {
		case 'string':
			return value;
		case 'mongoose-oid':
			return value.toString();
		case 'mongoose-model':
			return (mongooseInstanceofGetter(value._id) == 'mongoose-oid') ? value._id.toString() : (typeof value.id === 'string') ? value.id : undefined;
		default:
			return undefined;
		}
	}

	return [
		joi => {
			const BASE = joi.string().hex().length(24);
			return {
				name: mongooseObjectIdJoiName,
	
				//! Do not remove unused function params
				coerce: function (value, state, options) {
					return objectIdStringExtractor(value);
				},
	
				base: BASE,
	
				language: {
					sameId: 'ObjectId diferente do informado',
					sameArray: 'ObjectId diferente dos informados'
				},
	
				rules: [{
					name: 'same',

					params: {
						toCompare: joi.alternatives(
							joi.object().type(MONGOOSE_OBJECTID),
							joi.object().type(MONGODB_OBJECTID),
							joi.object().type(MONGOOSE_MODEL),
							BASE,
							joi.array().items(joi.alternatives(
								joi.object().type(MONGOOSE_OBJECTID),
								joi.object().type(MONGODB_OBJECTID),
								joi.object().type(MONGOOSE_MODEL),
								BASE
							))
						)
					},

					validate: function (params, value, state, options) {
						if(Array.isArray(params.toCompare)){
							let castedArray = params.toCompare.map(element => objectIdStringExtractor(element));
							if(castedArray.includes(value)){
								return value;
							} else {
								return this.createError('oid.sameArray', {
									v: value
								}, state, options);
							}
						} else if(objectIdStringExtractor(params.toCompare) == value){
							return value;
						} else {
							return this.createError('oid.sameId', {
								v: value
							}, state, options);
						}
					}
				}]	
			};
		}
	];
};