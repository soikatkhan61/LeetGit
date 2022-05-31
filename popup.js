/* global oAuth2 */
/* eslint no-undef: "error" */

let action = false;

let authenticate = document.getElementById('authenticate')
let auth_mode = document.getElementById('auth_mode')
let hook_mode = document.getElementById('hook_mode')
let commit_mode = document.getElementById('commit_mode')

let p_solved = document.getElementById('commit_mode')
let p_solved_easy = document.getElementById('p_solved_easy')
let p_solved_medium = document.getElementById('p_solved_medium')
let p_solved_hard = document.getElementById('p_solved_hard')


let repo_url = document.getElementById('repo_url')


authenticate.addEventListener('click', () => {
    if (action) {
        oAuth2.begin()
    }
})



/* Get URL for welcome page */

/*
$('#welcome_URL').attr('href',chrome.runtime.getURL('welcome.html'));
$('#hook_URL').attr('href',chrome.runtime.getURL('welcome.html'));
*/

chrome.storage.local.get('leethub_auth_token', (data) => {
    const token = data.leethub_auth_token;
    console.log("leethub auth token is: " + token)
    if (token === null || token === undefined) {
        console.log("Token cannot find")
        action = true;
        auth_mode.style.display = "block"
    }
    else {
        console.log("Token found")
        // To validate user, load user object from GitHub.
        const AUTHENTICATION_URL = 'https://api.github.com/user';

        const xhr = new XMLHttpRequest();
        xhr.addEventListener('readystatechange', function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    // Show MAIN FEATURES 
                    chrome.storage.local.get('mode_type', (data2) => {
                        if (data2 && data2.mode_type === 'commit') {
                            commit_mode.style.display = "block"
                            // Get problem stats and repo link
                            chrome.storage.local.get(
                                ['stats', 'leethub_hook'],
                                (data3) => {
                                    const { stats } = data3;
                                    if (stats && stats.solved) {
                                        p_solved.innerText = stats.solved;
                                        p_solved_easy.innerText = stats.easy;
                                        p_solved_medium.innerText = stats.medium;
                                        p_solved_hard.innerText = stats.hard;
                                    }
                                    const leethubHook = data3.leethub_hook;
                                    if (leethubHook) {
                                        repo_url.innerHTML = `<a target="blank" style="color: cadetblue !important; font-size:0.8em;" href="https://github.com/${leethubHook}">${leethubHook}</a>`

                                    }
                                },
                            );
                        } else {
                            hook_mode.style.display = "block"
                        }
                    });
                } else if (xhr.status === 401) {
                    // bad oAuth
                    // reset token and redirect to authorization process again!
                    chrome.storage.local.set({ leethub_auth_token: null }, () => {
                        console.log(
                            'BAD oAuth!!! Redirecting back to oAuth process',
                        );
                        action = true;
                        auth_mode.style.display = "block"
                    });
                }
            }
        });
        xhr.open('GET', AUTHENTICATION_URL, true);
        xhr.setRequestHeader('Authorization', `token ${token}`);
        xhr.send();
    }
});
