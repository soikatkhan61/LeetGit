var selectedRepo = document.getElementById('type');
const option = () => {
    return selectedRepo.value
};

let repoName = document.getElementById('name')
const repositoryName = () => {
    console.log(repoName.value.trim())
    return repoName.value.trim();
};

/* Status codes for creating of repo */

//GLOBAL VARIABLE

let success = document.getElementById('success')
let error = document.getElementById('error')
let unlink = document.getElementById('unlink')


let p_solved = document.getElementById('commit_mode')
let p_solved_easy = document.getElementById('p_solved_easy')
let p_solved_medium = document.getElementById('p_solved_medium')
let p_solved_hard = document.getElementById('p_solved_hard')

let hook_button = document.getElementById('hook_button')
let unlink_a = document.getElementById('unlink_a')

const statusCode = (res, status, name) => {
    switch (status) {
        case 304:
            success.style.display = 'none'
            error.innerText = `Error creating ${name} - Unable to modify repository. Try again later!`
            error.style.display = 'block'
            break;

        case 400:
            success.style.display = 'none'
            error.innerText = `Error creating ${name} - Bad POST request, make sure you're not overriding any existing scripts`,
                error.style.display = 'block'
            break;

        case 401:
            success.style.display = 'none'
            error.innerText = `Error creating ${name} - Unauthorized access to repo. Try again later!`
            error.style.display = 'block'
            break;

        case 403:
            success.style.display = 'none'
            error.innerText = `Error creating ${name} - Forbidden access to repository. Try again later!`
            error.style.display = 'block'
            break;

        case 422:
            success.style.display = 'none'
            error.innerText = `Error creating ${name} - Unprocessable Entity. Repository may have already been created. Try Linking instead (select 2nd option).`
            error.style.display = 'block'
            break;

        default:
            /* Change mode type to commit */
            chrome.storage.local.set({ mode_type: 'commit' }, () => {
                error.style.display = 'none'
                success.innerHTML = `Successfully created <a target="blank" href="${res.html_url}">${name}</a>. Start <a href="http://leetcode.com">LeetCoding</a>!`
                success.style.display = 'block'
                unlink.style.display = 'block'
                /* Show new layout */
                document.getElementById('hook_mode').style.display = 'none';
                document.getElementById('commit_mode').style.display =
                    'inherit';
            });
            /* Set Repo Hook */
            chrome.storage.local.set(
                { leethub_hook: res.full_name },
                () => {
                    console.log('Successfully set new repo hook');
                },
            );

            break;
    }
};

const createRepo = (token, name) => {
    const AUTHENTICATION_URL = 'https://api.github.com/user/repos';
    let data = {
        name,
        private: true,
        auto_init: true,
        description:
            'Collection of LeetCode questions to ace the coding interview! - Created using [LeetHub](https://github.com/QasimWani/LeetHub)',
    };
    data = JSON.stringify(data);

    const xhr = new XMLHttpRequest();
    xhr.addEventListener('readystatechange', function () {
        if (xhr.readyState === 4) {
            statusCode(JSON.parse(xhr.responseText), xhr.status, name);
        }
    });

    xhr.open('POST', AUTHENTICATION_URL, true);
    xhr.setRequestHeader('Authorization', `token ${token}`);
    xhr.setRequestHeader('Accept', 'application/vnd.github.v3+json');
    xhr.send(data);
};

/* Status codes for linking of repo */
const linkStatusCode = (status, name) => {
    let bool = false;
    switch (status) {
        case 301:
            success.style.display = 'none'
            error.innerHTML = `Error linking <a target="blank" href="${`https://github.com/${name}`}">${name}</a> to LeetHub. <br> This repository has been moved permenantly. Try creating a new one.`
            error.style.display = 'block'
            break;

        case 403:
            success.style.display = 'none'
            error.innerHTML = `Error linking <a target="blank" href="${`https://github.com/${name}`}">${name}</a> to LeetHub. <br> Forbidden action. Please make sure you have the right access to this repository.`
            error.style.display = 'block'
            break;

        case 404:
            success.style.display = 'none'
            error.innerHTML = `Error linking <a target="blank" href="${`https://github.com/${name}`}">${name}</a> to LeetHub. <br> Resource not found. Make sure you enter the right repository name.`
            error.style.display = 'block'
            break;

        default:
            bool = true;
            break;
    }
    unlink.style.display = 'block'
    return bool;
};

/* 
    Method for linking hook with an existing repository 
    Steps:
    1. Check if existing repository exists and the user has write access to it.
    2. Link Hook to it (chrome Storage).
*/
const linkRepo = (token, name) => {
    const AUTHENTICATION_URL = `https://api.github.com/repos/${name}`;

    const xhr = new XMLHttpRequest();
    xhr.addEventListener('readystatechange', function () {
        if (xhr.readyState === 4) {
            const res = JSON.parse(xhr.responseText);
            const bool = linkStatusCode(xhr.status, name);
            if (xhr.status === 200) {
                // BUG FIX
                if (!bool) {
                    // unable to gain access to repo in commit mode. Must switch to hook mode.
                    /* Set mode type to hook */
                    chrome.storage.local.set({ mode_type: 'hook' }, () => {
                        console.log(`Error linking ${name} to LeetHub`);
                    });
                    /* Set Repo Hook to NONE */
                    chrome.storage.local.set({ leethub_hook: null }, () => {
                        console.log('Defaulted repo hook to NONE');
                    });

                    /* Hide accordingly */
                    document.getElementById('hook_mode').style.display =
                        'inherit';
                    document.getElementById('commit_mode').style.display =
                        'none';
                } else {
                    /* Change mode type to commit */
                    /* Save repo url to chrome storage */
                    chrome.storage.local.set(
                        { mode_type: 'commit', repo: res.html_url },
                        () => {
                            error.style.display = 'none'
                            success.innerHTML = `Successfully linked <a target="blank" href="${res.html_url}">${name}</a> to LeetHub. Start <a href="http://leetcode.com">LeetCoding</a> now!`
                            success.style.display = 'block'
                            unlink.style.display = 'block'
                        },
                    );
                    /* Set Repo Hook */
                    chrome.storage.local.set(
                        { leethub_hook: res.full_name },
                        () => {
                            console.log('Successfully set new repo hook');
                            /* Get problems solved count */
                            chrome.storage.local.get('stats', (psolved) => {
                                const { stats } = psolved;
                                if (stats && stats.solved) {
                                    p_solved.innerText = stats.solved
                                    p_solved_easy.innerText = stats.easy
                                    p_solved_medium.innerText = stats.medium
                                    p_solved_hard.innerText = stats.hard

                                }
                            });
                        },
                    );
                    /* Hide accordingly */
                    document.getElementById('hook_mode').style.display = 'none';
                    document.getElementById('commit_mode').style.display =
                        'inherit';
                }
            }
        }
    });

    xhr.open('GET', AUTHENTICATION_URL, true);
    xhr.setRequestHeader('Authorization', `token ${token}`);
    xhr.setRequestHeader('Accept', 'application/vnd.github.v3+json');
    xhr.send();
};

const unlinkRepo = () => {
    /* Set mode type to hook */
    chrome.storage.local.set({ mode_type: 'hook' }, () => {
        console.log(`Unlinking repo`);
    });
    /* Set Repo Hook to NONE */
    chrome.storage.local.set({ leethub_hook: null }, () => {
        console.log('Defaulted repo hook to NONE');
    });

    /* Hide accordingly */
    document.getElementById('hook_mode').style.display = 'inherit';
    document.getElementById('commit_mode').style.display = 'none';
};

/* Check for value of select tag, Get Started disabled by default */

// $('#type').on('change', function () {
//     const valueSelected = this.value;
//     if (valueSelected) {
//         $('#hook_button').attr('disabled', false);
//     } else {
//         $('#hook_button').attr('disabled', true);
//     }
// });

hook_button.addEventListener('click', () => {
    /* on click should generate: 1) option 2) repository name */
    if (!option()) {
        error.innerText = 'No option selected - Pick an option from dropdown menu below that best suits you!'
        error.style.display = 'block'
    } else if (!repositoryName()) {
         error.innerText =  'No repository name added - Enter the name of your repository!',
        repoName.focus();
        error.style.display = 'block'
    } else {
        error.style.display = 'none'
        success.innerText = 'Attempting to create Hook... Please wait.'
        success.style.display = 'block'

        /* 
          Perform processing
          - step 1: Check if current stage === hook.
          - step 2: store repo name as repoName in chrome storage.
          - step 3: if (1), POST request to repoName (iff option = create new repo) ; else display error message.
          - step 4: if proceed from 3, hide hook_mode and display commit_mode (show stats e.g: files pushed/questions-solved/leaderboard)
        */
        console.log(chrome.storage.local);
        chrome.storage.local.get('leethub_auth_token', (data) => {
            const token = data.leethub_auth_token;
            if (token === null || token === undefined) {
                /* Not authorized yet. */
                error.innerText = 'Authorization error - Grant LeetHub access to your GitHub account to continue (launch extension to proceed)',
                error.style.display = 'block'
                success.style.display = 'none'
            } else if (option() === 'new') {
                createRepo(token, repositoryName());
            } else {
                chrome.storage.local.get('leethub_username', (data2) => {
                    const username = data2.leethub_username;
                    if (!username) {
                        /* Improper authorization. */
                        error.innerText = 'Improper Authorization error - Grant LeetHub access to your GitHub account to continue (launch extension to proceed)',

                        error.style.display = 'block'
                        success.style.display = 'none'
                    } else {
                        linkRepo(token, `${username}/${repositoryName()}`, false);
                    }
                });
            }
        });
    }
});

unlink_a.addEventListener('click', () => {
    unlinkRepo();
    unlink.style.display = 'none'
    success.innerText = 'Successfully unlinked your current git repo. Please create/link a new hook.'
});

/* Detect mode type */
chrome.storage.local.get('mode_type', (data) => {
    const mode = data.mode_type;

    if (mode && mode === 'commit') {
        /* Check if still access to repo */
        chrome.storage.local.get('leethub_auth_token', (data2) => {
            const token = data2.leethub_auth_token;
            if (token === null || token === undefined) {
                /* Not authorized yet. */
                error.innerText = 'Authorization error - Grant LeetHub access to your GitHub account to continue (click LeetHub extension on the top right to proceed)',
                    error.style.display = 'block'
                success.style.display = 'none'
                /* Hide accordingly */
                document.getElementById('hook_mode').style.display =
                    'inherit';
                document.getElementById('commit_mode').style.display = 'none';
            } else {
                /* Get access to repo */
                chrome.storage.local.get('leethub_hook', (repoName) => {
                    const hook = repoName.leethub_hook;
                    if (!hook) {
                        /* Not authorized yet. */
                        error.innerText = 'Improper Authorization error - Grant LeetHub access to your GitHub account to continue (click LeetHub extension on the top right to proceed)'
                        error.style.display = 'block'
                        success.style.display = 'none'
                        /* Hide accordingly */
                        document.getElementById('hook_mode').style.display =
                            'inherit';
                        document.getElementById('commit_mode').style.display =
                            'none';
                    } else {
                        /* Username exists, at least in storage. Confirm this */
                        linkRepo(token, hook);
                    }
                });
            }
        });

        document.getElementById('hook_mode').style.display = 'none';
        document.getElementById('commit_mode').style.display = 'inherit';
    } else {
        document.getElementById('hook_mode').style.display = 'inherit';
        document.getElementById('commit_mode').style.display = 'none';
    }
});
