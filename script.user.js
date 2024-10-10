// ==UserScript==
// @name            UP Autologin
// @namespace       University of Potsdam AutoLogin
// @version         0.1.0-alpha
// @icon            https://www.forschungsdaten.org/images/thumb/e/ed/Uni_Potsdam_Logo.png/300px-Uni_Potsdam_Logo.png
// @description     Stop wasting your time entering login credentials or pressing useless buttons! (updated from spyfly)
// @description:de  Verschwende keine Zeit mehr mit dem Eingeben von Anmeldedaten oder dem Drücken sinnloser Tasten!
// @description:ru  Перестань тратить время на ввод данных или кликанье бесполезных кнопок!
// @author          FurTactics
// @supportURL      https://github.com/FurTactics/UP-AutoLogin/issues
// @downloadURL     https://raw.githubusercontent.com/FurTactics/UP-AutoLogin/main/script.user.js
// @updateURL       https://raw.githubusercontent.com/FurTactics/UP-AutoLogin/main/script.user.js
// @match           https://mailup.uni-potsdam.de/*
// @match           https://puls.uni-potsdam.de/*
// @match           https://moodle-efp.uni-potsdam.de/*
// @match           https://idp.uni-potsdam.de/idp/*
// @match           https://moodle2.uni-potsdam.de/*
// @match           https://examup.uni-potsdam.de/*
// @grant           GM_getValue
// @grant           GM_setValue
// @grant           GM_notification
// @grant           GM_registerMenuCommand
// @grant           GM_listValues
// @grant           GM_deleteValue
// ==/UserScript==


(async function () {
    'use strict';
    // Load Configuration values
    var up_creds = {
        username: "",
        password: "",
    }

    // Add login and password, if the storage is empty
    if (GM_getValue("creds") != undefined) {
        up_creds = GM_getValue("creds");
    } else {
        GM_setValue("creds", {
                username: prompt("Enter your login"),
                password: prompt("Enter your password")
            });
    }

    // Small clics statistics
    if (GM_getValue("stats") == undefined) {
        GM_setValue("stats", 0);
    }

    // Some constants
    const isMailUp = (window.location.host == "mailup.uni-potsdam.de");
    const isPULS = (window.location.host == "puls.uni-potsdam.de");
    const isMoodle = (window.location.host == "moodle-efp.uni-potsdam.de");
    const isMoodle2 = (window.location.host == "moodle2.uni-potsdam.de");
    const isIdp = (window.location.host == "idp.uni-potsdam.de") && (window.location.href.includes("/idp/profile/SAML2"));
    const isExam = (window.location.host == "examup.uni-potsdam.de");

    // Add a respect button
    {
        const stat = GM_getValue("stats");

        const menu_command_id_1 = GM_registerMenuCommand("You saved " + stat + " clicks 👍", function(event) {console.clear;console.log("You are awesome. " + stat + " clicks is more than " + Math.round(stat / 60) + " minutes. If you want, you can support me on GitHub https://github.com/FurTactics/")}, {autoClose: false});
        const menu_command_id_2 = GM_registerMenuCommand("Delete all your saved data", function(event) {
            const keys = GM_listValues();
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                GM_deleteValue(key);
            }
            GM_notification({
                text: "Your data has been successfully deleted. \nYou can add your new data by next load one of supported pages",
                title: "UP Autologin",
                url: 'https://github.com/FurTactics/',
                silent: true,
                timeout: 10000,
                onclick: (event) => {}});
        }, {autoClose: true});
    }

    if (isMailUp) {

        const hasLoginField = (document.querySelector('input[name="Username"]') != undefined);

        if (hasLoginField) {
            await enterCreds("Username", "Password");
            var loginSelector = document.querySelector("select[name$='SessionSkin']");
            var loginIndex;

            // Select MinimalPlus as view Option
            for (const option of loginSelector.options) {
                if (option.text == "Standard") {
                    loginIndex = option.index;
                    break;
                }
            }
            loginSelector.selectedIndex = loginIndex;

            GM_setValue("stats", GM_getValue('stats') + 1);

            document.querySelector("button[name$='login']").click();
        }
    } else if (isPULS) {

        const hasLoginField = (document.querySelector('input[name="asdf"]') != undefined);

        if (hasLoginField) {
            await enterCreds("asdf", "fdsa");

            document.getElementsByClassName("pulsButton invert")[0].click();
            GM_setValue("stats", GM_getValue('stats') + 1);
        }
    } else if (isMoodle) {

        const hasLoginField = (document.querySelector('input[name="username"]') != undefined);
        const loginBtn = document.querySelector('a[href="https://moodle-efp.uni-potsdam.de/login/index.php"]');

        if (loginBtn && !window.location.href.includes("login/index.php")) {
            loginBtn.click();
            GM_setValue("stats", GM_getValue('stats') + 1);
        }

        if (hasLoginField) {
            await enterCreds("username", "password");
            document.querySelector("button[id='loginbtn']").click();
            GM_setValue("stats", GM_getValue('stats') + 1);

        }
    } else if (isMoodle2) {
        const loginBtn = document.querySelector('a[href="https://moodle2.uni-potsdam.de/login/index.php"]');

        if (loginBtn && !window.location.href.includes("login/index.php")) {
            loginBtn.click();
            GM_setValue("stats", GM_getValue('stats') + 1);

        }
    } else if (isIdp) {
        const hasLoginField = (document.querySelector('input[name="j_username"]') != undefined);
        if (hasLoginField) {
            await enterCreds("j_username", "j_password");

            document.querySelector("button[name$='_eventId_proceed']").click();
            GM_setValue("stats", GM_getValue('stats') + 1);
        }
    } else if (isExam) {
        const loginBtn = document.querySelector('a[href="https://examup.uni-potsdam.de/login/index.php"]');

        if (loginBtn && !window.location.href.includes("login/index.php")) {
            loginBtn.click();
            GM_setValue("stats", GM_getValue('stats') + 1);

        } else {
            const hasLoginField = (document.querySelector('input[name="username"]') != undefined);
            if (hasLoginField) {
                await enterCreds("username", "password");

                document.querySelector("button[id$='loginbtn']").click();
                GM_setValue("stats", GM_getValue('stats') + 1);
            }
        }
    }

    async function enterCreds(username, password) {
        document.querySelector(`input[name="${username}"]`).value = up_creds.username;
        document.querySelector(`input[name="${password}"]`).value = up_creds.password;

    }
})();
