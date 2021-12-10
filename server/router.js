const controllers = require("./controllers");
const mid = require("./middleware");
const requests = require("./requests");

/**
 *
 * @param {import('express').Express} app
 */
const router = (app) => {
	app.get("/getDomos", 				mid.requiresLogin, controllers.Domo.getDomos);
	// app.get('/getShows', 			mid.requiresLogin, controllers.UserData.getShows);
	app.get("/getShows", 				mid.requiresLogin, controllers.Account.getWatchlist);
	app.get("/showWatchlist", 			mid.requiresLogin, controllers.UserData.watchlistPage);
	// app.get('/searchShows', 			mid.requiresLogin, controllers.UserData.searchShows);
	app.get("/searchShows", 			mid.requiresLogin, requests.searchShows);
	app.get("/getShow", 				mid.requiresLogin, requests.getShow);
	app.get("/addShowToWatchlist", 		mid.requiresLogin, controllers.Account.addShowToWatchlist);
	app.get("/removeShowFromWatchlist", mid.requiresLogin, controllers.Account.removeShowFromWatchlist);

	app.get("/login", 		mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
	app.post("/login", 		mid.requiresSecure, mid.requiresLogout, controllers.Account.login);
	// app.get('/signup', 	mid.requiresSecure, mid.requiresLogout, controllers.Account.signupPage);
	app.get("/getToken", 	mid.requiresSecure, controllers.Account.getToken);
	app.post("/signup",		mid.requiresSecure, mid.requiresLogout, controllers.Account.signup);
	app.get("/logout", 		mid.requiresLogin, controllers.Account.logout);
	app.get("/home", 		mid.requiresLogin, controllers.UserData.watchlistPage);
	app.post("/home", 		mid.requiresLogin, controllers.Domo.make);
	app.get("/", 			mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
	// app.get('/home', mid.requiresLogin, controllers.Domo.makerPage);
	// app.post('/home', mid.requiresLogin, controllers.Domo.make);
};

module.exports = router;