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
		id('save').addEventListener('click', saveChanges);
		id('delete').addEventListener('click', deleteEntry);
	}

	async function saveChanges(e) {
		let modalBody = qs('#modal .modal-body');

		e.preventDefault();
		let eid = modalBody.eid;
		let form = new FormData(qs('#modal'));
		form.append('id', eid);

		await fetch('/update', {method: "POST", body: form})
		  .then(checkStatus)
		  .then(resp=>resp.text());

		qs('#modal .d-inline').textContent = "Update ";
		id('edit-result').classList.remove('d-none');
		id('edit').classList.add('d-none');
		qs('.modal-footer').classList.add('d-none');
	}

	async function deleteEntry(e) {
		let modalBody = qs('#modal .modal-body');

		e.preventDefault();
		let eid = modalBody.eid;
		let form = new FormData();
		form.append('id', eid);

		await fetch('/delete', {method: "POST", body: form})
		  .then(checkStatus)
		  .then(resp=>resp.text());

		qs('#modal .d-inline').textContent = "Deletion ";
		id('edit-result').classList.remove('d-none');
		id('edit').classList.add('d-none');
		qs('.modal-footer').classList.add('d-none');
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
			div.classList.add('border');
			div.classList.add('border-dark');
			div.classList.add('rounded')

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

			div.setAttribute("data-toggle", "modal");
			div.setAttribute("data-target", "#modal");

			div.addEventListener('click', function() {
				let date = qs('#modal input[type=date]');
				let amt = qs('#modal input[type=number]');
				let desc = qs('#modal textarea');

				date.value = response[i].date;
				amt.value = response[i].spent;
				desc.value = response[i].description;
				qs('#modal .modal-body').eid = response[i].id;

				id('edit-result').classList.add('d-none');
				id('edit').classList.remove('d-none');
				qs('.modal-footer').classList.remove('d-none');
			})

			displayView.appendChild(div);
		}

		displayView.classList.remove("hidden");
	}

	function createTrashIcon() {
		let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		svg.setAttribute('width', '1em');
		svg.setAttribute('height', '1em');
		svg.setAttribute('viewBox', '0 0 16 16')
		svg.classList.add('bi');
		svg.classList.add('bi-trash');
		svg.setAttribute('fill', 'currentColor');
		svg.setAttribute('xmlns', "http://www.w3.org/2000/svg");

		let path1 = document.createElementNS('http://www.w3.org/svg', 'path');
		path1.setAttribute('d', "M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z");

		let path2 = document.createElementNS('http://www.w3.org/svg', 'path');
		path2.setAttribute('fill-rule', 'evenodd');
		path2.setAttribute('d', "M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4L4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z");

		svg.appendChild(path1);
		svg.appendChild(path2);

		return svg;
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