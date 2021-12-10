const models = require("../models");

const { UserData } = models;

const searchShows = (req, res) => {
	const xhr = new XMLHttpRequest();

	xhr.open("GET", `https://api.themoviedb.org/3/search/tv?api_key=2a754f088ef59f91e84eb01edb195ee0&language=en-US&page=1&query=${req.body.query}&include_adult=true`);
	xhr.onload((/* e */) => res.render("app", { csrfToken: req.csrfToken(), watchlist: JSON.parse(xhr.responseText) }));
};

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
const watchlistPage = (req, res) => {
	UserData.UserDataModel.findByOwner(req.session.account._id, (err, docs) => {
		if (err) {
			console.log(err);
			return res.status(400).json({ error: "An error occurred." });
		}
		return res.render("app", { csrfToken: req.csrfToken(), watchlist: docs });
	});
};

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
const getShows = (req, res) => UserData.UserDataModel.findByOwner(
	req.session.account._id,
	(err, docs) => {
		if (err) {
			console.log(err);
			return res.status(400).json({ error: "An error occurred (no, really)" });
		}
		return res.json({ watchlist: docs });
	},
);

module.exports = {
	watchlistPage,
	getShows,
	searchShows,
};
