"use strict";

var handleLogin = function handleLogin(e) {
  e.preventDefault(); // $("#userMessage").animate({width:'hide'}, 350);
  // if ($("#user").val() == '' || $("#pass").val() == '') {
  // 	// handleError("Username or password empty");
  // 	return false;
  // }

  console.log($("input[name=_csrf]").val());
  sendAjax('POST', $("#loginForm").attr("action"), $("#loginForm").serialize(), redirect);
  return false;
};

var handleSignup = function handleSignup(e) {
  e.preventDefault(); // $("#userMessage").animate({width:'hide'}, 350);
  // if ($("#user").val() == '' || $("#pass").val() == '' || $("#pass2").val() == '') {
  // 	// handleError("All fields required");
  // 	return false;
  // }

  if ($("#pass").val() !== $("#pass2").val()) {
    handleError("Passwords don't match");
    return false;
  } // debugger;


  sendAjax('POST', $("#signupForm").attr("action"), $("#signupForm").serialize(), redirect);
  return false;
};

var LoginWindow = function LoginWindow(props) {
  return /*#__PURE__*/React.createElement("form", {
    id: "loginForm",
    name: "loginForm",
    onSubmit: handleLogin,
    action: "/login",
    method: "POST",
    className: "mainForm"
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: "username"
  }, "Username: "), /*#__PURE__*/React.createElement("input", {
    id: "user",
    type: "text",
    name: "username",
    placeholder: "username",
    required: true
  }), /*#__PURE__*/React.createElement("label", {
    htmlFor: "pass"
  }, "Password: "), /*#__PURE__*/React.createElement("input", {
    id: "pass",
    type: "password",
    name: "pass",
    placeholder: "password",
    required: true
  }), /*#__PURE__*/React.createElement("input", {
    type: "hidden",
    name: "_csrf",
    value: props.csrf
  }), /*#__PURE__*/React.createElement("input", {
    className: "formSubmit",
    type: "submit",
    value: "Sign in"
  }), /*#__PURE__*/React.createElement("span", {
    id: "logger"
  }));
};

var SignupWindow = function SignupWindow(props) {
  return /*#__PURE__*/React.createElement("form", {
    id: "signupForm",
    name: "signupForm",
    onSubmit: handleSignup,
    action: "/signup",
    method: "POST",
    className: "mainForm"
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: "username"
  }, "Username: "), /*#__PURE__*/React.createElement("input", {
    id: "user",
    type: "text",
    name: "username",
    placeholder: "username",
    required: true
  }), /*#__PURE__*/React.createElement("label", {
    htmlFor: "pass"
  }, "Password: "), /*#__PURE__*/React.createElement("input", {
    id: "pass",
    type: "password",
    name: "pass",
    placeholder: "password",
    required: true
  }), /*#__PURE__*/React.createElement("label", {
    htmlFor: "pass2"
  }, "Password: "), /*#__PURE__*/React.createElement("input", {
    id: "pass2",
    type: "password",
    name: "pass2",
    placeholder: "retype password",
    required: true
  }), /*#__PURE__*/React.createElement("input", {
    type: "hidden",
    name: "_csrf",
    value: props.csrf
  }), /*#__PURE__*/React.createElement("input", {
    className: "formSubmit",
    type: "submit",
    value: "Sign Up"
  }), /*#__PURE__*/React.createElement("span", {
    id: "logger"
  }));
};

var createLoginWindow = function createLoginWindow(csrf) {
  ReactDOM.render( /*#__PURE__*/React.createElement(LoginWindow, {
    csrf: csrf
  }), document.querySelector("#content"));
  document.querySelectorAll("input[required]").forEach(function (elem) {
    elem.addEventListener('focusin', function (e) {
      e.currentTarget.style.backgroundColor = null;
    });
    elem.addEventListener('focusout', function (e) {
      if (!e.currentTarget.value) e.currentTarget.style.backgroundColor = "pink";
    });
  });
};

var createSignupWindow = function createSignupWindow(csrf) {
  ReactDOM.render( /*#__PURE__*/React.createElement(SignupWindow, {
    csrf: csrf
  }), document.querySelector("#content"));
  document.querySelectorAll("input[required]").forEach(function (elem) {
    elem.addEventListener('focusin', function (e) {
      e.currentTarget.style.backgroundColor = null;
    });
    elem.addEventListener('focusout', function (e) {
      if (!e.currentTarget.value) e.currentTarget.style.backgroundColor = "pink";
    });
  });
};

var setup = function setup(csrf) {
  var loginButton = document.querySelector("#loginButton");
  var signupButton = document.querySelector("#signupButton");
  signupButton.addEventListener("click", function (e) {
    e.preventDefault();
    createSignupWindow(csrf);
    return false;
  });
  loginButton.addEventListener("click", function (e) {
    e.preventDefault();
    createLoginWindow(csrf);
    return false;
  });
  createLoginWindow(csrf);
};

var getToken = function getToken() {
  sendAjax('GET', '/getToken', null, function (result) {
    setup(result.csrfToken);
  });
};

$(document).ready(function () {
  getToken();
});
"use strict";

var handleError = function handleError(err) {
  console.log('error');
  console.error(err);
  $("#logger").text(err);
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
