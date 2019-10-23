import { User } from './user.model';
import { Injectable, OnDestroy } from '@angular/core';
import { MSAdal, AuthenticationContext, AuthenticationResult } from '@ionic-native/ms-adal/ngx';
import { BehaviorSubject, from } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { Storage } from '@ionic/storage';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnDestroy {
  inc = 0;
  private _user = new BehaviorSubject<User>(null);
  private activeLogoutTimer: any;
  private isAutoLogin = false;
  get userIsAuthenticated() {
    this.inc++;
    return this._user.asObservable().pipe(map(user => {
        if (user) {
          return !!user.token;
        } else {
          return false;
        }
      })
    );
  }

  get token() {
    return this._user.asObservable().pipe(map(user => {
          if (user) {
            return user.token;
          } else {
            return null;
          }
        })
      );
    }

  get expiresOn() {
    return this._user.asObservable().pipe(map(user => {
          if (user) {
            return user.expiresOn;
          } else {
            return null;
          }
        })
      );
    }

  get userName() {
    return this._user.asObservable().pipe(map(user => {
          if (user) {
            return user.givenName + ' ' + user.familyName;
          } else {
            return null;
          }
        })
      );
    }

  constructor(private msAdal: MSAdal, public storage: Storage) { }

  ngOnDestroy() {
    if (this.activeLogoutTimer) {
      clearTimeout(this.activeLogoutTimer);
    }
  }

  autoLogin() {
      return from(this.storage.get('authData')).pipe(
        map(storedData => {
          if (!storedData) {
            console.log('storedData not found');
            return null;
          }
          const parsedData = JSON.parse(storedData) as {
                uniqueId: string;
                token: string;
                expiresOn: string;
                familyName: string;
                givenName: string;
              };
          const expiresOn = new Date(parsedData.expiresOn);
          if (expiresOn <= new Date()) {
            console.log('storedData expired');
            return null;
          }
          const user = new User(
            parsedData.token,
            expiresOn,
            parsedData.familyName,
            parsedData.givenName,
            parsedData.uniqueId
          );
          return user;
        }),
        tap(user => {
          if (user) {
            this._user.next(user);
            this.autoLogout(user.tokenDuration);
          }
        }),
        map(user => {
          return !!user;
        }),
        catchError(err => {
          console.log('autologin error block : ' + err);
          return of(false);
        })
      );
  }

  autoLogout(duration: number) {
    if (this.activeLogoutTimer) {
      clearTimeout(this.activeLogoutTimer);
    }
    this.activeLogoutTimer = setTimeout(() => {
      this.logout();
    }, duration);
  }

  login() {
    let authContext: AuthenticationContext = this.msAdal.createAuthenticationContext('https://login.microsoftonline.com/********');
    return authContext.acquireTokenAsync('https://graph.windows.net', '*******', 'http://localhost:8000','','')
    .then((authResponse: AuthenticationResult) => {
      const user =  new User(
        authResponse.accessToken,
        authResponse.expiresOn,
        authResponse.userInfo.familyName,
        authResponse.userInfo.givenName,
        authResponse.userInfo.uniqueId
      );
      this._user.next(user);
      this.autoLogout(user.tokenDuration);
      this.storeAuthData(
        authResponse.userInfo.uniqueId,
        authResponse.accessToken,
        authResponse.expiresOn.toISOString(),
        authResponse.userInfo.familyName,
        authResponse.userInfo.givenName
      );
    })
    .catch((e: any) => console.log('Authentication failed', e));
  }

  logout() {
    if (this.activeLogoutTimer) {
      clearTimeout(this.activeLogoutTimer);
    }
    this._user.next(null);
    this.storage.remove('authData');
  }

  private setUserData(authResponse: AuthenticationResult) {
    this._user.next(
      new User(
        authResponse.accessToken,
        authResponse.expiresOn,
        authResponse.userInfo.familyName,
        authResponse.userInfo.givenName,
        authResponse.userInfo.uniqueId
      )
    );
    this.storeAuthData(
      authResponse.userInfo.uniqueId,
      authResponse.accessToken,
      authResponse.expiresOn.toISOString(),
      authResponse.userInfo.familyName,
      authResponse.userInfo.givenName
    );
  }

  private storeAuthData(
    uniqueId: string,
    token: string,
    expiresOn: string,
    familyName: string,
    givenName: string
  ) {
    const data = JSON.stringify({
      uniqueId: uniqueId,
      token: token,
      expiresOn: expiresOn,
      familyName: familyName,
      givenName: givenName
    });
    this.storage.set('authData' , data);
  }
}
