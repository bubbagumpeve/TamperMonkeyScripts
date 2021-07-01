// ==UserScript==
// @name         Gala Treasure Chest Balance Converter
// @namespace    https://openuserjs.org/users/BubbaGumpEve
// @version      1.0.0
// @description  Show your Gala Treasure Chest balance equivalent in native currency
// @copyright    2021, BubbaGumpEve (https://openuserjs.org/users/BubbaGumpEve)
// @author       bubbagumpeve@gmail.com
// @license      MIT
// @match        https://app.gala.games/treasure-chest/
// @icon         https://www.google.com/s2/favicons?domain=gala.games
// @grant        GM_addStyle
// @run-at       document-start
// ==/UserScript==

(function () {
    'use strict';

    let convertToCurrency = 'usd'; // You can use any of the currencies listed below

    let fiats = {
        usd: "$",
        eur: "€",
        gbp: "£",
        jpy: "¥",
        rub: "₽",
        cny: "¥",
        krw: "₩",
        twd: "NT$"
    };

    let currencySymbol = fiats[convertToCurrency];

    GM_addStyle(`
        .mb-0.small-font.chartlink {
            color: lightblue;
        }
      `);

    let roundOff = (num, places) => {
        const x = Math.pow(10, places);
        return (Math.round(num * x) / x).toFixed(places);
    }

    let getExchangeRates = (func) => {
        let exchangeRate = 0.0;
        fetch(`https://api.coingecko.com/api/v3/simple/price?ids=gala&vs_currencies=${convertToCurrency}`, {
            headers: {
                "accept": "application/json"
            }
        })
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
            })
            .then(rates => rates.gala[convertToCurrency])
            .then(rate => func(rate));
    }

    let getFiatBalance = (galaString, exchangeRate) => {
        let gala = parseFloat(galaString);
        return roundOff(exchangeRate * gala, 2);
    }

    let addExchangeBalance = (exchangeRate) => {
        let galaBalanceNode = Array.from(document.querySelectorAll(".mb-0")).filter(function e(x) { return x.innerText.includes("Gala") })[0];
        let gala = galaBalanceNode.firstChild.innerText.replaceAll(",", "");
        let fiatBalanceNode = galaBalanceNode.cloneNode(true);

        fiatBalanceNode.firstChild.innerText = "~ " + currencySymbol + " " + getFiatBalance(gala, exchangeRate);
        fiatBalanceNode.innerHTML = fiatBalanceNode.innerHTML.replaceAll("Gala", "");
        fiatBalanceNode.innerHTML += " <a class='mb-0 small-font chartlink' href='https://www.coingecko.com/en/coins/gala'>DETAILS</a>";
        galaBalanceNode.parentNode.insertBefore(fiatBalanceNode, galaBalanceNode.nextSibling);
    }

    let findTheChild = (node) => {
        if (node !== null && node.nodeType == 1 && node.nodeName != "SCRIPT") {
            let nodeClass = node.getAttribute("class");
            if (nodeClass !== null) {
                console.log("found class", nodeClass);
                if (nodeClass.trim() === "mb-0") {
                    if (node.innerText.includes("Gala")
                        && node.firstElementChild !== null
                        && node.firstElementChild.nodeName === "SPAN") {
                        console.log("found Gala balance", node);
                        getExchangeRates(addExchangeBalance);
                    }
                }
                else {
                    findTheChild(node.firstElementChild);
                    findTheChild(node.nextElementSibling);
                }
            }
        }
    }

    let observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (!mutation.addedNodes) return
            for (let i = 0; i < mutation.addedNodes.length; i++) {
                let node = mutation.addedNodes[i];
                findTheChild(node, "0");
            }
        })
    });

    //
    // UNCOMMENT FOR USE IN LOCAL TEST PAGE

    // $(document).ready(function() {
    //     var config = {
    //         childList: true,
    //         subtree: true,
    //         attributes: false,
    //         characterData: true
    //     };

    //     observer.observe(document.body, config);

    //     let pNode = document.createElement("p");
    //     pNode.setAttribute("data-v-0a828d2a", "");
    //     pNode.setAttribute("class", " mb-0");
    //     pNode.innerHTML = "<span data-v-0a828d2a=\"\"> 3,160 </span> Gala ";
    //     // let pNodeSpan = document.createElement("span");
    //     // pNodeSpan.setAttribute("data-v-0a828d2a", "");
    //     // pNodeSpan.innerText = "3,160";
    //     // pNode.innerText = " Gala ";
    //     // pNode.appendChild(pNodeSpan);
    //     document.body.appendChild(pNode);
    // });

    // Local Test Page: 
    // <!DOCTYPE html>
    // <html>
    // <head>
    //     <meta charset="utf-8" />
    //     <title>Test Page</title>
    //     <script src="https://code.jquery.com/jquery-3.6.0.slim.min.js" integrity="sha256-u7e5khyithlIdTpu22PHhENmPcRdFiHRjhAuHcs05RI=" crossorigin="anonymous"></script>
    //     <script src="app.gala.games.treasure-chest.add.fiat.conversion.js"></script>
    // </head>
    // <body>
    // </body>
    // </html>

})();
