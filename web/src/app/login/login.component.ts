import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, } from '@angular/common/http';
import { login } from '../service';

@Component({
  selector: 'app-root',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  constructor(private router: Router, private http: HttpClient) { }

  username = '';
  email = '';

  ngOnInit() {
  }

  login() {
    console.log(this.username +  this.email);
    login(this.http, { username: this.username, email: this.email }).subscribe(data => {
      localStorage.setItem('user', JSON.stringify(data));
      this.router.navigateByUrl('dashboard').then(r => console.log(r));
    }, error => {});
  }
}
