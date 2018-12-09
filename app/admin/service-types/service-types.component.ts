import { Component, OnInit } from '@angular/core';
import { DialogService } from "ng2-bootstrap-modal";
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Router } from '@angular/router';
import { window } from 'rxjs/operators/window';

import { ConfigService } from '../../config.service';
import { ServiceTypesFormComponent } from '../service-types-form/service-types-form.component';


@Component({
  selector: 'service-types',
  templateUrl: './service-types.component.html',
  styleUrls: ['./service-types.component.css']
})
export class ServiceTypesComponent implements OnInit {

  fullname:String;
  profile_image:String = 'assets/icons/user.png';
  serviceTypes:any = [];
  responseMessage:string = 'Loading..';
  data:any;
  customToastMsg:any;
  fixedCenterMsg:any;
  
  constructor(
    private config:ConfigService,
    private dialogService:DialogService,
    private router: Router,
    private http:Http
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
      this.getServiceTypes({});
    }
  }

  ngOnInit() {
  }


  getServiceTypes(obj) {
    this.config.callApi({type:'SER_TYP', method:'get_config_data'}).then(res => {
      if(res.code == 1){
        this.serviceTypes = res.results;
      }
      else if(res.code == 2){
        this.responseMessage = 'No results found.';
      }
      else{
        this.responseMessage = 'Sorry!! Something went wrong.';
      }
    });
  }

  createNew(){
    let disposable = this.dialogService.addDialog(ServiceTypesFormComponent, {
      title:'Confirm title', 
      message:'Confirm message'},
      { backdropColor: 'rgba(0, 0, 0, 0.5)' })
      .subscribe((isConfirmed)=>{
        //We get dialog result
        if(isConfirmed) {
          console.log('isConfirmed');
        }
        else {
          this.getServiceTypes({});
          console.log('closed');
        }
    });
  }

  edit(item){
    let disposable = this.dialogService.addDialog(ServiceTypesFormComponent, {
      title:'Confirm title', 
      message:'Confirm message',
      formData:item
    },
    {backdropColor: 'rgba(0, 0, 0, 0.5)'})
      .subscribe((isConfirmed)=>{
        if(isConfirmed) {
          console.log('isConfirmed');
        }
        else {
          this.getServiceTypes({});
          console.log('closed');
        }
    });
  }

  getGroupsFreshDesk(){
    this.fixedCenterMsg = 'Please wait...';
    this.config.callApi({refresh:1, method:'get_ticket_details'});
    let freshDeskApi = this.config.getUserDetail('freshDeskApi');
    let freshDeskPassword = this.config.getUserDetail('freshDeskPassword');
    let freshDeskDomain = this.config.getUserDetail('freshDeskDomain');
    let url = 'https://'+freshDeskDomain+'.freshdesk.com/api/v2/groups';
    let jsondata = JSON.stringify({});
    let headers = new Headers({ 'Content-Type': 'application/json', "Authorization": "Basic " + btoa(freshDeskApi + ":" + freshDeskPassword) });
    let options = new RequestOptions({ headers: headers });
    this.http.get(url, options).map(res => res.json()).subscribe(res => {
      this.insertFreshDeskGroups(res);
    }, 
    error => {
      this.fixedCenterMsg='';
      this.customPresentToast('Sync failed try again...', 1000);
    });
  }

  insertFreshDeskGroups(groups){
    let obj ={
      groups : groups,
      user_id: this.config.getCurrentUserId()
    }
    this.http.post(this.config.getApiUrl()+'create_groups',obj).map(res => res.json()).subscribe(res => {
      this.fixedCenterMsg='';
      if(res.code == 1){
        this.customPresentToast('Sync sucess', 1000);
      }
      else{
        this.customPresentToast('No group found', 1000);
      }
    }, 
    error => {
      this.fixedCenterMsg='';
      this.customPresentToast('Sync failed try again...', 1000);
    });
  }

  customPresentToast(text, duration) {
    this.customToastMsg = text;
    setTimeout(() => {
      this.customToastMsg = '';
    }, duration);
  }

  logout(){
    localStorage.clear();
    this.router.navigateByUrl('/')
  }

}
