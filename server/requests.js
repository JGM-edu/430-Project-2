const querystring = require("querystring");
const { MovieDb } = require("moviedb-promise");

const movieDB = new MovieDb("2a754f088ef59f91e84eb01edb195ee0");

const parseQuerystring = (req) => querystring.parse(req.url.substring(req.url.indexOf("?") + 1));

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
const searchShows = (req, res) => {
	// tmdbv3.search
	// console.log(`requests.js.searchShows: req.body = ${req.body}`);
	// console.log(req.body);
	// console.log(`requests.js.searchShows: req.url = ${req.url}`);
	const params = querystring.parse(req.url.substring(req.url.indexOf("?") + 1));
	// console.assert(req.body['query']);
	// console.log(params);
	const promise = movieDB.searchTv({ query: params.query });
	promise.then((e) => {
		console.log("searchShows success!");
		// console.log(e.results);
		return res.status(200).json(e);
		// return e.results;
		// return res.render('app', { csrfToken: req.csrfToken(), watchlist: e.results });
	}, (e) => {
		console.log(`search Shows Error Caught${e?.message}`);
		// console.log(e);
		return res.status(400).json({ error: "Some error" });
	});
	// promise.finally((e) => {
	// 	console.log("success! in finally");
	// 	console.log(e);
	// 	// console.log(e.results);
	// 	res.render('app', { csrfToken: req.csrfToken(), watchlist: e.results });
	// });
	return promise;
};

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
const getShow = (req, res) => {
	const params = parseQuerystring(req);
	const promise = movieDB.tvInfo((params.id) ? params.id : params.showID);
	promise.then((e) => {
		console.log("getShow success!");
		// console.log(e.results);
		return res.status(200).json(e);
		// return e.results;
		// return res.render('app', { csrfToken: req.csrfToken(), watchlist: e.results });
	}, (e) => {
		console.log("getShow Error Caught");
		console.log(e);
		return res.status(400).json({ error: "Some error" });
	});
};

// /**
//  *
//  * @param {Request} req
//  * @param {Response} res
//  */
// const getShowsFromIDs = (req, res) => {

// };

// /**
//  *
//  * @param {Number} id The show's id in the movie database.
//  */
// const queryShowByID = (id) => {
// // TODO: THIS
// // TODO: ADD CALLBACK AS PARAMS
// };

module.exports = {
	searchShows,
	getShow,
};
