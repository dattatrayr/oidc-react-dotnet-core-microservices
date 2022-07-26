import { Log, User, UserManager, WebStorageStateStore } from "oidc-client-ts";
import { Constants } from "../helpers/Constants";

export interface IAuthService {
  getUser(): Promise<User | null>;
  login(): Promise<void | null>;
  logout(): Promise<void>;
  renewToken(): Promise<User | null>;
  signinSilent(): Promise<void>;
}

export default class AuthService implements IAuthService {
  private _userManager: UserManager;

  constructor() {
    const settings = {
      authority: Constants.stsAuthority,
      client_id: Constants.clientId,
      client_secret: Constants.client_secret,
      redirect_uri: `${Constants.clientRoot}signin-oidc`,
      silent_redirect_uri: `${Constants.clientRoot}silent-renew.html`,
      post_logout_redirect_uri: `${Constants.clientRoot}signout-callback-oidc`,
      response_type: "code",
      scope: Constants.clientScope,
      userStore: new WebStorageStateStore({ store: window.localStorage }),
    };
    this._userManager = new UserManager(settings);

    this._userManager.events.addAccessTokenExpired(() => {
      console.log("token expired");
      this.signinSilent();
    });
  }

  public getUser(): Promise<User | null> {
    console.log("getUser called");
    const user = this._userManager.getUser();
    if (!user) {
      return this._userManager.signinRedirectCallback();
    }
    return user;
  }

  public login(): Promise<void | null> {
    console.log("login called");
    return this._userManager.signinRedirect();
  }
  public loginCallback(): Promise<User> {
    console.log("loginCallback called");
    return this._userManager.signinRedirectCallback();
  }

  public logout(): Promise<void> {
    console.log("logout called");
    return this._userManager.signoutRedirect();
  }

  public renewToken(): Promise<User | null> {
    return this._userManager.signinSilent();
  }

  // public logout(): Promise<void> {
  //   this._userManager.signoutRedirect({
  //     id_token_hint: localStorage.getItem("id_token"),
  //   });
  //   return this._userManager.clearStaleState();
  // }

  public signinSilent(): Promise<void> {
    return this._userManager
      .signinSilent()
      .then((user) => {
        console.log("signed in", user);
      })
      .catch((err) => {
        console.log(err);
      });
  }
}
