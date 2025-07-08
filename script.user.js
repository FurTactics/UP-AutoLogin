// ==UserScript==
// @name            UP Autologin
// @namespace       University of Potsdam AutoLogin
// @version         0.1.1
// @icon            https://www.forschungsdaten.org/images/thumb/e/ed/Uni_Potsdam_Logo.png/300px-Uni_Potsdam_Logo.png
// @description     Stop wasting your time entering login credentials or pressing useless buttons!
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
// @match           https://github.com/FurTactics/UP-AutoLogin/*
// @grant           GM_getValue
// @grant           GM_setValue
// @grant           GM_notification
// @grant           GM_registerMenuCommand
// @grant           GM_listValues
// @grant           GM_deleteValue
// ==/UserScript==

(async function () {
    'use strict';

    // Enum type in js
    const ButtonType = {
        name: 0,
        id:1,
        class: 2
    }
    // Load Configuration values
    var up_creds;

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

    // Add max number of attempts and waiting time to avoid getting stuck if smth went wrong
    const maxAttempts = 2;
    const waitTime = 10000; // 10 seconds is enough

    // Add respect and delete all data buttons
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
        let username;
        if (window.location.href.includes("/samoware")) {
            username = "username";
        } else {
            username = "Username";
        }
        const hasLoginField = (document.querySelector(`input[name="${username}"]`) != undefined);
        if (hasLoginField) {
            await enterCreds(username, "Password");
            if (!window.location.href.includes("/samoware")) {
                var loginSelector = document.querySelector("select[name$='SessionSkin']");
                var loginIndex;

                // Select Standart as view Option (there are also Minimal and MinimalPlus)
                for (const option of loginSelector.options) {
                    if (option.text == "Standard") {
                        loginIndex = option.index;
                        break;
                    }
                }
                loginSelector.selectedIndex = loginIndex;
            }
            if (document.querySelector(`input[name="Password"]`).value.length > 0) {
                if (window.location.href.includes("samoware")) {
                    //document.querySelector('input[type="submit"][name="login"]').click();
                } else {
                    pressLoginButton(ButtonType.name, 'login');
                }
            }

            GM_setValue("stats", GM_getValue('stats') + 1);
        }
    } else if (isPULS) {

        const hasLoginField = (document.querySelector('input[name="asdf"]') != undefined);

        if (hasLoginField) {
            await enterCreds("id", "asdf", "fdsa");
            pressLoginButton(ButtonType.id, 'loginForm:login');
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
            await enterCreds("name", "username", "password");
            pressLoginButton(ButtonType.id, 'loginbtn');
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
            await enterCreds("name", "j_username", "j_password");

            pressLoginButton(ButtonType.name, '_eventId_proceed');
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
                await enterCreds("name", "username", "password");

                pressLoginButton(ButtonType.id, 'loginbtn');
                GM_setValue("stats", GM_getValue('stats') + 1);
            }
        }
    }

    async function enterCreds(type, username, password) {
        document.querySelector(`input[${type}="${username}"]`).value = up_creds.username;
        document.querySelector(`input[${type}="${password}"]`).value = up_creds.password;
    }

    function pressLoginButton(type, buttonName) {
        let lastAttemptTime = GM_getValue('lastAttemptTime') ? parseInt(GM_getValue('lastAttemptTime')) : 0;
        const currentTime = Date.now();
        if ((currentTime - lastAttemptTime) > waitTime) {
            GM_setValue('loginAttempts', 0);
        }
        let attempt = GM_getValue('loginAttempts') ? parseInt(GM_getValue('loginAttempts')) : 0;
        if (attempt < maxAttempts) {
            GM_setValue('loginAttempts', ++attempt);
            GM_setValue('lastAttemptTime', currentTime);
            if (type === ButtonType.id) {
                document.querySelector(`button[id$='${buttonName}']`).click();
            } else if (type === ButtonType.name) {
                document.querySelector(`button[name$='${buttonName}']`).click();
            } else if (type === ButtonType.class) {
                document.getElementsByClassName(`${buttonName}`)[0].click();
            }
        } else {
            const timeLeft = Math.ceil((waitTime - (currentTime - lastAttemptTime)) / 1000);
            console.log(`Too many attempts. Please wait ${timeLeft} seconds and reload the page.`);
        }
    }


})();
