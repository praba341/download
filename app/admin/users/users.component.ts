import { Component, OnInit } from '@angular/core';
import { DialogService } from "ng2-bootstrap-modal";

import { ConfigService } from '../../config.service';
import { UsersNewComponent } from '../users-new/users-new.component';
import { UsersEditComponent } from '../users-edit/users-edit.component';
import { Router } from '@angular/router';
import { window } from 'rxjs/operators/window';

@Component({
  selector: 'users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {

  fullname:String;
  profile_image:String = 'assets/icons/user.png';
  users:any = [];
  responseMessage:string = 'Loading..';
  
  constructor(
    private config:ConfigService,
    private dialogService:DialogService,
    private router: Router
  ) { 

    let currentRole =Number(this.config.getCurrentRole()) ;
    if(currentRole != this.config.getRoleAdmin()){
      localStorage.clear();
      this.router.navigateByUrl('/')
    }
    else{
      let userData = this.config.getUserDetails();
      this.fullname = userData.fullname;
      if(userData.profile_image != 'undefined' && userData.profile_image != null){
       //this.profile_image = userData.profile_image;
      }
      this.getUsers({});
    }
  }

  ngOnInit() {
   
  }

  getUsers(obj) {
    this.config.callApi({status:null, role:null, method:'get_users'}).then(res => {
      if(res.code == 1){
        this.users = res.results;
      }
      else if(res.code == 2){
        this.responseMessage = 'No results found.';
      }
      else{
        this.responseMessage = 'Sorry!! Something went wrong.';
      }
    });
  }

  createNewUser(){
    let disposable = this.dialogService.addDialog(UsersNewComponent, {
      title:'Confirm title', 
      message:'Confirm message'},{ backdropColor: 'rgba(0, 0, 0, 0.5)' })
      .subscribe((isConfirmed)=>{
        //We get dialog result
        if(isConfirmed) {
          console.log('isConfirmed');
        }
        else {
          this.getUsers({});
          console.log('closed');
        }
    });
  }

  editUser(item){
    let disposable = this.dialogService.addDialog(UsersEditComponent, {
      title:'Confirm title', 
      message:'Confirm message',
      formData:item
    },{ backdropColor: 'rgba(0, 0, 0, 0.5)' })
      .subscribe((isConfirmed)=>{
        if(isConfirmed) {
          console.log('isConfirmed');
        }
        else {
          this.getUsers({});
          console.log('closed');
        }
    });
  }

  logout(){
    localStorage.clear();
    this.router.navigateByUrl('/')
  }

}
