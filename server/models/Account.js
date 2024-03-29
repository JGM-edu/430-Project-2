const crypto = require("crypto");
const mongoose = require("mongoose");
const { UserDataSchema } = require("./UserData");

mongoose.Promise = global.Promise;

/**
 * @type {mongoose.Model<Document, {}>}
 */
let AccountModel = {};
const iterations = 10000;
const saltLength = 64;
const keyLength = 64;

const AccountSchema = new mongoose.Schema({
	username : {
    	type     : String,
    	required : true,
    	trim     : true,
    	match    : /^[A-Za-z0-9_\-.]{1,16}$/,
	},
	salt : {
		type     : Buffer,
		required : true,
	},
	password : {
		type     : String,
		required : true,
	},
	createdDate : {
		type    : Date,
		default : Date.now,
	},
	watchlist : {
		type    : UserDataSchema,
		default : {},
	},
});

AccountSchema.statics.toAPI = (doc) => ({
	// _id is built into your mongo document and is guaranteed to be unique
	_id       :	doc._id,
	username  :	doc.username,
	watchlist :	doc.watchlist,
});

const validatePassword = (doc, password, callback) => {
	const pass = doc.password;

	return crypto.pbkdf2(password, doc.salt, iterations, keyLength, "RSA-SHA512", (err, hash) => {
		if (hash.toString("hex") !== pass)
			return callback(false);

		return callback(true);
	});
};

AccountSchema.statics.findByUsername = (name, callback) => {
	const search = {
		username : name,
	};
	return AccountModel.findOne(search, callback);
};

AccountSchema.statics.generateHash = (password, callback) => {
	const salt = crypto.randomBytes(saltLength);

	crypto.pbkdf2(
		password,
		salt,
		iterations,
		keyLength,
		"RSA-SHA512",
		(err, hash) => callback(salt, hash.toString("hex")),
	);
};

/**
 * Attempts to authenticate the given user and password.
 * @param {string} username The username
 * @param {string} password
 * @param {Function} callback
 */
AccountSchema.statics.authenticate = (username, password, callback) => {
	AccountModel.findByUsername(username, (err, doc) => {
		if (err)
			return callback(err);
		if (!doc)
			return callback();
		return validatePassword(doc, password, (result) => {
			if (result === true)
				return callback(null, doc);
			return callback();
		});
	});
};

AccountModel = mongoose.model("Account", AccountSchema);

module.exports = {
	AccountModel,
	AccountSchema,
};
