import { Router } from '@angular/router';
import { AuthService } from './auth/auth.service';
import { Component, OnInit, OnDestroy } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy{
  private authSub: Subscription;
  private previousAuthState = false;
    constructor(
      private platform: Platform,
      private splashScreen: SplashScreen,
      private statusBar: StatusBar,
      private authService: AuthService,
      private router: Router
    ) {
      this.initializeApp();
    }
  ngOnInit() {
    console.log('app component ngOnInit starts');
    this.authSub = this.authService.userIsAuthenticated.subscribe(isAuth => {
      if (!isAuth && this.previousAuthState !== isAuth) {
        this.router.navigateByUrl('/auth');
      }
      this.previousAuthState = isAuth;
    });
  }

  ngOnDestroy() {
    if(this.authSub) {
      this.authSub.unsubscribe();
    }
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }
}
