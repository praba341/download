import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Http, Response } from '@angular/http';
import { DialogComponent, DialogService } from "ng2-bootstrap-modal";
import { RatingModule } from "ng2-rating";
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
export interface ConfirmModel {
 // record:string;
}

import { ViewticketComponent } from '../viewticket/viewticket.component';
import{ConfigService} from '../config.service';
import { SupportComponent } from '../support/support.component';

@Component({
  selector: 'app-social-discovery',
  templateUrl: './social-discovery.component.html',
  styleUrls: ['./social-discovery.component.css']
})

export class SocialDiscoveryComponent extends DialogComponent<ConfirmModel, boolean> implements ConfirmModel {
  record:any;
  userId:any;
  socialDicovery = {
    ticket_id               :'',
    customer_id             :'',
    discovery_ticket_status :'',
    customer_name           :'',
    notes                   :'',
    complaint_url           :'',
    rating                  : 0,
    behaviour               :'',
    reason                  :'',
    links                   :[{social_media_id  : "1",url : null},{social_media_id  : "2",url : null},{social_media_id  : "3",url : null}]
  }
  update:boolean=false;
  resMessage:string = '';
  onlyView:boolean=false;
  created:boolean=false;
  customToastMsg:string = '';
  customToast:boolean = false;
  constructor(dialogService: DialogService,
    private spinnerService: Ng4LoadingSpinnerService,
    private http:Http,
    public config:ConfigService) {
    super(dialogService);
  }

  ngOnInit(): void {
    this.getDiscovery(this.record);
    if(this.userId == 1){
      this.onlyView = true;
    }
    }

  confirm() {
    this.result = true;
    this.close();
  }

  addLink(i){
    this.socialDicovery.links.push({social_media_id:'',url:''})
  }
  
  deleteLink(index){
    this.socialDicovery.links.splice(index,1)
  }

  // preview(record){
  //   this.dialogService.addDialog(ViewticketComponent,{record:record},{ backdropColor: 'rgba(0, 0, 0, 0.5)' })
  // }

  createDisovery(){
    if(this.socialDicovery.customer_name == undefined || this.socialDicovery.customer_name == ''){
      this.customPresentToast('Please enter customername', 1000);
      return false;
    }
    else if(this.socialDicovery.notes == undefined || this.socialDicovery.notes == ''){
      this.customPresentToast('Please enter notes', 1000);
      return false;
    }
    else if(this.socialDicovery.complaint_url == undefined || this.socialDicovery.complaint_url == ''){
      this.customPresentToast('Please enter url', 1000);
      return false;
    }
    else if(this.socialDicovery.rating == undefined || this.socialDicovery.rating == 0){
      this.customPresentToast('Please select rating', 1000);
      return false;
    }
    else if(this.socialDicovery.behaviour == undefined || this.socialDicovery.behaviour == ''){
      this.customPresentToast('Please enter behaviour', 1000);
      return false;
    }
    else if(this.socialDicovery.reason == undefined || this.socialDicovery.reason == ''){
      this.customPresentToast('Please enter reason', 1000);
      return false;
    }

    this.spinnerService.show();
      let jsondata = JSON.stringify({data:this.socialDicovery,user_id:window.localStorage.getItem('user_id')});
      this.http.post(this.config.getApiUrl()+'create_discovery',jsondata).map(res => res.json()).subscribe(res => {
        this.spinnerService.hide();
        this.resMessage = '<div class="alert alert-info">Form created successfully!!</div>';
        this.created =true;
       // alert('POSTED SUCESSFULLY');
        //this.close();
      }, 
      error => {
        this.resMessage = '<div class="alert alert-warning">Form created failed. Please try again!!</div>';
        this.spinnerService.hide();
      });

  }

  getDiscovery(record){
    this.spinnerService.show();
      let jsondata = JSON.stringify({ticket_id:record.ticket_id});
      this.http.post(this.config.getApiUrl()+'get_discovery_details',jsondata).map(res => res.json()).subscribe(res => {
        if(res.code == 1){
            this.update=true;
            this.socialDicovery = res.results[0];
            if(res.results['links'][0].link_id == null && res.results['links'][0].social_media_id == null){
              this.socialDicovery.links =[{social_media_id : '1',url : null},{social_media_id : '2',url : null},{social_media_id : '3',url : null}]
            }
            else{
              this.socialDicovery.links = res.results['links']
            }  
            this.spinnerService.hide();
        }
        else{
          this.socialDicovery = this.record;
          this.socialDicovery.links =  [{social_media_id : '1',url : null},{social_media_id : '2',url : null},{social_media_id : '3',url : null}]
          this.spinnerService.hide();
        }
      }, 
      error => {
        this.spinnerService.hide();
      });
  }

  updateDiscovery(){

    if(this.socialDicovery.customer_name == undefined || this.socialDicovery.customer_name == ''){
      this.customPresentToast('Please enter customername', 1000);
      return false;
    }
    else if(this.socialDicovery.notes == undefined || this.socialDicovery.notes == ''){
      this.customPresentToast('Please enter notes', 1000);
      return false;
    }
    
    else if(this.socialDicovery.complaint_url == undefined || this.socialDicovery.complaint_url == ''){
      this.customPresentToast('Please enter url', 1000);
      return false;
    }
    else if(this.socialDicovery.rating == undefined || this.socialDicovery.rating == 0){
      this.customPresentToast('Please select rating', 1000);
      return false;
    }
    else if(this.socialDicovery.behaviour == undefined || this.socialDicovery.behaviour == ''){
      this.customPresentToast('Please enter behaviour', 1000);
      return false;
    }
    else if(this.socialDicovery.reason == undefined || this.socialDicovery.reason == ''){
      this.customPresentToast('Please enter reason', 1000);
      return false;
    }
    this.spinnerService.show();
    this.resMessage = ''
      let jsondata = JSON.stringify({data:this.socialDicovery,user_id:window.localStorage.getItem('user_id')});
      this.http.post(this.config.getApiUrl()+'update_discovery',jsondata).map(res => res.json()).subscribe(res => {
        this.spinnerService.hide();
        this.resMessage = '<div class="alert alert-info">Updated successfully!!</div>';
        //alert('UPDATED SUCESSFULLY');
        //this.close();
      }, 
      error => {
        this.spinnerService.hide();
        this.resMessage = '<div class="alert alert-warning">Updated failed. Please try again!!</div>';
      });
  }

  closeMessage(){
    this.resMessage = '';
  }

  getCutomerResponse(tockenId){
    this.dialogService.addDialog(SupportComponent,{tockenId:tockenId},{ backdropColor: 'rgba(0, 0, 0, 0.5)' })
  }

  openViewTicket(record){
    this.dialogService.addDialog(ViewticketComponent,{record:record},{ backdropColor: 'rgba(0, 0, 0, 0.5)' })
  }

  customPresentToast(text, duration) {
    this.customToast = true;
    this.customToastMsg = text;
    setTimeout(() => {
      this.customToast = false;
    }, duration);
  }

}
