const mongoose = require("mongoose");

mongoose.Promise = global.Promise;
const _ = require("underscore");

let UserDataModel = {};

const convertId = mongoose.Types.ObjectId;
const setName = (name) => _.escape(name).trim();

/**
 * @type {Schema}
 */
const UserDataSchema = new mongoose.Schema({
	name : {
		type     : String,
		required : true,
		trim     : true,
		set      : setName,
		default  : "watchlist",
	},
	list : {
		type     : Array,
		required : true,
		// of: String,
		default  : [],
	},
	owner : {
		type : mongoose.Schema.ObjectId,
		// required : true,
		ref  : "Account",
	},
	createdData : {
		type    : Date,
		default : Date.now,
	},
});

UserDataSchema.statics.toAPI = (doc) => ({
//   name: doc.name,
//   age: doc.age,
	name          : doc.name,
	list          : doc.list,
	owner         : doc.owner,
	createdDate   : doc.createdDate,
	madeWithTOAPI : true,
});

UserDataSchema.statics.findByOwner = (ownerId, callback) => {
	const search = {
		owner : convertId(ownerId),
	};
	return UserDataModel.find(search).select("list").lean().exec(callback);
};

// UserDataSchema.statics.

UserDataModel = mongoose.model("UserData", UserDataSchema);

module.exports.UserDataModel = UserDataModel;
/**
 * @type {Schema}
 */
module.exports.UserDataSchema = UserDataSchema;
