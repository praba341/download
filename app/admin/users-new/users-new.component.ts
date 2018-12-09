import { Component, OnInit } from '@angular/core';
import { DialogComponent, DialogService } from "ng2-bootstrap-modal";
import { Http, Response } from '@angular/http';
import{ ConfigService } from '../../config.service'
export interface ConfirmModel{}

@Component({
  selector: 'users-new',
  templateUrl: './users-new.component.html',
  styleUrls: ['./users-new.component.css']
})
export class UsersNewComponent  extends DialogComponent<ConfirmModel, boolean> implements ConfirmModel {

  userRoles:any = [];
  isActiveForm:boolean = true;
  formData:any = [];
  formTitle:string = 'Create New User';
  errorMessage:string = '';

  loader:boolean = false;
  customToastMsg:string = '';
  customToast:boolean = false;

  constructor(
    dialogService: DialogService,
    private http:Http,
    public config:ConfigService
  ) {
    super(dialogService);
    this.formData.role = '';
    this.formData.status = 1;
    this.formData.lastname = '';
    this.getUserRoles({});
   }

  ngOnInit() {
  }

  getUserRoles(obj) {
    this.config.callApi({type:'USR_RLE', method:'get_user_role'}).then(res => {
      if(res.code == 1){
        this.userRoles = res.results;
      }
    });
  }

  customPresentToast(text, duration) {
    this.customToast = true;
    this.customToastMsg = text;
    setTimeout(() => {
      this.customToast = false;
    }, duration);
  }

  createNewUser(){
    this.errorMessage = '';
    if(this.formData.firstname == '' || this.formData.firstname == undefined){
      this.customPresentToast('Please enter Firstname', 1000);
      return false;
    }
    if(this.formData.mobile == '' || this.formData.mobile == undefined){
      this.customPresentToast('Please enter Mobile', 1000);
      return false;
    }
    if(this.formData.email == '' || this.formData.email == undefined){
      this.customPresentToast('Please enter Email Id', 1000);
      return false;
    }

    if(this.formData.role == '' || this.formData.role == undefined){
      this.customPresentToast('Please choose a role', 1000);
      return false;
    }
    if(this.formData.username == '' || this.formData.username == undefined){
      this.customPresentToast('Please enter username', 1000);
      return false;
    }
    if(this.formData.password == '' || this.formData.password == undefined){
      this.customPresentToast('Please enter password', 1000);
      return false;
    }
    
    if(this.formData.password != this.formData.cpassword){
      this.customPresentToast('Please enter same password again', 1000);
      return false;
    }

    let jsondata = JSON.stringify({
      firstname:this.formData.firstname,
      lastname:this.formData.lastname,
      mobile:this.formData.mobile,
      email:this.formData.email,
      status:this.formData.status,
      role:this.formData.role,
      username:this.formData.username,
      password:this.formData.password,
      user_id: this.config.getCurrentUserId()
    });
    this.http.post(this.config.getApiUrl()+'create_user',jsondata).map(res => res.json()).subscribe(res => {
      if(res.code == 1){
        this.config.callApi({refresh:1, method:'get_users'});
        this.errorMessage = '<div class="alert alert-info">'+res.message+'</div>';
        this.isActiveForm = false;
      }
      else if(res.code == 2 || res.code == 3 || res.code == 4){
        this.customPresentToast(res.message, 1000);
      }   
      else{
        this.customPresentToast('Something went wrong. Please try again!!', 1000);
      }
    }, 
    error => {
      this.errorMessage = '<div class="alert alert-warning">Something went wrong. Please try again!!</div>';
    });
  }

  closeMessage(){
    this.errorMessage = '';
  }

}
