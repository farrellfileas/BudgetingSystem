"use strict";

(function() {
    window.addEventListener("load", init);

    function init() {
        id("input").addEventListener("click", displayInputView);
        id("view").addEventListener("click", displayViewView);
        setCalendarLimit();
        id("submitInput").addEventListener("click", postInput);
    }

    function postInput() {
        let date = qs("#inputView input[type=date]").value;
        let amount = qs("#inputView input[type=number").value;
        let description = qs("#inputView input[type=text]").value;
        
        let requestBody = new FormData();
        requestBody.append("date", date);
        requestBody.append("amount", amount);
        requestBody.append("description", description);
    
        fetch("/input", {method : "POST", body : requestBody})
        .then(checkStatus)
        .then(resp => resp.text())
        .then(pront);
    }

    function pront(resp) {
        console.log(resp);
    }

    function checkStatus(response) {
        if(response.ok) {
            return response;
        }
        throw Error("Error in request: " + response.statusText());
    }

    function displayInputView() {
        qs("#inputView").classList.remove("hidden");
        qs("#viewView").classList.add("hidden");
        resetValues("#inputView");
    }

    function displayViewView() {
        qs("#viewView").classList.remove("hidden");
        qs("#inputView").classList.add("hidden");
        resetValues("#viewView");
    }

    function resetValues(selector) {
        let arrayOfInput = qsa(selector + " input");
        for (let i = 0; i < arrayOfInput.length; i++) {
            arrayOfInput[i].value = "";
        }
    }

    function setCalendarLimit() {
        let date = new Date();
        let currYear = date.getFullYear();
        let currMonth = date.getMonth() + 1;
        let currDay = date.getDate();

        if(currMonth < 10) {
            currMonth = "0" + currMonth;
        }
        if(currDay < 10) {
            currDay = "0" + currDay;
        }

        let today = currYear + "-" + currMonth + "-" + currDay;
        let calendars = qsa("input[type=date]");
        for (let i = 0; i < calendars.length; i++) {
            calendars[i].max = today;
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