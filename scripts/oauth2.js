
const oAuth2 = {
    /**
     * Initialize
     */
    init() {
      this.KEY = 'leethub_auth_token';
      this.ACCESS_TOKEN_URL =
        'https://github.com/login/oauth/access_token';
      this.AUTHORIZATION_URL =
        'https://github.com/login/oauth/authorize';
      this.CLIENT_ID = 'beb4f0aa19ab8faf5004';
      this.CLIENT_SECRET = '5bc58ca87201334693e8c18701e1f380931d61a4';
      this.REDIRECT_URL = 'https://github.com/'; // for example, https://github.com
      this.SCOPES = ['repo'];
    },
  
  
  //https://github.com/login/oauth/authorize?client_id=beb4f0aa19ab8faf5004&redirect_uri=https://github.com/&scope=
  
    /**
     * Begin
     */
    begin() {
      this.init(); // secure token params.
  
      let url = `${this.AUTHORIZATION_URL}?client_id=${this.CLIENT_ID}&redirect_uri${this.REDIRECT_URL}&scope=`;
  
      for (let i = 0; i < this.SCOPES.length; i += 1) {
        url += this.SCOPES[i];
      }
  
      chrome.storage.local.set({ pipeline_leethub: true }, () => {
        // opening pipeline_leethub temporarily
  
        chrome.tabs.create({ url, active: true }, function () {
          window.close();
          chrome.tabs.getCurrent(function (tab) {
            chrome.tabs.remove(tab.id, function () {});
          });
        });
      });
    },
  };
  