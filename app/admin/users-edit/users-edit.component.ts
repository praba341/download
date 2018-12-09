import { Component, OnInit } from '@angular/core';
import { DialogComponent, DialogService } from "ng2-bootstrap-modal";
import { Http, Response } from '@angular/http';
import{ ConfigService } from '../../config.service'
export interface ConfirmModel{}

@Component({
  selector: 'users-edit',
  templateUrl: './users-edit.component.html',
  styleUrls: ['./users-edit.component.css']
})
export class UsersEditComponent  extends DialogComponent<ConfirmModel, boolean> implements ConfirmModel {

  userRoles:any = [];
  isActiveForm:boolean = true;
  formData:any = [];
  formTitle:string = 'Edit User';
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
    this.getUserRoles({});
   }

  ngOnInit() {
  }

  getUserRoles(obj) {
    this.config.callApi({type:'USR_RLE', method:'get_config_data'}).then(res => {
      if(res.code == 1){
        this.userRoles = res.results;
      }
    });
  }

  /*getUser(obj) {
    this.config.callApi({user_id:obj.user_id, method:'get_user'}).then(res => {
      if(res.code == 1){
        this.formData = res.results;
      }
    });
  }*/

  customPresentToast(text, duration) {
    this.customToast = true;
    this.customToastMsg = text;
    setTimeout(() => {
      this.customToast = false;
    }, duration);
  }

  updateUser(){
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

    if(this.formData.changelogindetails){
      if(this.formData.password == '' || this.formData.password == undefined){
        this.customPresentToast('Please enter password', 1000);
        return false;
      }
      if(this.formData.password != this.formData.cpassword){
        this.customPresentToast('Please enter same password again', 1000);
        return false;
      }
    }

    if(!this.formData.changelogindetails){
      this.formData.changelogindetails = 0;
    }

    let jsondata = JSON.stringify({
      edit_user_id:this.formData.user_id,
      firstname:this.formData.firstname,
      lastname:this.formData.lastname,
      mobile:this.formData.mobile,
      email:this.formData.email,
      status:this.formData.status,
      role:this.formData.role,
      username:this.formData.username,
      changelogindetails:this.formData.changelogindetails,
      password:this.formData.password,
      user_id: this.config.getCurrentUserId()
    });
    this.http.post(this.config.getApiUrl()+'update_user',jsondata).map(res => res.json()).subscribe(res => {
      if(res.code == 1){
        this.config.callApi({refresh:1, method:'get_users'});
        this.errorMessage = '<div class="alert alert-info">'+res.message+'</div>';
        this.isActiveForm = false;
      }
      else if(res.code == 2 || res.code == 3){
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
