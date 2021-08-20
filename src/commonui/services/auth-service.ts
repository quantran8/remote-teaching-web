import { UserManager, WebStorageStateStore, UserManagerSettings, User } from "oidc-client";
import { OidcStorageKeys, OidcCallbackPath, clearAppLocalStorageData, LoginInfo, GLUtil, GLGlobal } from "../utils";
import { LocationDescriptor } from "history";
import AccountService from "./account.service";
import ResourceService from "./resource.service";
import { store } from "@/store";
import { Logger } from "@/utils/logger";

class RedirectNavigator {
  prepare() {
    return Promise.resolve(this);
  }

  navigate(params: any) {
    if (!params || !params.url) {
      Logger.error("RedirectNavigator.navigate: No url provided");
      return Promise.reject(new Error("No url provided"));
    }
    // window.location = params.url;
    return Promise.resolve({
      params,
      navigate: () => {
        setTimeout(() => {
          window.location = params.url;
        }, 2000);
      },
    });

    //return Promise.resolve({ params, navigate: () => { window.location = params.url; } });
  }

  get url() {
    return window.location.href;
  }
}

class ClientStorage {
  constructor(private logger: any) {}
  private getStorage(storage: any, key: any) {
    try {
      return storage.getItem(key);
    } catch (error) {
      this.logger.warn(error);
      return null;
    }
  }
  private setStorage(storage: any, key: any, value: any) {
    try {
      storage.setItem(key, value);
      return true;
    } catch (error) {
      this.logger.warn(error);
      return false;
    }
  }
  private removeStorage(storage: any, key: any) {
    try {
      storage.removeItem(key);
      return true;
    } catch (error) {
      this.logger.warn(error);
      return false;
    }
  }
  private getStorageLength(storage: any) {
    try {
      return storage.length;
    } catch (error) {
      this.logger.warn(error);
      return 0;
    }
  }
  private getStorageByIndex(storage: any, index: any) {
    try {
      return storage.key(index);
    } catch (error) {
      this.logger.warn(error);
      return null;
    }
  }
  private getStorageKeys(storage: any) {
    try {
      return Object.getOwnPropertyNames(storage);
    } catch (error) {
      this.logger.warn(error);
      return [];
    }
  }
  get length() {
    let value = 0;
    value = this.getStorageLength(sessionStorage);
    if (value === 0) {
      value = this.getStorageLength(localStorage);
    }
    return value;
  }
  keys() {
    let value: string[] = [];
    value = this.getStorageKeys(sessionStorage);
    if (value.length === 0) {
      value = this.getStorageKeys(localStorage);
    }
    return value;
  }
  key(index: any) {
    let value = null;
    value = this.getStorageByIndex(sessionStorage, index);
    if (value == null) {
      value = this.getStorageByIndex(localStorage, index);
    }
    return value;
  }
  getItem(key: any) {
    let value = null;
    value = this.getStorage(sessionStorage, key);
    if (value == null) {
      value = this.getStorage(localStorage, key);
    }
    return value;
  }
  setItem(key: any, value: any) {
    let success = false;
    success = this.setStorage(sessionStorage, key, value);
    success = this.setStorage(localStorage, key, value);
    return success;
  }
  removeItem(key: any) {
    let success = false;
    success = this.removeStorage(sessionStorage, key);
    success = this.removeStorage(localStorage, key);
    return success;
  }
  removeOidc() {
    try {
      this.keys()
        .filter(key => key.startsWith("oidc.") || key.startsWith("gl.cdio.") || key.startsWith("signinstateid"))
        .forEach(key => {
          this.removeItem(key);
        });
    } catch (error) {
      this.logger.warn(error);
    }
  }
}

class AuthServiceClass {
  private userManager: UserManager;
  public accessToken: string | null = null;
  // private oidcModule = getModule(OidcLogin) as OidcLogin;
  private settings: UserManagerSettings = {};

  constructor() {
    this.settings = {
      authority: GLGlobal.authorityUrl(),
      client_id: GLGlobal.authorityClientId(),
      client_secret: GLGlobal.authorityClientSecret(),
      redirect_uri: `${GLGlobal.appClientUrl()}#/oidc/signin#`,
      automaticSilentRenew: true,
      silent_redirect_uri: `${GLGlobal.appClientUrl()}oidc/signin-silent#`,
      response_type: "id_token token",
      scope: "openid profile basicinfo offline_access",
      post_logout_redirect_uri: `${GLGlobal.appClientUrl()}#/oidc/signout`,
      loadUserInfo: true,
      filterProtocolClaims: true,
      userStore: new WebStorageStateStore({
        store: new ClientStorage(console),
      }),
      stateStore: new WebStorageStateStore({
        store: new ClientStorage(console),
      }),
    };

    this.userManager = new UserManager(this.settings);

    this.userManager.events.addAccessTokenExpired(function() {
      Logger.log("addAccessTokenExpired");
    });

    this.userManager.events.addUserSignedOut(() => {
      // when sso signout
      this.clearSignStorage();
      store.dispatch("auth/signout");
    });
  }

  public getUser(): Promise<LoginInfo> {
    return this.userManager.getUser().then(user => Promise.resolve(this.processUser(user)) as any);
  }

  public processUser(user: any) {
    if (user && !GLUtil.isExpired(user)) {
      if (!user.profile.roles || user.profile.roles.length === 0) {
        const role = user.profile.role;
        user.profile.roles = role ? (role instanceof Array ? role : [role]) : [];
        user.profile.roleInfos = (user.profile.roleinfos ? JSON.parse(user.profile.roleinfos) : []).map((info: any) => ({
          id: info.Id,
          name: info.Name,
        }));
      }
      return { loggedin: true, ...user };
    }
    return {
      loggedin: false,
      profile: {
        roles: [],
        roleInfos: [],
      },
      ...user,
    };
  }

  public login(): Promise<void> {
    return this.userManager.signinRedirect({ state: window.location.href });
  }

  public signinCallback() {
    return this.userManager.signinRedirectCallback();
  }

  public signinRedirectCallback(url?: string): Promise<User> {
    return this.userManager.signinRedirectCallback(url).then(user => Promise.resolve(this.processUser(user)) as any);
  }

  public getAccessToken(): Promise<string> {
    return this.userManager.getUser().then((data: any) => {
      return data.access_token;
    });
  }

  public signinSilent(): Promise<LoginInfo> {
    return Promise.resolve({ loggedin: false } as LoginInfo);
  }

  public signinSilentCallback(url?: string): Promise<any> {
    return this.userManager.signinSilentCallback(url);
  }

  public signoutRedirectCallback(): Promise<any> {
    return this.userManager.signoutRedirectCallback();
  }

  private storePageAfterSignin(pageAfterSignin?: LocationDescriptor) {
    sessionStorage.setItem(
      OidcStorageKeys.pageaftersignin,
      JSON.stringify({
        afterSignin: pageAfterSignin,
        shouldSignin: this.getRedirectPath(GLUtil.parsePath()),
      }),
    );
  }

  public getPageAfterSignin() {
    return JSON.parse(sessionStorage.getItem(OidcStorageKeys.pageaftersignin)!);
  }

  private getSessionKey() {
    return `oidc.user:${process.env.VUE_APP_AUTHORITY_URL}:${process.env.VUE_APP_AUTHORITY_CLIENT_ID}`;
  }

  public getSessionFromStorage() {
    return sessionStorage.getItem(this.getSessionKey());
  }

  public storePagethenSignoutRedirect(pageAfterSignout?: LocationDescriptor) {
    this.storePageAfterSignout(pageAfterSignout);
    this.signoutRedirect();
  }

  private signoutRedirect(): Promise<any> {
    return this.userManager.signoutRedirect();
  }

  private storePageAfterSignout(pageAfterSignout?: LocationDescriptor) {
    sessionStorage.setItem(
      OidcStorageKeys.pageaftersignout,
      JSON.stringify({
        afterSignout: pageAfterSignout,
        currentSignout: this.getRedirectPath(GLUtil.parsePath()),
      }),
    );
  }

  private getRedirectPath(path: { pathname: string; hash: string }) {
    const oidcPaths = [OidcCallbackPath.signin, OidcCallbackPath.signinSilent, OidcCallbackPath.signout, OidcCallbackPath.ssoSignout];
    return oidcPaths.some(oidcPath => path.pathname.indexOf(oidcPath) > -1 || path.hash.indexOf(oidcPath) > -1) ? "/" : path;
  }

  private signinRedirect(args?: any): Promise<any> {
    return (this.userManager as any)._signinStart(args, new RedirectNavigator());
  }

  static signinStart(mgr: UserManager, args: any, navigator: RedirectNavigator, navigatorParams: any = {}) {
    return navigator.prepare().then(handle => {
      return mgr
        .createSigninRequest({ state: window.location.href })
        .then(signinRequest => {
          navigatorParams.url = signinRequest.url;
          navigatorParams.id = signinRequest.state.id;

          return handle.navigate(navigatorParams);
        })
        .catch(err => {
          // if (handle.close) {
          // 	handle.close();
          // }
          throw err;
        });
    });
  }

  public getLoginInfo() {
    return store.getters["auth/loginInfo"];
  }

  public useLocalStoreToLogin() {
    return this.getUser()
      .then(user => this.mergeLoginInfo(user))
      .catch(e => Promise.reject(e));
  }

  private mergeLoginInfo(user: any) {
    return Promise.resolve(this.processUser(user))
      .then(this.accessTokenScope(this.appendUserAvatarInfo.bind(this)) as any)
      .then(this.appendRemoteTsiSettings.bind(this))
      .then((loginInfo: any) => {
        this.setLoginInfo(true, loginInfo);
        return Promise.resolve(loginInfo);
      })
      .catch(e => Promise.reject(e));
  }

  private appendUserAvatarInfo(loginInfo: LoginInfo) {
    return new Promise<LoginInfo>((resolve, reject) => {
      if (!loginInfo.loggedin || GLUtil.isExpired(loginInfo)) {
        resolve(loginInfo);
      } else if (!loginInfo.profile.avatarUrl) {
        this.setUserAvatar(loginInfo)
          .then(avatarResult => {
            resolve(avatarResult);
          })
          .catch(() => resolve(loginInfo));
      } else {
        resolve(loginInfo);
      }
    });
  }

  private appendRemoteTsiSettings(loginInfo: LoginInfo) {
    return new Promise<LoginInfo>((resolve, reject) => {
      if (!loginInfo.loggedin || GLUtil.isExpired(loginInfo)) {
        resolve(loginInfo);
      } else if (!loginInfo.profile.remoteTsiSettings) {
        this.setRemoteTsiSettings(loginInfo)
          .then(settings => {
            resolve(settings);
          })
          .catch(() => resolve(loginInfo));
      } else {
        resolve(loginInfo);
      }
    });
  }

  private accessTokenScope(func: (loginInfo: LoginInfo) => Promise<LoginInfo>) {
    return (loginInfo: LoginInfo) => {
      this.accessToken = loginInfo.access_token;
      return func(loginInfo).then(formatted => {
        this.accessToken = null;
        return Promise.resolve(formatted);
      });
    };
  }

  public getTokenUrlParams() {
    const vals = window.location.hash.replace(/^#?(.*)$/, "$1").split("&");
    const getParam: any = (key: any) => {
      const params = vals.filter(p => p.startsWith(`${key}=`)).map(p => p.split("=")[1]);
      return params.length > 0 ? params[0] : null;
    };
    const getTokenParam = (key: any) => {
      const param = getParam(key);
      if (param) {
        return JSON.parse(GLUtil.base64Decode(param.split(".")[1]) || "{}");
      } else {
        return JSON.parse("{}");
      }
    };
    return { getParam, getTokenParam };
  }

  public trySetSigninVerifyToken() {
    try {
      const { getParam, getTokenParam } = this.getTokenUrlParams();
      const storage = new ClientStorage(console);
      const id = getParam("state");
      const oidcKey = `oidc.${id}`;
      if (GLUtil.isNullOrUndefined(storage.getItem(oidcKey))) {
        const tokens = getTokenParam("id_token");

        storage.setItem(
          oidcKey,
          JSON.stringify({
            authority: this.settings.authority,
            client_id: this.settings.client_id,
            created: tokens.exp - 10,
            id: id,
            nonce: tokens.nonce,
            redirect_uri: this.settings.redirect_uri,
          }),
        );
      }
    } catch (e) {
      // diagnosticLogError({ error: e })
      Logger.error(e);
    }
  }

  public storePagethenSigninRedirect(pageAfterSignin?: LocationDescriptor) {
    this.storePageAfterSignin(pageAfterSignin);

    this.signinRedirect()
      .then(nv => {
        nv.navigate();
      })
      .catch(e => {
        // diagnosticLogError({ error: e })
        Logger.error(e);
      });
  }

  public getPageAfterSignout() {
    return JSON.parse(sessionStorage.getItem(OidcStorageKeys.pageaftersignout)!);
  }

  public clearSignStorage() {
    this.setLoginInfo(false, null);
    this.clearState();
    const clientStorage = new ClientStorage(console);
    clientStorage.removeOidc(); //clear session storage
    clientStorage.removeOidc(); //clear local storage
    clearAppLocalStorageData();
  }

  public clearState() {
    return Promise.all([this.userManager.removeUser(), this.userManager.clearStaleState()]);
  }

  public setLoginInfo(isSignIn: boolean, loginInfo: LoginInfo | null, callback?: (d: any) => void) {
    const payload = this.processUser(loginInfo);

    if (callback) {
      callback(payload);
    }

    if (isSignIn) {
      store.dispatch("auth/signin", { loginInfo: payload });
    } else {
      store.dispatch("auth/signout");
    }
  }

  public localSilentLogin() {
    if (!window.location.href.includes("oidc")) {
      this.getUser().then(loginInfo => {
        if (loginInfo.loggedin) {
          this.setLoginInfo(true, loginInfo);
        } else {
          this.setLoginInfo(false, null);
          this.signinSilent();
        }
      });
    }
  }

  private getExpiringInMinutes({ expires_at, expired }: LoginInfo): any {
    if (expired === undefined && expires_at) {
      return Math.floor((expires_at - Math.floor(Date.now() / 1000)) / 60);
    }
    return null;
  }

  private setUserAvatar(loginInfo: LoginInfo): Promise<LoginInfo> {
    return new Promise((resolve, reject) => {
      this.getUserAvatarUrl(loginInfo.profile.sub, this.getExpiringInMinutes(loginInfo))
        .then((userAvatarUrl: string) => {
          loginInfo.profile.avatarUrl = userAvatarUrl;
          resolve(loginInfo);
        })
        .catch((e: Error) => {
          reject(loginInfo);
        });
    });
  }

  private setRemoteTsiSettings(loginInfo: LoginInfo): Promise<LoginInfo> {
    return new Promise((resolve, reject) => {
      this.getRemoteTsiSettings()
        .then((settings: any) => {
          loginInfo.profile.remoteTsiSettings = settings;
          resolve(loginInfo);
        })
        .catch((e: Error) => {
          reject(loginInfo);
        });
    });
  }

  private getRemoteTsiSettings() {
    return ResourceService.getRemoteTsiSettings();
  }

  private getUserAvatarUrl(userId: string, expirationInMinutes: any): any {
    return AccountService.getUserAvatarUrl(userId, expirationInMinutes);
  }
}

export const AuthService = new AuthServiceClass();
