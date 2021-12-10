const querystring = require("querystring");
const models = require("../models");

const { Account, UserData } = models;
// #region Login/Signup
/**
 *
 * @param {Request} req
 * @param {Response} res
 */
const loginPage		= (req, res) => {
	res.render("login", { csrfToken: req.csrfToken() });
};
// /**
//  *
//  * @param {Request} req
//  * @param {Response} res
//  */
// const signupPage	= (req, res) => {
//   res.render('signup', { csrfToken: req.csrfToken() });
// };
/**
 *
 * @param {Request} req
 * @param {Response} res
 */
const logout		= (req, res) => {
	req.session.destroy();
	res.redirect("/");
};
/**
 *
 * @param {Request} req
 * @param {Response} res
 */
const login			= (req, res) => {
	const username = `${req.body.username}`;
	const password = `${req.body.pass}`;

	if (!username || !password)
		return res.status(400).json({ error: "All fields are required" });

	return Account.AccountModel.authenticate(username, password, (err, account) => {
		if (err || !account)
			return res.status(401).json({ error: "Wrong username or password" });

		req.session.account = Account.AccountModel.toAPI(account);

		return res.json({ redirect: "/home" });
	});
};
/**
 *
 * @param {Request} req
 * @param {Response} res
 */
const signup		= (req, res) => {
	req.body.username = `${req.body.username}`;
	req.body.pass = `${req.body.pass}`;
	req.body.pass2 = `${req.body.pass2}`;

	if (!req.body.username || !req.body.pass || !req.body.pass2)
		return res.status(400).json({ error: "All fields are required" });

	if (req.body.pass !== req.body.pass2)
		return res.status(400).json({ error: "Passwords do not match" });

	return Account.AccountModel.generateHash(req.body.pass, (salt, hash) => {
		const accountData = {
			username : req.body.username,
			salt,
			password : hash,
		};

		const newAccount = new Account.AccountModel(accountData);

		const savePromise = newAccount.save();

		savePromise.then(() => {
			req.session.account = Account.AccountModel.toAPI(newAccount);
			return res.json({ redirect: "/home" });
		});

		savePromise.catch((err) => {
			console.log(err);

			if (err.code === 11000)
				return res.status(400).json({ error: "Username already in use." });

			return res.status(400).json({ error: "An error occurred." });
		});
	});
};
// #endregion

// #region Watchlist Management
/**
 *
 * @param {Request} req
 * @param {Response} res
 */
const makeNewWatchlist = (req, res) => {
	console.log("making new watchlist...");
	const watchlistData = {
		name        : "watchlist",
		createdData : Date.now(),
		owner       : req.session.account,
		list        : [],
	};

	const newWatchlist = new UserData.UserDataModel(watchlistData);
	return Account.AccountModel.findOneAndUpdate(
		{ username: req.session.account.username },
		{ watchlist: newWatchlist },
		(err, result) => {
			if (err) {
				console.log("Error in controllers/Account.js/addShowToWatchlist");
				console.log(err);
				return;
			}
			console.log(result);
			console.assert(result === result.watchlist);
			res.json({ redirect: "/home" });
		},
	);
	// return Account.AccountModel.findByUsername(req.session.account.username, (err, result) => {
	// 	if (err) {
	// 		console.log("Error in controllers/Account.js/addShowToWatchlist");
	// 		console.log(err);
	// 		return;
	// 	}
	// 	/**
	// 	 * @type {Array}
	// 	 */
	// 	console.log(result);
	// 	const watchlistData = {
	// 		name: 'watchlist',
	// 		createdData: Date.now(),
	// 		owner: req.session.account,
	// 		list: [],
	// 	};

	// 	const newWatchlist = new UserData.UserDataModel(watchlistData);
	// 	// result.watchlist = new UserData.UserDataModel(watchlistData);

	// 	// const watchlistPromise = result.set(new UserData.UserDataModel(watchlistData));
	// 	// newWatchlist.save();
	// 	const watchlistPromise = result.findOneAndUpdate({watchlist: undefined}, newWatchlist);

	// 	watchlistPromise.then((savedResult) => {
	// 		console.log(savedResult);
	// 		console.assert(savedResult === result.watchlist);
	// 		res.json({ redirect: '/home' });
	// 	});

	// 	watchlistPromise.catch((err) => {
	// 		console.log(err);
	// 		if (err.code === 11000) {
	// 			return res.status(400).json({ error: 'Watchlist already exists.' });
	// 		}
	// 		return res.status(400).json({ error: 'An error occurred.' });
	// 	});

	// 	return watchlistPromise;
	// 	/*
	// 	const currWatchlist = result.get('watchlist');
	// 	if (!currWatchlist.includes((req.body.showID) ? req.body.showID : params.showID)) {
	// 		result.set(
	//			'watchlist',
	//			currWatchlist.push((req.body.showID) ? req.body.showID : params.showID));
	// 		const promise = result.save();
	// 		promise.then((savedResult) => {
	// 			console.log(savedResult);
	// 			console.assert(result === savedResult);
	// 			res.json({redirect: '/home'});
	// 		});
	// 		promise.catch((err) => {
	// 			console.log(err);
	// 			if (err.code === 11000) {
	// 				return res.status(400).json({ error: 'Domo already exists.' });
	// 			}
	// 			return res.status(400).json({ error: 'An error occurred.' });
	// 			});
	// 	}
	// 	*/
	// });
};

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
const addShowToWatchlist = (req, res) => {
	console.log("Adding to watchlist...");
	console.log(req.session);
	const params = querystring.parse(req.url.substring(req.url.indexOf("?") + 1));
	if (!req.body.showID && !params.showID)
		return res.status(400).json({ error: "Show ID is required." });

	return Account.AccountModel.findByUsername(req.session.account.username, (err, result) => {
		if (err) {
			console.log("Error in controllers/Account.js/addShowToWatchlist");
			console.log(err);
			return res.status(400).json({ err });
		}
		console.log("Account");
		console.log(result);
		const accountList = result.get("watchlist");
		if (accountList === {} || !accountList || !accountList.list)
			return makeNewWatchlist(req, res);
		const currWatchlist = result.get("watchlist").list;
		console.log("currWatchlist");
		console.log(currWatchlist);
		console.assert(
			!currWatchlist.includes(
				(req.body.showID)
					? req.body.showID
					: params.showID,
			),
			"currWatchlist.includes((req.body.showID) ? req.body.showID : params.showID)",
		);
		if (!currWatchlist.includes((req.body.showID) ? req.body.showID : params.showID)) {
			console.assert(currWatchlist === result.get("watchlist").list);
			currWatchlist.push((req.body.showID) ? req.body.showID : params.showID);
			accountList.set("list", currWatchlist);
			result.set("watchlist", accountList);
			const promise = result.save();
			promise.then((savedResult) => {
				console.log("currWatchlist");
				console.log(currWatchlist);
				console.log("savedResult");
				console.log(savedResult);
				console.assert(result === savedResult, "Result!=savedResult");
				console.assert(currWatchlist === savedResult.get("watchlist").list, "currWatchlist!=savedResult.watchlist.list");
				console.log("Adding to watchlist Successfully completed");
				return res.json({ redirect: "/home" });
			});
			promise.catch((err2) => {
				console.log(err2);
				if (err2.code === 11000) {
					console.log("Adding to watchlist failed");
					return res.status(400).json({ error: "Show already exists." });
				}
				return res.status(400).json({ error: "An error occurred." });
			});
			return promise;
		}

		console.log("Show in watchlist");
		return res.status(400).json({ error: "Show already in watchlist." });
	});
};
/**
 *
 * @param {Request} req
 * @param {Response} res
 */
const removeShowFromWatchlist = (req, res) => {
	console.log("Removing from watchlist...");
	console.log(req.session);
	const params = querystring.parse(req.url.substring(req.url.indexOf("?") + 1));
	if (!req.body.showID && !params.showID)
		return res.status(400).json({ error: "Show ID is required." });

	return Account.AccountModel.findByUsername(req.session.account.username, (err, result) => {
		if (err) {
			console.log("Error in controllers/Account.js/removeShowFromWatchlist");
			console.log(err);
			return res.status(400).json({ err });
		}
		console.log("Account");
		console.log(result);
		const accountList = result.get("watchlist");
		if (accountList === {} || !accountList || !accountList.list)
			return makeNewWatchlist(req, res);
		let currWatchlist = result.get("watchlist").list;
		console.log("currWatchlist");
		console.log(currWatchlist);
		console.assert(currWatchlist.includes((req.body.showID) ? req.body.showID : params.showID), "!currWatchlist.includes((req.body.showID) ? req.body.showID : params.showID)");
		if (currWatchlist.includes((req.body.showID) ? req.body.showID : params.showID)) {
			// console.assert(currWatchlist === result.get("watchlist").list);
			currWatchlist = currWatchlist.filter(
				(elem) => elem !== ((req.body.showID) // !== might cause problems
					? req.body.showID
					: params.showID),
			);
			accountList.set("list", currWatchlist);
			result.set("watchlist", accountList);
			const promise = result.save();
			promise.then((savedResult) => {
				console.log("currWatchlist");
				console.log(currWatchlist);
				console.log("savedResult");
				console.log(savedResult);
				console.assert(result === savedResult, "Result!=savedResult");
				console.log("Removing from watchlist Successfully completed");
				return res.json({ redirect: "/home" });
			});
			promise.catch((err2) => {
				console.log(err2);
				if (err2.code === 11000) {
					console.log("Adding to watchlist failed");
					return res.status(400).json({ error: "Domo already exists." });
				}
				return res.status(400).json({ error: "An error occurred." });
			});
			return promise;
		}

		console.log("Show in watchlist");
		return res.status(400).json({ error: "Show already in watchlist." });
	});
};
/**
 *
 * @param {Request} req
 * @param {Response} res
 */
const getWatchlist = (req, res) => {
	console.log("Getting watchlist...");
	return Account.AccountModel.findByUsername(req.session.account.username, (err, docs) => {
		if (err) {
			console.log(err);
			return res.status(400).json({ error: "An error occurred (no, really)" });
		}
		if (!docs.watchlist)
			return makeNewWatchlist(req, res);
		return res.json({ watchlist: docs.watchlist });
	});
};

//  const renderWatchlist = (req, res) => {
// 	console.log("Rendering watchlist...");
// 	return Account.AccountModel.findByUsername(req.session.account.username, (err, docs) => {
// 		if (err) {
// 			console.log(err);
// 			return res.status(400).json({error:'An error occurred (no, really)'});
// 		}
// 		if (!docs.watchlist)
// 			return makeNewWatchlist(req, res);
// 		return res.json({ redirect: "/home" });
// 	});
//  };
// #endregion

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
const getToken = (req, res) => {
	const csrfJSON = {
		csrfToken : req.csrfToken(),
	};

	res.json(csrfJSON);
};

module.exports = {
	loginPage,
	login,
	logout,
	signup,
	getToken,
	addShowToWatchlist,
	removeShowFromWatchlist,
	getWatchlist,
};
// module.exports.loginPage			= loginPage;
// module.exports.login				= login;
// module.exports.logout				= logout;
// module.exports.signup				= signup;
// module.exports.getToken				= getToken;
// module.exports.addShowToWatchlist 	= addShowToWatchlist;
// // module.exports.signupPage		= signupPage;
