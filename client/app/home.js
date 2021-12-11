// #region Poster Resolution
const posterPathRoot = "https://www.themoviedb.org/t/p/w600_and_h900_bestv2/";
const posterNotFoundPath = "/assets/img/posterNotFound.png";
/**
 * 
 * @param {String} path The assumed path of the poster.
 * @returns {String} The path to the poster or the default poster if missing.
 */
const resolvePosterPath = (path) => (path) ? posterPathRoot + path : posterNotFoundPath;
// #endregion

// #region Request Event Handlers
const handleFormSubmission = (e) => {
	e.preventDefault();
	searchShows(e);
	return false;
};
const searchShows = (e) => {
	e.preventDefault();
	console.log(`/searchShows?query=${document.querySelector("#searchbar").value}`);
	sendAjax('GET', `/searchShows`, {query: document.querySelector("#searchbar").value}, function(data) {
		console.log("searchShows (client) returned!");
		ReactDOM.render(
			<ShowList shows={(data.watchlist) ? data.watchlist : (data.results) ? data.results : []}/>,
			document.querySelector("#shows")
		);
		/**
		 * @type {HTMLElement}
		 */
		document.querySelector("#shows").dataset['showsFrom'] = "search";
		document.querySelectorAll(".showList>.showListing").forEach((elem)=>elem.addEventListener('click', getShow));
		document.querySelectorAll(".showList>.ShowListing").forEach((elem)=>elem.addEventListener('click', getShow));
	});
};

const getShow = (e) => {
	e.preventDefault();
	const showID = e.currentTarget.dataset['id'];
	requestGetShow(showID, function(data) {
		console.log("getShow (client) returned!");
		ReactDOM.render(
			<ShowDetail showData = {data} />, document.querySelector('#showDetail')
		);
		document.
			querySelectorAll("#bttn_showDetailHide").
			forEach((elem)=>elem.addEventListener('click', (e) => {
				e.stopPropagation();
				e.preventDefault();
				$("#showDetail").hide(250);
			}));
		document.
			querySelector("#bttn_toggleShowinWatchlist").
			addEventListener('click', toggleShowinWatchlist);
		$("#showDetail").show(250);
	});
};

const requestGetShow = (showID, callback) => {
	console.log(`/getShow?id=${showID}`);
	sendAjax('GET', `/getShow`, {id: showID}, callback);
};

const toggleShowinWatchlist = (e) => {
	e.preventDefault();
	const showID = e.currentTarget.dataset['id'];
	if (isInWatchlist(showID)) {
		console.log(`/removeShowFromWatchlist?id=${showID}`);
		sendAjax('GET', `/removeShowFromWatchlist`, {showID: showID}, function(data) {
			console.log("removeShowFromWatchlist (client) returned!");
			removeFromSessionWatchlist(showID);
			eventAlert("The show has successfully been removed.");
			window.STORED_SCROLL_POSITION = {
				"x": window.scrollX,
				"y": window.scrollY,
			};
			if (document.querySelector("#shows").dataset['showsFrom'] == 'watchlist')
				loadUserDataFromServer();
			else
				syncSessionWatchlist();
			window.STORED_SCROLL_POSITION = undefined;
			console.log(data);
			requestGetShow(showID, (data2) => {
				console.log("show rerendering!");
				ReactDOM.render(
					<ShowDetail showData = {data2} />, document.querySelector('#showDetail')
				);
				document.
					querySelectorAll("#bttn_showDetailHide").
					forEach((elem)=>elem.addEventListener('click', (e) => {
						e.stopPropagation();
						e.preventDefault();
						$("#showDetail").hide(250);
					}));
				document.
					querySelector("#bttn_toggleShowinWatchlist").
					addEventListener('click', toggleShowinWatchlist);
				$("#showDetail").show(250);
			});
		});
	}
	else {
		console.log(`/addShowToWatchlist?id=${showID}`);
		sendAjax('GET', `/addShowToWatchlist`, {showID: showID}, function(data) {
			console.log("addShowToWatchlist (client) returned!");
			// window.sessionStorage.setItem("watchlist", JSON.stringify(JSON.parse(window.sessionStorage.getItem('watchlist')).push(''+showID)));
			addToSessionWatchlist(showID);
			eventAlert("The show has successfully been added.");
			console.log(data);
			if (document.querySelector("#shows").dataset['showsFrom'] == 'watchlist')
				loadUserDataFromServer();
			else
				syncSessionWatchlist();
			requestGetShow(showID, (data2) => {
				console.log("show rerendering!");
				ReactDOM.render(
					<ShowDetail showData = {data2} />, document.querySelector('#showDetail')
				);
				// document.querySelectorAll(".showDetail").forEach((elem)=>elem.addEventListener('click', toggleShowinWatchlist));
				document.
					querySelectorAll("#bttn_showDetailHide").
					forEach((elem)=>elem.addEventListener('click', (e) => {
						e.stopPropagation();
						e.preventDefault();
						$("#showDetail").hide(250);
					}));
				// document.
				// 	querySelectorAll("#bttn_toggleShowinWatchlist").
				// 	forEach((elem)=>elem.addEventListener('click', toggleShowinWatchlist));
				document.
					querySelector("#bttn_toggleShowinWatchlist").
					addEventListener('click', toggleShowinWatchlist);
				$("#showDetail").show(250);
			});
		});
	}
};
// #endregion

// #region ReactDom Objects
/**
 * 
 * @param {Object} props An object w/ a 'shows' property.
 */
const ShowList = (props) => {
	if (props.length === 0 || props.shows.length === 0) {
		return (
			<div className="showlist">
				<h3 className="emptyShowlist">No Shows yet</h3>
			</div>
		);
	}
	const list = props.shows.map(function(result) {
		console.log(result);
		return (
			// <a className="ShowListing" data-id={result.id} href={`/getShow?showID=${result.id}`}> 
			// href={`/getShow?id=${result.id}`}
			
			<a className="showListing" key={result.id} data-id={result.id}>
				<img 
					className="showListingImg"
					src={resolvePosterPath(result.poster_path)}
					alt={`${result.name}'s Poster`} />
				<span className="showListingText">
					<h1 className="showName">{result.name}</h1>
					<h2 className="showAirDate">{result.first_air_date}</h2>
					<p className="showOverview">{result.overview}</p>
				</span>
			</a>
		);
	});
	return (
		<div className="showList">
			{list}
		</div>
	);
}

const ShowDetail = (props) => {
	// if (props.length === 0 || props.shows.length === 0) {
	if (!props.showData) {
		return (
			<div className="showDetail">
				<h3 className="emptyShowElement">No Show Data</h3>
			</div>
		);
	}
	return (
		<div className="showDetail" data-showID={props.showData.id} data-id={props.showData.id} data-name={props.showData.name} data-number_of_epsisodes={props.showData.number_of_epsisodes}>
			<img src={resolvePosterPath(props.showData.poster_path)} alt={`${props.showData.name}'s Poster`} />
			<h1 className="name">{props.showData.name}</h1>
			<h2 className="airDate">{props.showData.first_air_date}</h2>
			<span className="numEpisodes">Number of Episodes: {props.showData.number_of_episodes}</span>
			<p className="overview">{props.showData.overview}</p>
			<button id="bttn_showDetailHide">X</button>
			<button id="bttn_toggleShowInWatchlist" data-id={props.showData.id}>{(isInWatchlist(props.showData.id)) ? "-" : "+"}</button>
			{/* (getSessionWatchlist()?.filter((elem) => elem != props.showData.id).length != 0) ? "-" : "+" */}
		</div>
	);
};

const SearchbarForm = (props) => {
	return (
		<form
			id="searchbarForm"
			onSubmit={handleFormSubmission}
			name="searchbarForm"
			action="/home"
			method="POST"
			className="searchbarForm"
		>
			<div><label htmlFor="name">Search For:&nbsp;&nbsp;</label>
			<input id="searchbar" type="text" name="name" placeholder="Show Name"/></div>
			<div><label htmlFor="mediaType">Medium:&nbsp;&nbsp;</label>
			<select name="mediaType" id="medium-select">
				<option value="TV">TV Show</option>
				<option value="Movie">Movie</option>
			</select></div>
			{/* <div><label htmlFor="age">Age:&nbsp;&nbsp;</label>
			<input id="domoAge" type="text" name="age" placeholder="Domo Age"/></div> */}
			<input type="hidden" name="_csrf" value={props.csrf}/>
			<input className="searchSubmit" type="submit" value="Make Domo"/>
		</form>
	);
};
// #endregion

const loadUserDataFromServer = () => {
	// #region Ensures frequent resyncs
	sendAjax('GET', '/getShows', null, (data) => {
		let list = (data.watchlist) ? data.watchlist : [];
		if (!Array.isArray(list))
			list = (list.list && Array.isArray(list.list)) ? list.list : [];
		window.sessionStorage.setItem("watchlist", JSON.stringify(list));
		window.WATCHLIST_STORAGE = [];
		console.log('watchlist.list');
		console.log(list);
		if (list.length === 0) {
			ReactDOM.render(
				<ShowList shows={[]}/>, document.querySelector("#shows")
			);
			return;
		}
		for (let i = 0; i < list.length; i++) {
			const elem = list[i];
			requestGetShow(elem, (data) => {
				window.WATCHLIST_STORAGE.push(data);
				if (list.length === window.WATCHLIST_STORAGE.length) {
					ReactDOM.render(
						<ShowList shows={window.WATCHLIST_STORAGE}/>, document.querySelector("#shows")
					);
					document.querySelector("#shows").dataset['showsFrom'] = "watchlist";
					document.querySelectorAll(".showListing").forEach((elem)=>elem.addEventListener('click', getShow));
					document.querySelectorAll(".ShowListing").forEach((elem)=>elem.addEventListener('click', getShow));
					if (window.STORED_SCROLL_POSITION) {
						window.scrollTo({
							top: window.STORED_SCROLL_POSITION.x,
							left: window.STORED_SCROLL_POSITION.y,
							behavior: 'smooth',
						});
						window.STORED_SCROLL_POSITION = undefined;
					}
				}
			});
		}
	});
	// #endregion
	// #region Allows for more desyncs
	// if (!window.sessionStorage.getItem("watchlist")) {
	// 	sendAjax('GET', '/getShows', null, (data) => {
	// 		let list = (data.watchlist) ? data.watchlist : [];
	// 		if (!Array.isArray(list))
	// 			list = (list.list && Array.isArray(list.list)) ? list.list : [];
	// 		window.sessionStorage.setItem("watchlist", JSON.stringify(list));
	// 		window.WATCHLIST_STORAGE = [];
	// 		for (let i = 0; i < list.length; i++) {
	// 			const elem = list[i];
	// 			requestGetShow(elem, (data) => {
	// 				window.WATCHLIST_STORAGE.push(data);
	// 				if (list.length === window.WATCHLIST_STORAGE.length) {
	// 					ReactDOM.render(
	// 						<ShowList shows={window.WATCHLIST_STORAGE}/>, document.querySelector("#shows")
	// 					);
	// 					document.querySelectorAll(".showListing").forEach((elem)=>elem.addEventListener('click', getShow));
	// 					document.querySelectorAll(".ShowListing").forEach((elem)=>elem.addEventListener('click', getShow));
	// 				}
	// 			});
	// 		}
	// 	});
	// }
	// else {
	// 	let list = getSessionWatchlist();
	// 	if (!Array.isArray(list))
	// 		list = (list.list && Array.isArray(list.list)) ? list.list : [];
	// 	// window.sessionStorage.setItem("watchlist", JSON.stringify(list));
	// 	window.WATCHLIST_STORAGE = [];
	// 	for (let i = 0; i < list.length; i++) {
	// 		const elem = list[i];
	// 		requestGetShow(elem, (data) => {
	// 			window.WATCHLIST_STORAGE.push(data);
	// 			if (list.length === window.WATCHLIST_STORAGE.length) {
	// 				ReactDOM.render(
	// 					<ShowList shows={window.WATCHLIST_STORAGE}/>, document.querySelector("#shows")
	// 				);
	// 				document.querySelectorAll(".showListing").forEach((elem)=>elem.addEventListener('click', getShow));
	// 				document.querySelectorAll(".ShowListing").forEach((elem)=>elem.addEventListener('click', getShow));
	// 			}
	// 		});
	// 	}
	// }
	// #endregion
};

const syncSessionWatchlist = () => {
	sendAjax('GET', '/getShows', null, (data) => {
		let list = (data.watchlist) ? data.watchlist : [];
		if (!Array.isArray(list))
			list = (list.list && Array.isArray(list.list)) ? list.list : [];
		// console.assert(JSON.stringify(getSessionWatchlist()) == JSON.stringify(list), `${JSON.stringify(getSessionWatchlist())} != ${JSON.stringify(list)}`);
		window.sessionStorage.setItem("watchlist", JSON.stringify(list));
		window.WATCHLIST_STORAGE = [];
		console.log('watchlist.list');
		console.log(list);
	});
};

const setup = function(csrf) {
	ReactDOM.render(
		<SearchbarForm csrf={csrf}/>, document.querySelector("#search")
	);
	
	ReactDOM.render(
		<ShowList shows={[]}/>, document.querySelector("#shows")
	);
	/**
	 * @type {HTMLElement}
	 */
	document.querySelector("#shows").dataset['showsFrom'] = "watchlist";

	loadUserDataFromServer();
	$("#showDetail").hide();
};


const getToken = () => {
	sendAjax('GET', '/getToken', null, (result) => {
		setup(result.csrfToken);
	});
};

// #region Session Storage
/**
 * Gets the session storage for the watchlist (if it exists).
 * @returns {String[] | undefined}
 */
const getSessionWatchlist = () => {
	try {
		return JSON.parse(window.sessionStorage.getItem('watchlist'));
	} catch (error) {
		return undefined;
	}
}

/**
 * Adds the given id to the session storage for the watchlist (if it exists).
 * @returns {boolean} true if added, false if watchlist undefined.
 */
const addToSessionWatchlist = (id) => (getSessionWatchlist()) ? true || JSON.stringify(getSessionWatchlist().push(id)) : false;

/**
 * Removes the given id from the session storage for the watchlist (if it exists).
 * @returns {boolean} true if removed, false otherwise.
 */
const removeFromSessionWatchlist = (id) => {
	let swl = getSessionWatchlist();
	if (!swl || !isInWatchlist(id))
		return false;
	swl = swl.filter((elem) => elem != id);
	console.assert(swl.length != getSessionWatchlist().length);
	console.assert(swl != getSessionWatchlist());
	window.sessionStorage.setItem('watchlist', swl);
	return true;
};

const isInWatchlist = (id) => {
	let swl = getSessionWatchlist();
	swl = (swl) ? swl : [];
	let retVal = false;
	for (let i = 0; i < swl?.length; i++) {
		const elem = swl[i];
		retVal = retVal || (elem == id);
	}
	return retVal;
}
// #endregion

const eventAlert = (text) => {
	/**
	 * @type {HTMLDivElement}
	 */
	const eab = document.querySelector("#eventAlertBox");
	const eam = document.querySelector("#eventAlertMessage");
	eam.innerHTML = text;
	eab.style.opacity = 1;
	if (window.EVENT_TIMER)
		window.clearTimeout(window.EVENT_TIMER);
	window.EVENT_TIMER  = window.setTimeout(((myEAB, timestamp) => {
		eab.style.opacity = 0;
		window.clearTimeout(window.EVENT_TIMER);
		window.EVENT_TIMER = undefined;
	}).bind(this), 3500);
};

$(document).ready(function() {
	getToken();
});