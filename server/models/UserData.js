const mongoose = require("mongoose");

mongoose.Promise = global.Promise;
const _ = require("underscore");

/**
 * Model for user information, specifically lists.
 * @type {mongoose.Model}
 */
let UserDataModel = {};

const convertId = mongoose.Types.ObjectId;
const setName = (name) => _.escape(name).trim();

/**
 * Schema for user information, specifically lists.
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
		default  : [],
	},
	owner : {
		type : mongoose.Schema.ObjectId,
		ref  : "Account",
	},
	createdData : {
		type    : Date,
		default : Date.now,
	},
});

UserDataSchema.statics.toAPI = (doc) => ({
	name          : doc.name,
	list          : doc.list,
	owner         : doc.owner,
	createdDate   : doc.createdDate,
	madeWithTOAPI : true,
});

UserDataSchema.statics.findByOwner = (ownerId, callback) => {
	const search = { owner: convertId(ownerId) };
	return UserDataModel.find(search).select("list").lean().exec(callback);
};

UserDataModel = mongoose.model("UserData", UserDataSchema);

module.exports = {
	UserDataModel,
	UserDataSchema,
};
