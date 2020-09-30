"use strict";

(function() {
	window.addEventListener("load", init);
	let uid;
	let divArray;
	let sum;
	let currency;
	/**
	  * Initialize all event listeners
	  * Set uid for session
	  */
	async function init() {
		await fetch('/user')
		  .then(checkStatus)
		  .then(resp => resp.json())
		  .then(resp => {uid = resp.uid; id('username').textContent += " " + resp.username; currency = resp.currency});

		id("input").addEventListener("click", displayInputView);
		id("view").addEventListener('click', displayViewView);
		id("submitInput").addEventListener('click', postInput);
		id("submitView").addEventListener('click', getValues);
		id('save').addEventListener('click', saveChanges);
		id('delete').addEventListener('click', deleteEntry);
		id('filterMenu').addEventListener('click', function(e) {
			e.stopPropagation();
		});
		let sortRadio = qsa('input[name=sort]');
		for (let i = 0; i < sortRadio.length; i++) {
			sortRadio[i].addEventListener('click', changeSortText);
		}
		id('sort').addEventListener('click', function(e) {
			e.preventDefault();
		})

		let currencies = qsa('.currency');
		for (let i = 0; i < currencies.length; i++) {
			currencies[i].textContent = currency;
		}
		populateFilters();
	}

	/** 
	  * Changes the sorted by section of the view view
	  */
	function changeSortText() {
		id('sort').textContent = 'Sort by ' + this.getAttribute('val');
		if (divArray !== undefined) 
			placeDisplay();
	}

	/**
	  * Populate all filters with categories from the backend
	  */
	async function populateFilters() {
		let result = await fetch('/filterList')
		.then(checkStatus)
		.then(resp => resp.json());

		for (let i = 0; i < result.length; i++) {
			let div = document.createElement("div");
			div.classList.add("dropdown-item");

			let input = document.createElement("input");
			input.setAttribute("type", "checkbox");
			input.classList.add("form-check-input");
			input.setAttribute("checked", "true");
			input.setAttribute("name", result[i]);
			input.setAttribute('id', result[i])
			input.addEventListener('click', redisplay)
			div.appendChild(input);

			let label = document.createElement("label");
			label.setAttribute("for", result[i]);
			label.classList.add("form-check-label");
			label.classList.add('d-block');
			label.textContent = result[i];
			div.appendChild(label);

			id("filterMenu").appendChild(div);
		}

		for (let i = 0; i < result.length; i++) {
			let div = document.createElement('div');
			div.classList.add('dropdown-item');

			let input = document.createElement('input');
			if (i == 0) {
				input.setAttribute('checked', true);
			}
			input.classList.add('form-check-input');
			input.addEventListener('click', updateCategoryText);
			input.setAttribute('type', 'radio');
			input.setAttribute('name', 'category');
			input.setAttribute('id', result[i] + "2");
			input.value = result[i];
			input.val = result[i];
			div.appendChild(input);

			let label = document.createElement("label");
			label.classList.add("form-radio-label");
			label.classList.add('d-block');
			label.setAttribute('for', result[i] + "2");
			label.textContent = result[i];
			div.appendChild(label);

			id('categoryDropdown').appendChild(div);
		}

		for (let i = 0; i < result.length; i++) {
			let div = document.createElement('div');
			div.classList.add('dropdown-item');

			let input = document.createElement('input');
			if (i == 0) {
				input.setAttribute('checked', true);
			}
			input.classList.add('form-check-input');
			input.addEventListener('click', updateCategoryText);
			input.setAttribute('type', 'radio');
			input.setAttribute('name', 'category');
			input.setAttribute('id', result[i] + "3");
			input.value = result[i];
			input.val = result[i];
			div.appendChild(input);

			let label = document.createElement("label");
			label.classList.add("form-radio-label");
			label.classList.add('d-block');
			label.setAttribute('for', result[i] + "3");
			label.textContent = result[i];
			div.appendChild(label);

			id('categoryDropdown2').appendChild(div);
		}

		id('category-text').textContent = result[0];
	}

	/**
	  *	Display toggle hidden on clicked result
	  */
	function redisplay() {
		let displayView = id('displayView');
		
		for (let i = 0; i < displayView.children.length; i++) {
			if (this.name === displayView.children[i].category) {
				if (this.checked){
					sum += parseFloat(displayView.children[i].spent);
					displayView.children[i].classList.remove('d-none');
				}
				else {
					sum -= parseFloat(displayView.children[i].spent);
					displayView.children[i].classList.add('d-none');
				}
			}
		}

		id('sum').textContent = "Total = " + currency + sum; 
	}

	/**
	  * Given a number, returns it as a string format
	  */
	function formatNumber(number) {
		let result = "";
		let count = 0;
		number = number.toString();

		let indexOfDot = number.length;

		for (let i = 0; i < number.length; i++) {
			if (number.charAt(i) === '.') {
				indexOfDot = i;
				break;
			}
		} 

		for (let i = number.length - 1; i >= indexOfDot; i--) {
			result = number.charAt(i) + result;
		}

		for (let i = indexOfDot - 1; i >= 0; i--) {
			if (count != 0 && count % 3 === 0) {
				result = "," + result;
			}
			result = number.charAt(i) + result;
			count++;
		}

		return result;
	}

	/**
	  * Updates the text that specifies category in input view
	  */
	function updateCategoryText() {
		id('category-text').textContent = qs('input[name=category]:checked').val;
		id('category-text2').textContent = qs('#modal input[name=category]:checked').val;
	}

	/**
	  * Save changes made while editing modal
	  */
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

		getValues(e);
	}

	/**
	  * Delete a specified entry
	  */
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

		getValues(e);
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
		divArray = [];
		sum = 0;

		for (let i = 0; i < response.length; i++) {
			let div = document.createElement("div");
			div.classList.add("viewEntry");
			div.classList.add('border');
			div.classList.add('border-dark');
			div.classList.add('rounded')
			div.date = response[i].date;
			div.spent = response[i].spent;
			div.description = response[i].description;
			div.category = response[i].category;

			if (!qs('#filterMenu input[name=\"' + div.category + '\"]').checked) {
				div.classList.add('d-none');
			}

			let p = document.createElement("p");
			p.textContent = response[i].date;
			p.classList.add("amtAndDate");
			div.appendChild(p);

			p = document.createElement("p");
			p.textContent = currency +  formatNumber(response[i].spent);
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
				let modal = qs('#modal input[id=\"' + response[i].category + '3\"]');

				date.value = response[i].date;
				amt.value = response[i].spent;
				desc.value = response[i].description;
				modal.setAttribute('checked', true);
				modal.click();
				qs('#modal .modal-body').eid = response[i].id;

				id('edit-result').classList.add('d-none');
				id('edit').classList.remove('d-none');
				qs('.modal-footer').classList.remove('d-none');
			});

			sum += parseFloat(div.spent);
			divArray.push(div);
		}

		placeDisplay();
	}

	/**
	  * Compares 2 dates of format yyyy-mm-dd
	  */
	function compareDate(date1, date2) {
		let year1 = date1.substring(0, 4);
		let year2 = date2.substring(0, 4);
		if (year1 > year2) {
			return 1;
		} else if (year2 > year1) {
			return -1;
		} else {
			let month1 = date1.substring(5, 7);
			let month2 = date2.substring(5, 7);

			if (month1 > month2) {
				return 1;
			} else if (month2 > month1) {
				return -1;
			} else {
				let day1 = date1.substring(8);
				let day2 = date2.substring(8);
				if (day1 > day2) {
					return 1;
				} else if (day2 > day1) {
					return -1;
				} else {
					return 0;
				}
			}
		}
	}

	/**
	  * Renders all divs corresponding to the order of divArray
	  */
	function placeDisplay() {
		let displayView = id("displayView");
		let h2sum = id('sum');
		displayView.innerHTML = "";
		h2sum.textContent = "";
		if (divArray.length === 0) {
			let h2 = document.createElement("h2");
			h2.textContent = "No data found.";

			displayView.appendChild(h2);
			return; 
		}

		let sortBy = qs('input[name=sort]:checked').getAttribute('val');

		if (sortBy === 'most recent') {
			divArray.sort((a, b) => compareDate(b.date, a.date));
		} else if (sortBy === 'least recent') {
			divArray.sort((a, b) => compareDate(a.date, b.date));
		} else if (sortBy === 'least expensive') {
			divArray.sort((a, b) => a.spent - b.spent);
		} else {
			divArray.sort((a, b) => b.spent - a.spent);
		}

		for (let i = 0; i < divArray.length; i++) {
			displayView.appendChild(divArray[i]);
		}

		h2sum.textContent = "Total = " + currency + formatNumber(sum);
	}

	/**
	  * Submits user expense into database
	  */
	async function postInput(e) {
		let date = qs("#inputView input[type=date]").value; 
		let amount = qs("#inputView input[type=number]").value;
		let description = qs("#inputView textarea").value;
		let category = qs('input[name=category]:checked').val;


		if (date === "" || amount === "" || description === "") {
			return;
		}


		e.preventDefault();

		let requestBody = new FormData();
		requestBody.append("uid", uid);
		requestBody.append("date", date);
		requestBody.append("amount", amount);
		requestBody.append("description", description);
		requestBody.append('category', category);

		let response = await fetch("/input", {method : "POST", body : requestBody})
		  .then(checkStatus)
		  .then(resp => resp.text());

		let message = qs("#inputView h2");
		message.classList.remove("d-none");
		displayInputView();
	}

	/**
	  * Displays and resets the input view. Closes view view.
	  */
	function displayInputView() {
		let inputs = qsa("#inputView input[type=number], #inputView textarea");

		for (let i = 0; i < inputs.length; i++) {
			inputs[i].value = "";
		}

		id("inputView").classList.remove("d-none");
		id("viewView").classList.add("d-none");
	}

	/**
	  * Displays and resess the view view. Closes the input view
	  */
	function displayViewView() {
		let inputs = qsa("#viewView input");

		for (let i = 0; i < inputs.length; i++) {
			inputs[i].value = "";
		}

		id("inputView").classList.add("d-none");
		id("viewView").classList.remove("d-none");
		setCalendarLimit();
	}

	/**
	  * Sets all calendar's max attribute into today
	  */
	function setCalendarLimit() {
		let date = new Date();

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