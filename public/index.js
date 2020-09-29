"use strict";

(function() {
    window.addEventListener("load", init);

    function init() {
        id("input").addEventListener("click", displayInputView);
        id("view").addEventListener("click", displayViewView);
        setCalendarLimit();
        id("submitInput").addEventListener("click", postInput);
        id("submitView").addEventListener("click", getInfo);
    }

    function postInput() {
        let date = qs("#inputView input[type=date]").value;
        let amount = qs("#inputView input[type=number").value;
        let description = qs("#inputView input[type=text]").value;
        
        if (date != "" && amount != "" && description != "") {
            let requestBody = new FormData();
            requestBody.append("date", date);
            requestBody.append("amount", amount);
            requestBody.append("description", description);
    
            fetch("/input", {method : "POST", body : requestBody})
            .then(checkStatus)
            .then(resp => resp.text())
            .then(pront);
            resetValues("#inputView");
        }
    }

    async function getInfo() {
        let start = qs("#viewView .start").value;
        let end = qs("#viewView .end").value;
        
        if(start != "" && end != "") {
            let url = "/expenses?start=" + start + "&end=" + end;
            let response = await fetch(url, {method: "GET"})
            .then(checkStatus)
            .then(resp => resp.json())

            qs("#displayView").classList.remove("hidden");

            console.log(response);

            id("displayView").innerHTML = "";
            for (let i = 0; i < response.length; i++) {
                let div = document.createElement("div");
                div.classList.add("viewEntry");

                let p = document.createElement("p");
                p.textContent = "Date: " + response[i].date;
                div.appendChild(p);
                
                let u = document.createElement("p");
                u.textContent = "$" + response[i].spent;
                div.appendChild(u);

                let k = document.createElement("p");
                k.textContent = "Description: " + response[i].description;
                div.appendChild(k);

                id("displayView").appendChild(div);
            }
        }
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
        qs("#displayView").classList.add("hidden");
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