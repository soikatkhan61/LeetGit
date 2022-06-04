/* 
    (needs patch) 
    IMPLEMENTATION OF AUTHENTICATION ROUTE AFTER REDIRECT FROM GITHUB.
*/

const localAuth = {
    /**
     * Initialize
     */
    init() {
        this.KEY = 'leethub_auth_token';
        this.ACCESS_TOKEN_URL =
            'https://github.com/login/oauth/access_token';
        this.AUTHORIZATION_URL =
            'https://github.com/login/oauth/authorize';
        this.CLIENT_ID = 'b37ae7c40548381c30bf';
        this.CLIENT_SECRET = '5bc58ca87201334693e8c18701e1f380931d61a4';
        this.REDIRECT_URL = 'https://github.com/'; // for example, https://github.com
        this.SCOPES = ['repo'];
    },

    /**
     * Parses Access Code
     *
     * @param url The url containing the access code.
     */
    parseAccessCode(url) {
        if (url.match(/\?error=(.+)/)) {
            chrome.tabs.getCurrent(function (tab) {
                chrome.tabs.remove(tab.id, function () { });
            });
        } else {
            // eslint-disable-next-line
            console.log("code is : " + url.match(/\?code=([\w\/\-]+)/)[1])
            this.requestToken(url.match(/\?code=([\w\/\-]+)/)[1]);
        }
    },

    /**
     * Request Token
     *
     * @param code The access code returned by provider.
     */
    requestToken(code) {
        const that = this;
        const data = new FormData();
        data.append('client_id', this.CLIENT_ID);
        data.append('client_secret', this.CLIENT_SECRET);
        data.append('code', code);

        const xhr = new XMLHttpRequest();
        xhr.addEventListener('readystatechange', function () {

            if (xhr.readyState === 4) {
                console.log(xhr.status)
                if (xhr.status === 200) {
                    console.log("response text: " + xhr.responseText.match(/access_token=([^&]*)/)[1])
                    that.finish(
                        xhr.responseText.match(/access_token=([^&]*)/)[1]
                    );
                } else {
                    chrome.runtime.sendMessage({
                        closeWebPage: true,
                        isSuccess: false,
                    });
                }
            }
        });
        xhr.open('POST', this.ACCESS_TOKEN_URL, true);
        xhr.send(data);
    },

    /**
     * Finish
     *
     * @param token The OAuth2 token given to the application from the github.
     */
    finish(token) {
        /* Get username */
        // To validate user, load user object from GitHub.
        const AUTHENTICATION_URL = 'https://api.github.com/user';

        const xhr = new XMLHttpRequest();
        xhr.addEventListener('readystatechange', function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    console.log("username: " + JSON.parse(xhr.responseText).login)
                    const username = JSON.parse(xhr.responseText).login;
                    chrome.runtime.sendMessage({
                        closeWebPage: true,
                        isSuccess: true,
                        token,
                        username,
                        KEY: this.KEY,
                    });
                }
                console.log(chrome.storage)
            }
        });
        xhr.open('GET', AUTHENTICATION_URL, true);
        xhr.setRequestHeader('Authorization', `token ${token}`);
        xhr.send();
    },
};

localAuth.init(); // load params.
const link = window.location.href;

/* Check for open pipeline */
if (window.location.host === 'github.com') {
    console.log("hello extracting access code to verify this")

    chrome.storage.local.get('pipeline_leethub', (data) => {

        if (data && data.pipeline_leethub) {
            console.log(data.pipeline_leethub)
            localAuth.parseAccessCode(link);
        }
    });
}
