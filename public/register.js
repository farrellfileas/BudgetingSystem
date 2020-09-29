"use strict";

(function() {
	window.addEventListener("load", init);

	/**
	  * Initializes all event listeners
	  */
	function init() {
		id("reg-form").addEventListener('submit', processRegistration);
		id("retype").addEventListener('keyup', checkPasswords);
		id('password').addEventListener('keyup', checkPasswords);
	}

 	/**
 	  * Checks both password and retyped password
 	  * Will highlight any mistakes
 	  */
	function checkPasswords() {
		let pass = id('password');
		let retype = id('retype');
		if (pass.value.length < 6) {
			pass.classList.add('border-danger');
			pass.classList.remove('border-success');
			id('password-invalid').classList.add('d-block');
			qs('button').disabled = true;
			return false;
		} else {
			pass.classList.remove('border-danger');
			pass.classList.add('border-success');
			id('password-invalid').classList.remove('d-block');
		}

		if (this === pass) {
			return;
		}

		if (pass.value !== retype.value) {
			retype.classList.add('border-danger');
			retype.classList.remove('border-success');
			id('retype-invalid').classList.add("d-block");
			qs('button').disabled = true;
			return false;
		} else {
			retype.classList.remove('border-danger');
			retype.classList.add('border-success');
			id('retype-invalid').classList.remove('d-block');
		}

		qs('button').disabled = false;
		return true;
	}

	/**
	  * Does a post request upon registration submission.
	  * Gives feedback on mistakes
	  */
	async function processRegistration(evt) {
		evt.preventDefault();
		if (!checkPasswords()) {
			return;
		}
		let formData = new FormData(this);
		let resp = await fetch('/register', {method: 'POST', body: formData})
		  .then(checkStatus)
		  .then(resp => resp.json());
		
		if (resp.message != "Success") {
			let invalid = id('username-exists');
			invalid.textContent += resp.message;
			invalid.classList.add('d-block');
			qs('input[name=username]').classList.add('border-danger');
		} else {
			id('success').classList.remove('d-none');
			qs('form').classList.add('d-none');
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

	function id(id) {
		return document.getElementById(id);
	}
})();