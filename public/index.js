"use strict";

(function() {
	window.addEventListener("load", init);

	function init() {
		id("input").addEventListener("click", displayInputView);
		id("view").addEventListener('click', displayViewView);
		setCalendarLimit();
		id("submitInput").addEventListener('click', postInput);
	}

	function postInput() {
		let date = qs("#inputView input[type=date]").value;
		let amount = qs("#inputView input[type=number]").value;
		let description = qs("#inputView textarea").value;

		let requestBody = new FormData();
		requestBody.append("date", date);
		requestBody.append("amount", amount);
		requestBody.append("description", description);

		fetch("/input", {method : "POST", body : requestBody})
		  .then(checkStatus)
		  .then(resp => resp.text())
		  .then(print);
	}

	function print(resp) {
		console.log(resp);
	}

	function checkStatus(response) {
	    if (response.ok) {
	      return response;
	    }
	    throw Error("Error in request: " + response.statusText);
	}

	function displayInputView() {
		let inputs = qsa("#inputView input, #inputView textarea");

		for (let i = 0; i < inputs.length; i++) {
			inputs[i].value = "";
		}

		id("inputView").classList.remove("hidden");
		id("viewView").classList.add("hidden");
	}

	function displayViewView() {
		let inputs = qsa("#viewView input");

		for (let i = 0; i < inputs.length; i++) {
			inputs[i].value = "";
		}

		id("inputView").classList.add("hidden");
		id("viewView").classList.remove("hidden");
	}

	function setCalendarLimit() {
		let date = new Date();

		// yyyy-mm-dd
		let year = date.getFullYear();
		let month = date.getMonth() + 1;
		let day = date.getDate();

		if (month < 10) {
			month = "0" + month;
		}

		if (day < 10) {
			day = "0" + day;
		}

		let todaysDate = year + "-" + month + "-" + day;

		let calendars = qsa("input[type=date]");

		for (let i = 0; i < calendars.length; i++) {
			calendars[i].max = todaysDate;
		}
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