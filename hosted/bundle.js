"use strict";

var _this = void 0;

// #region Poster Resolution
var posterPathRoot = "https://www.themoviedb.org/t/p/w600_and_h900_bestv2";
var posterNotFoundPath = "/assets/img/posterNotFound.png";
/**
 * 
 * @param {String} path The assumed path of the poster.
 * @returns {String} The path to the poster or the default poster if missing.
 */

var resolvePosterPath = function resolvePosterPath(path) {
  return path ? posterPathRoot + path : posterNotFoundPath;
}; // #endregion
// #region Request Event Handlers


var handleFormSubmission = function handleFormSubmission(e) {
  e.preventDefault();
  searchShows(e);
  return false;
};
/**
 * Event handler that sends a request to /searchShows
 * @param {Event} e The event arguments.
 */


var searchShows = function searchShows(e) {
  e.preventDefault();
  console.log("/searchShows?query=".concat(document.querySelector("#searchbar").value));
  sendAjax('GET', "/searchShows", {
    query: document.querySelector("#searchbar").value
  }, function (data) {
    console.log("searchShows (client) returned!");
    ReactDOM.render( /*#__PURE__*/React.createElement(ShowList, {
      shows: data.watchlist ? data.watchlist : data.results ? data.results : []
    }), document.querySelector("#shows"));
    /**
     * @type {HTMLElement}
     */

    document.querySelector("#shows").dataset['showsFrom'] = "search";
    document.querySelectorAll(".showList>.showListing").forEach(function (elem) {
      return elem.addEventListener('click', getShow);
    });
    document.querySelectorAll(".showList>.ShowListing").forEach(function (elem) {
      return elem.addEventListener('click', getShow);
    });
  });
};
/**
 * A wrapper for {@linkcode requestGetShow}.
 * @param {Event} e The event's arguments.
 */


var getShow = function getShow(e) {
  e.preventDefault();
  var showID = e.currentTarget.dataset['id'];
  requestGetShow(showID, function (data) {
    console.log("getShow (client) returned!");
    ReactDOM.render( /*#__PURE__*/React.createElement(ShowDetail, {
      showData: data
    }), document.querySelector('#showDetail'));
    document.querySelectorAll("#bttn_showDetailHide").forEach(function (elem) {
      return elem.addEventListener('click', function (e) {
        e.stopPropagation();
        e.preventDefault();
        $("#showDetail").hide(250);
      });
    });
    document.querySelector("#bttn_toggleShowinWatchlist").addEventListener('click', toggleShowinWatchlist);
    $("#showDetail").show(250);
  });
};
/**
 * Sends a request to /getShow
 * @param {string} showID The show to get.
 * @param {Function} callback 
 */


var requestGetShow = function requestGetShow(showID, callback) {
  console.log("/getShow?id=".concat(showID));
  sendAjax('GET', "/getShow", {
    id: showID
  }, callback);
};

var toggleShowinWatchlist = function toggleShowinWatchlist(e) {
  e.preventDefault();
  var showID = e.currentTarget.dataset['id'];

  if (isInWatchlist(showID)) {
    console.log("/removeShowFromWatchlist?id=".concat(showID));
    sendAjax('GET', "/removeShowFromWatchlist", {
      showID: showID
    }, function (data) {
      console.log("removeShowFromWatchlist (client) returned!");
      removeFromSessionWatchlist(showID);
      eventAlert("The show has successfully been removed.");
      window.STORED_SCROLL_POSITION = {
        "x": window.scrollX,
        "y": window.scrollY
      };
      if (document.querySelector("#shows").dataset['showsFrom'] == 'watchlist') loadUserDataFromServer();else syncSessionWatchlist();
      window.STORED_SCROLL_POSITION = undefined;
      console.log(data);
      requestGetShow(showID, function (data2) {
        console.log("show rerendering!");
        ReactDOM.render( /*#__PURE__*/React.createElement(ShowDetail, {
          showData: data2
        }), document.querySelector('#showDetail'));
        document.querySelectorAll("#bttn_showDetailHide").forEach(function (elem) {
          return elem.addEventListener('click', function (e) {
            e.stopPropagation();
            e.preventDefault();
            $("#showDetail").hide(250);
          });
        });
        document.querySelector("#bttn_toggleShowinWatchlist").addEventListener('click', toggleShowinWatchlist);
        $("#showDetail").show(250);
      });
    });
  } else {
    console.log("/addShowToWatchlist?id=".concat(showID));
    sendAjax('GET', "/addShowToWatchlist", {
      showID: showID
    }, function (data) {
      console.log("addShowToWatchlist (client) returned!");
      addToSessionWatchlist(showID);
      eventAlert("The show has successfully been added.");
      console.log(data);
      if (document.querySelector("#shows").dataset['showsFrom'] == 'watchlist') loadUserDataFromServer();else syncSessionWatchlist();
      requestGetShow(showID, function (data2) {
        console.log("show rerendering!");
        ReactDOM.render( /*#__PURE__*/React.createElement(ShowDetail, {
          showData: data2
        }), document.querySelector('#showDetail'));
        document.querySelectorAll("#bttn_showDetailHide").forEach(function (elem) {
          return elem.addEventListener('click', function (e) {
            e.stopPropagation();
            e.preventDefault();
            $("#showDetail").hide(250);
          });
        });
        document.querySelector("#bttn_toggleShowinWatchlist").addEventListener('click', toggleShowinWatchlist);
        $("#showDetail").show(250);
      });
    });
  }
}; // #endregion
// #region ReactDom Objects

/**
 * Constructs an element that represents a list of shows.
 * @param {*} props The properties for the element.
 * @returns {HTMLDivElement} An element that represents a list of shows.
 */


var ShowList = function ShowList(props) {
  if (props.length === 0 || props.shows.length === 0) {
    return /*#__PURE__*/React.createElement("div", {
      className: "showlist"
    }, /*#__PURE__*/React.createElement("h3", {
      className: "emptyShowlist"
    }, "No Shows yet"));
  }

  var list = props.shows.map(function (result) {
    console.log(result);
    return /*#__PURE__*/React.createElement("a", {
      className: "showListing",
      key: result.id,
      "data-id": result.id
    }, /*#__PURE__*/React.createElement("img", {
      className: "showListingImg",
      src: resolvePosterPath(result.poster_path),
      alt: "".concat(result.name, "'s Poster")
    }), /*#__PURE__*/React.createElement("span", {
      className: "showListingText"
    }, /*#__PURE__*/React.createElement("h1", {
      className: "showName"
    }, result.name), /*#__PURE__*/React.createElement("h2", {
      className: "showAirDate"
    }, result.first_air_date), /*#__PURE__*/React.createElement("p", {
      className: "showOverview"
    }, result.overview)));
  });
  return /*#__PURE__*/React.createElement("div", {
    className: "showList"
  }, list);
};
/**
 * Constructs an element that represents detailed info about a show.
 * @param {*} props The properties for the element.
 * @returns {HTMLDivElement} An element that represents detailed info about a show.
 */


var ShowDetail = function ShowDetail(props) {
  if (!props.showData) {
    return /*#__PURE__*/React.createElement("div", {
      className: "showDetail"
    }, /*#__PURE__*/React.createElement("h3", {
      className: "emptyShowElement"
    }, "No Show Data"));
  }

  console.log(props.showData);
  var sData = props.showData;
  var seasonList = [/*#__PURE__*/React.createElement("div", {
    className: "seasonElem seasonElemTitles",
    key: "titles"
  }, /*#__PURE__*/React.createElement("span", {
    className: "seasonPoster seasonElemTitle"
  }, "Poster"), /*#__PURE__*/React.createElement("span", {
    className: "seasonElemItem seasonNumber seasonElemTitle"
  }, "#"), /*#__PURE__*/React.createElement("span", {
    className: "seasonElemItem seasonName seasonElemTitle"
  }, "Name"), /*#__PURE__*/React.createElement("span", {
    className: "seasonElemItem seasonEpisodeCount seasonElemTitle"
  }, "Length"), /*#__PURE__*/React.createElement("span", {
    className: "seasonElemItem seasonOverview seasonElemTitle"
  }, "Overview"))];

  for (var i = 0; (_sData$seasons = sData.seasons) !== null && _sData$seasons !== void 0 && _sData$seasons.length && i < sData.seasons.length; i++) {
    var _sData$seasons;

    var season = sData.seasons[i];
    seasonList.push( /*#__PURE__*/React.createElement("div", {
      className: "seasonElem",
      key: season.id,
      "data-season_id": season.id
    }, /*#__PURE__*/React.createElement("img", {
      className: "seasonElemItem seasonPoster",
      src: resolvePosterPath(season.poster_path),
      alt: "Season ".concat(season.season_number, "'s Poster")
    }), /*#__PURE__*/React.createElement("span", {
      className: "seasonElemItem seasonNumber"
    }, season.season_number), /*#__PURE__*/React.createElement("span", {
      className: "seasonElemItem seasonName"
    }, season.name), /*#__PURE__*/React.createElement("span", {
      className: "seasonElemItem seasonEpisodeCount"
    }, season.episode_count), /*#__PURE__*/React.createElement("span", {
      className: "seasonElemItem seasonOverview"
    }, season.overview)));
  }

  if (seasonList.length > 1) seasonList = /*#__PURE__*/React.createElement("div", {
    className: "seasonList"
  }, seasonList);
  return /*#__PURE__*/React.createElement("div", {
    className: "showDetail",
    "data-showID": props.showData.id,
    "data-id": props.showData.id,
    "data-name": props.showData.name,
    "data-number_of_epsisodes": props.showData.number_of_epsisodes
  }, /*#__PURE__*/React.createElement("div", {
    className: "mainElementsContainer"
  }, /*#__PURE__*/React.createElement("img", {
    src: resolvePosterPath(props.showData.poster_path),
    alt: "".concat(props.showData.name, "'s Poster")
  }), /*#__PURE__*/React.createElement("div", {
    className: "textContent"
  }, /*#__PURE__*/React.createElement("h1", {
    className: "name"
  }, props.showData.name), /*#__PURE__*/React.createElement("h2", {
    className: "airDate"
  }, props.showData.first_air_date), /*#__PURE__*/React.createElement("span", {
    className: "numEpisodes"
  }, "Number of Episodes: ", props.showData.number_of_episodes), /*#__PURE__*/React.createElement("p", {
    className: "overview"
  }, props.showData.overview))), seasonList, /*#__PURE__*/React.createElement("button", {
    id: "bttn_showDetailHide"
  }, "X"), /*#__PURE__*/React.createElement("button", {
    id: "bttn_toggleShowInWatchlist",
    "data-id": props.showData.id
  }, isInWatchlist(props.showData.id) ? "-" : "+"));
};
/**
 * Constructs an element that represents a searchbar.
 * @param {*} props The properties for the element.
 * @returns {HTMLDivElement} An element that represents a searchbar.
 */


var SearchbarForm = function SearchbarForm(props) {
  return /*#__PURE__*/React.createElement("form", {
    id: "searchbarForm",
    onSubmit: handleFormSubmission,
    name: "searchbarForm",
    action: "/home",
    method: "POST",
    className: "searchbarForm"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    htmlFor: "name"
  }, "Search For:\xA0\xA0"), /*#__PURE__*/React.createElement("input", {
    id: "searchbar",
    type: "text",
    name: "name",
    placeholder: "Show Name"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    htmlFor: "mediaType"
  }, "Medium:\xA0\xA0"), /*#__PURE__*/React.createElement("select", {
    name: "mediaType",
    id: "medium-select"
  }, /*#__PURE__*/React.createElement("option", {
    value: "TV"
  }, "TV Show"), /*#__PURE__*/React.createElement("option", {
    value: "Movie"
  }, "Movie"))), /*#__PURE__*/React.createElement("input", {
    type: "hidden",
    name: "_csrf",
    value: props.csrf
  }), /*#__PURE__*/React.createElement("input", {
    className: "searchSubmit",
    type: "submit",
    value: "Search"
  }));
}; // #endregion

/**
 * Refreshes the current {@linkcode Account}'s info from the server.
 */


var loadUserDataFromServer = function loadUserDataFromServer() {
  // #region Ensures frequent resyncs
  sendAjax('GET', '/getShows', null, function (data) {
    var list = data.watchlist ? data.watchlist : [];
    if (!Array.isArray(list)) list = list.list && Array.isArray(list.list) ? list.list : [];
    window.sessionStorage.setItem("watchlist", JSON.stringify(list));
    window.WATCHLIST_STORAGE = [];
    console.log('watchlist.list');
    console.log(list);

    if (list.length === 0) {
      ReactDOM.render( /*#__PURE__*/React.createElement(ShowList, {
        shows: []
      }), document.querySelector("#shows"));
      return;
    }

    for (var i = 0; i < list.length; i++) {
      var elem = list[i];
      requestGetShow(elem, function (data) {
        window.WATCHLIST_STORAGE.push(data);

        if (list.length === window.WATCHLIST_STORAGE.length) {
          ReactDOM.render( /*#__PURE__*/React.createElement(ShowList, {
            shows: window.WATCHLIST_STORAGE
          }), document.querySelector("#shows"));
          document.querySelector("#shows").dataset['showsFrom'] = "watchlist";
          document.querySelectorAll(".showListing").forEach(function (elem) {
            return elem.addEventListener('click', getShow);
          });
          document.querySelectorAll(".ShowListing").forEach(function (elem) {
            return elem.addEventListener('click', getShow);
          });

          if (window.STORED_SCROLL_POSITION) {
            window.scrollTo({
              top: window.STORED_SCROLL_POSITION.x,
              left: window.STORED_SCROLL_POSITION.y,
              behavior: 'smooth'
            });
            window.STORED_SCROLL_POSITION = undefined;
          }
        }
      });
    }
  }); // #endregion
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
/**
 * Syncs the locally stored watchlist with the version on the server
 */


var syncSessionWatchlist = function syncSessionWatchlist() {
  sendAjax('GET', '/getShows', null, function (data) {
    var list = data.watchlist ? data.watchlist : [];
    if (!Array.isArray(list)) list = list.list && Array.isArray(list.list) ? list.list : [];
    window.sessionStorage.setItem("watchlist", JSON.stringify(list));
    window.WATCHLIST_STORAGE = [];
    console.log('watchlist.list');
    console.log(list);
  });
};

var setup = function setup(csrf) {
  ReactDOM.render( /*#__PURE__*/React.createElement(SearchbarForm, {
    csrf: csrf
  }), document.querySelector("#search"));
  ReactDOM.render( /*#__PURE__*/React.createElement(ShowList, {
    shows: []
  }), document.querySelector("#shows"));
  document.querySelector("#shows").dataset['showsFrom'] = "watchlist";
  loadUserDataFromServer();
  $("#showDetail").hide();
};

var getToken = function getToken() {
  return sendAjax('GET', '/getToken', null, function (result) {
    return setup(result.csrfToken);
  });
}; // #region Session Storage

/**
 * Gets the session storage for the watchlist (if it exists).
 * @returns {String[] | undefined}
 */


var getSessionWatchlist = function getSessionWatchlist() {
  try {
    return JSON.parse(window.sessionStorage.getItem('watchlist'));
  } catch (error) {
    return undefined;
  }
};
/**
 * Adds the given id to the session storage for the watchlist (if it exists).
 * @returns {boolean} true if added, false if watchlist undefined.
 */


var addToSessionWatchlist = function addToSessionWatchlist(id) {
  return getSessionWatchlist() ? true || JSON.stringify(getSessionWatchlist().push(id)) : false;
};
/**
 * Removes the given id from the session storage for the watchlist (if it exists).
 * @param {string} id The id to remove.
 * @returns {boolean} true if removed, false otherwise.
 */


var removeFromSessionWatchlist = function removeFromSessionWatchlist(id) {
  var swl = getSessionWatchlist();
  if (!swl || !isInWatchlist(id)) return false;
  swl = swl.filter(function (elem) {
    return elem != id;
  });
  console.assert(swl.length != getSessionWatchlist().length);
  console.assert(swl != getSessionWatchlist());
  window.sessionStorage.setItem('watchlist', swl);
  return true;
};
/**
 * Checks if the given id is in the session storage.
 * @param {string} id The id to check.
 * @returns {boolean} true if there, false otherwise.
 */


var isInWatchlist = function isInWatchlist(id) {
  var swl = getSessionWatchlist();
  swl = swl ? swl : [];
  var retVal = false;

  for (var i = 0; i < ((_swl = swl) === null || _swl === void 0 ? void 0 : _swl.length); i++) {
    var _swl;

    var elem = swl[i];
    retVal = retVal || elem == id;
  }

  return retVal;
}; // #endregion


var eventAlert = function eventAlert(text) {
  var eab = document.querySelector("#eventAlertBox");
  var eam = document.querySelector("#eventAlertMessage");
  eam.innerHTML = text;
  eab.style.opacity = 1;
  if (window.EVENT_TIMER) window.clearTimeout(window.EVENT_TIMER);
  window.EVENT_TIMER = window.setTimeout(function (myEAB, timestamp) {
    eab.style.opacity = 0;
    window.clearTimeout(window.EVENT_TIMER);
    window.EVENT_TIMER = undefined;
  }.bind(_this), 3500);
};

$(document).ready(function () {
  getToken();
});
"use strict";

var handleError = function handleError(err) {
  console.log('error');
  console.error(err);
  if (typeof err !== "string") $("#logger").text(err.error);else $("#logger").text(err);
};

var redirect = function redirect(response) {
  window.location = response.redirect;
};

var sendAjax = function sendAjax(type, action, data, success) {
  $.ajax({
    cache: false,
    type: type,
    url: action,
    data: data,
    dataType: "json",
    success: success,
    error: function error(xhr, status, _error) {
      try {
        var messageObj = JSON.parse(xhr.responseText);
        handleError(messageObj);
      } catch (e) {
        handleError("Unparsable Error Response");
      }
    }
  });
};
