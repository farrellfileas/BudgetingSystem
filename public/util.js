"use strict";

(function() {
	window.addEventListener("load", init);

	function init() {
		fetch("/loginerror")
		  .then(checkStatus)
		  .then(resp => resp.json())
		  .then(processErr);
	}

	function processErr(resp) {
		if (resp.length === 1) {
			if (resp[0] === 'password') {
				id('invalid-password').classList.add('d-block');
				qs('input[name=password]').classList.add('border-danger');
			} else {
				let invalid = id('invalid-user');
				invalid.textContent += " " + resp[0] ". Username is case sensitive";
				invalid.classList.add('d-block');
				qs('input[name=username]').classList.add('border-danger');
			}
		}
	}

	function checkStatus(response) {
	    if (response.ok) {
	      return response;
	    }
	    throw Error("Error in request: " + response.statusText);
	}

	function qs(selector) {
		return document.querySelector(selector);
	}

	function qsa(selector) {
		return document.querySelectorAll(selector);
	}

	function id(selector) {
		return document.getElementById(selector);
	}
})();