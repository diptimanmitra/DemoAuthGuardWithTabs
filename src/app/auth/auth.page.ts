import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {
  buttonText = 'Login1';
  disabled = false;
  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {
  }

  onLogin() {
    this.buttonText = 'Loading';
    this.disabled = !this.disabled;
    this.authService.login().then(resData => {
      this.router.navigateByUrl('/app/tabs/tab1');
      this.buttonText = 'Login';
      this.disabled = false;
    });
  }
}
