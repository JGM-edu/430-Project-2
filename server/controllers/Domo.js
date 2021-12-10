const models = require("../models");

const { Domo } = models;

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
const makerPage = (req, res) => {
//   res.render('app');
	Domo.DomoModel.findByOwner(req.session.account._id, (err, docs) => {
		if (err) {
			console.log(err);
			return res.status(400).json({ error: "An error occurred." });
		}
		return res.render("app", { csrfToken: req.csrfToken(), domos: docs });
	});
};

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
const makeDomo = (req, res) => {
	if (!req.body.name || !req.body.age)
		return res.status(400).json({ error: "Both age and name are required." });

	const domoData = {
		name  : req.body.name,
		age   : req.body.age,
		owner : req.session.account,
	};

	const newDomo = new Domo.DomoModel(domoData);

	const domoPromise = newDomo.save();

	domoPromise.then(() => res.json({ redirect: "/home" }));

	domoPromise.catch((err) => {
		console.log(err);
		if (err.code === 11000)
			return res.status(400).json({ error: "Domo already exists." });

		return res.status(400).json({ error: "An error occurred." });
	});

	return domoPromise;
};

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
const getDomos = (req, res) => Domo.DomoModel.findByOwner(req.session.account._id, (err, docs) => {
	if (err) {
		console.log(err);
		return res.status(400).json({ error: "An error occurred (no, really)" });
	}
	return res.json({ domos: docs });
});

module.exports.makerPage = makerPage;
module.exports.make = makeDomo;
module.exports.getDomos = getDomos;
