import { Component, OnInit } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Router } from '@angular/router';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';

import{ConfigService} from '../config.service'

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  password_type:String='password';
  username:String;
  password:String;
  error:boolean = false;
  empty:boolean = false;
  errorMessage:string = '';
 // policy:boolean = false;
  constructor(
    private http:Http,
    public config:ConfigService,
    private router: Router,
    private spinnerService: Ng4LoadingSpinnerService
  ) 
  { 

  }

  ngOnInit() {
  }

  showPassword(){
    if(this.password_type == 'text' ){
      this.password_type = 'password'
    }
    else{
      this.password_type = 'text'
    }
    
  }

  hideError(){
    this.error = false;
  }

  login(){
    if(this.username == undefined || this.username =="" || this.password == undefined || this.password ==""){
      this.error = true;
      this.errorMessage = "Username or Password can't be empty";
    }
    // else if(!this.policy){
    //   this.error = true;
    //   this.errorMessage = "Privacy Policy not agreed";
    // }
    else{
      this.spinnerService.show();
      let jsondata = JSON.stringify({username: this.username, password:this.password });
      this.http.post(this.config.getApiUrl()+'get_login',jsondata).map(res => res.json()).subscribe(res => {
        this.spinnerService.hide();
        if(res.code == 1){
          this.config.setUserDetails(res.results);
          let role = Number(window.localStorage.getItem('role'));
          if(role == this.config.getRoleAdmin()){
            this.router.navigateByUrl('/users');
          }
          else if(role == this.config.getRoleAgentOwner()){
            this.router.navigateByUrl('/mytickets');
          }
          else if(role == this.config.getLenovoAgent()){
            this.freshdeskLogin(res.results);
          }
          else{
            this.router.navigateByUrl('/dashboard');
          }
        }
        else if(res.code == 2){
          this.error = true;
          this.errorMessage = 'Invalid username or password';
        }
        else{
          this.error = true;
          this.errorMessage = 'Something went wrong. Please try again!!';
          this.spinnerService.hide();
        }
      }, 
      error => {
        this.error = true;
        this.errorMessage = 'Something went wrong. Please try again!!';
        this.spinnerService.hide();
      });
    }
  }  

  freshdeskLogin(obj){
    let jsondata = JSON.stringify({
      name:obj.firstname+' '+obj.lastname,
      email:obj.email
    });
    this.http.post(this.config.getApiUrl()+'get_freshdesk_login',jsondata).map(res => res.json()).subscribe(res => {
      if(res.code == 1){
        window.open(res.results.returnUrl, '_self');
      }
    }, 
    error => {
    });
  }

  // privacyPolicy(event){
  //   this.error = false;
  //   if(event.target.checked){
  //     this.policy = true;
  //   }
  //   else{
  //     this.policy = false;
  //   }
  // }

}
