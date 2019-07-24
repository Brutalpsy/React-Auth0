import auth0 from 'auth0-js';

const REDIRECT_ON_LOGIN = 'redirect_on_login';
// eslint-disable-next-line
let _idToken = null;
let _accessToken = null;
let _scopes = null;
let _expiresAt = null;

export default class Auth {
  constructor(history) {
    this.history = history;
    this.userProfile = null;
    this.requestedScopes = 'openid profile email read:courses';

    this.auth0 = new auth0.WebAuth({
      domain: process.env.REACT_APP_AUTH0_DOMAIN,
      clientID: process.env.REACT_APP_AUTH0_CLIENT_ID,
      redirectUri: process.env.REACT_APP_AUTH0_CALLBACK_URL,
      audience: process.env.REACT_APP_AUTH0_AUDIENCE,
      responseType: 'token id_token',
      scope: this.requestedScopes
    });
  }

  login = () => {
    localStorage.setItem(
      REDIRECT_ON_LOGIN,
      JSON.stringify(this.history.location)
    );
    this.auth0.authorize();
  };
  handleAuthentication = () => {
    this.auth0.parseHash((err, result) => {
      if (result && result.accessToken && result.idToken) {
        this.setSession(result);

        //  this.history.push('/');
        const redirectLocation = localStorage.getItem(REDIRECT_ON_LOGIN)
          ? JSON.parse(localStorage.getItem(REDIRECT_ON_LOGIN))
          : '/';
        this.history.push(redirectLocation);
      } else if (err) {
        this.history.push('/');
        alert(`error: ${err.error}. Check the console for further details`);
        console.log(err);
      }
      localStorage.removeItem(REDIRECT_ON_LOGIN);
    });
  };

  setSession = authResult => {
    _expiresAt = authResult.expiresIn * 1000 + new Date().getTime();

    _scopes = authResult.scope || this.requestedScopes || '';
    _accessToken = authResult.accessToken;
    _idToken = authResult.idToken;

    this.scheduleTokenRenewal();
  };

  isAuthenticated = () => {
    return new Date().getTime() < _expiresAt;
  };

  logout = () => {
    _accessToken = null;
    _idToken = null;
    _expiresAt = null;
    _scopes = null;

    this.auth0.logout({
      clientID: process.env.REACT_APP_AUTH0_CLIENT_ID,
      returnTo: 'http://localhost:3000/'
    });
    this.history.push('/');
  };

  getAccessToken = () => {
    if (!_accessToken) {
      throw new Error('No access token found.');
    }
    return _accessToken;
  };

  getProfile = cb => {
    if (this.userProfile) return cb(this.userProfile);

    this.auth0.client.userInfo(this.getAccessToken(), (err, profile) => {
      if (profile) this.userProfile = profile;
      cb(profile, err);
    });
  };

  userHasScopes = scopes => {
    const grantedScopes = _scopes || ''.split(' ');
    return scopes.every(scope => grantedScopes.includes(scope));
  };

  renewToken = cb => {
    this.auth0.checkSession({}, (err, result) => {
      if (err) {
        console.log(`Erorr: ${err.error} - ${err.error_description}`);
      } else {
        this.setSession(result);
      }
      if (cb) cb(err, result);
    });
  };

  scheduleTokenRenewal = () => {
    const delay = _expiresAt - Date.now();
    if (delay) setTimeout(() => this.renewToken(), delay);
  };
}
