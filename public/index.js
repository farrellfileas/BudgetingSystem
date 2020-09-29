"use strict";

(function() {
	window.addEventListener("load", init);
	let uid;

	/**
	  * Initialize all event listeners
	  * Set uid for session
	  */
	function init() {
		fetch('/user')
		  .then(checkStatus)
		  .then(resp=>resp.json())
		  .then(resp => {uid = resp.uid; id('username').textContent += " " + resp.username});

		id("input").addEventListener("click", displayInputView);
		id("view").addEventListener('click', displayViewView);
		id("submitInput").addEventListener('click', postInput);
		id("submitView").addEventListener('click', getValues);
	}

	/**
	  * Displays the user requested expenses
	  */
	async function getValues(e) {
		let dates = qsa("#viewView input");
		let start = dates[0].value;
		let end = dates[1].value;

		if (start === "" || end === "") {
			return;
		}

		e.preventDefault();

		let url = "/expenses?uid=" + uid + "&start=" + start + "&end=" + end;

		let response = await fetch(url, {method : "GET"})
		  .then(checkStatus)
		  .then(resp => resp.json());

		let displayView = id("displayView");
		displayView.innerHTML = "";

		if (response.length === 0) {
			let h2 = document.createElement("h2");
			h2.textContent = "No data found between " + start + " and " + end +  ".";

			displayView.appendChild(h2);
			return; 
		}

		for (let i = 0; i < response.length; i++) {
			let div = document.createElement("div");
			div.classList.add("viewEntry");

			let p = document.createElement("p");
			p.textContent = response[i].date;
			p.classList.add("amtAndDate");
			div.appendChild(p);

			p = document.createElement("p");
			p.textContent = "$" + response[i].spent;
			p.classList.add("amtAndDate");
			div.appendChild(p);

			p = document.createElement("p");
			p.textContent = "Description: " + response[i].description;
			p.style = "margin-top: 5px";
			div.appendChild(p);

			displayView.appendChild(div);
		}

		displayView.classList.remove("hidden");
	}

	/**
	  * Submits user expense into database
	  */
	async function postInput(e) {
		let date = qs("#inputView input[type=date]").value; 
		let amount = qs("#inputView input[type=number]").value;
		let description = qs("#inputView textarea").value;

		if (date === "" || amount === "" || description === "") {
			return;
		}


		e.preventDefault();

		let requestBody = new FormData();
		requestBody.append("uid", uid);
		requestBody.append("date", date);
		requestBody.append("amount", amount);
		requestBody.append("description", description);

		let response = await fetch("/input", {method : "POST", body : requestBody})
		  .then(checkStatus)
		  .then(resp => resp.text());

		let message = qs("#inputView h2");
		message.classList.remove("hidden");

		displayInputView();
	}

	/**
	  * Displays and resets the input view. Closes view view.
	  */
	function displayInputView() {
		let inputs = qsa("#inputView input, #inputView textarea");

		for (let i = 0; i < inputs.length; i++) {
			inputs[i].value = "";
		}

		id("inputView").classList.remove("hidden");
		id("viewView").classList.add("hidden");
		setCalendarLimit();
	}

	/**
	  * Displays and resess the view view. Closes the input view
	  */
	function displayViewView() {
		let inputs = qsa("#viewView input");

		for (let i = 0; i < inputs.length; i++) {
			inputs[i].value = "";
		}

		id("inputView").classList.add("hidden");
		id("viewView").classList.remove("hidden");
		setCalendarLimit();
	}

	/**
	  * Sets all calendar's max attribute into today
	  */
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
			calendars[i].value = todaysDate;
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

	function checkStatus(response) {
	    if (response.ok) {
	      return response;
	    }
	    throw Error("Error in request: " + response.statusText);
	}
})();