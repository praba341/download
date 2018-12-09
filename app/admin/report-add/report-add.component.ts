import { Component, OnInit } from '@angular/core';
import { DialogComponent, DialogService } from "ng2-bootstrap-modal";
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { ConfigService } from '../../config.service';
import { Http } from '@angular/http';
export interface ConfirmModel{}

@Component({
  selector: 'app-report-add',
  templateUrl: './report-add.component.html',
  styleUrls: ['./report-add.component.css']
})
export class ReportAddComponent  extends DialogComponent<ConfirmModel, boolean> implements ConfirmModel {
  
  formData = {
    'report_name':'',
    'report_fd_link':'',
    'subject':'',
    'from_name':'',
    'message':'',
    'schedule':''
  }
  emails = [{email_id  : "1",email : null},{email_id  : "2",email : null},{email_id  : "3",email : null}];
  customToastMsg:string = '';
  customToast:boolean = false;
  resMessage:String;
  schedule = [{value:1, name:'Daily'},{value:2, name:'Weekly'}]
  constructor(dialogService: DialogService, 
    private spinnerService: Ng4LoadingSpinnerService,
    public config:ConfigService,
    public http:Http) { 
    super(dialogService);
  }

  ngOnInit() {
  }
  
  saveReport(){

    if(this.formData.report_name == undefined || this.formData.report_name == ''){
      this.customPresentToast('Please enter report name', 1000);
      return false;
    }
    else if(this.formData.subject == undefined || this.formData.subject == ''){
      this.customPresentToast('Please enter email subject', 1000);
      return false;
    }
    else if(this.formData.from_name == undefined || this.formData.from_name == ''){
      this.customPresentToast('Please enter from name', 1000);
      return false;
    }
    else if(this.formData.schedule == undefined || this.formData.schedule == ''){
      this.customPresentToast('Please select schedule', 1000);
      return false;
    }
    else if(this.formData.report_fd_link == undefined || this.formData.report_fd_link == ''){
      this.customPresentToast('Please enter link', 1000);
      return false;
    }
    else if(this.formData.message == undefined || this.formData.message == ''){
      this.customPresentToast('Please enter message', 1000);
      return false;
    }
    else if(this.emails[0]['email'] == undefined || this.emails[0]['email'] == ''){
      this.customPresentToast('Please enter altest one email', 1000);
      return false;
    }

    this.spinnerService.show();
      let jsondata = JSON.stringify({data:this.formData, emails: this.emails, user_id:window.localStorage.getItem('user_id')});
      this.http.post(this.config.getApiUrl()+'create_report',jsondata).map(res => res.json()).subscribe(res => {
        this.spinnerService.hide();
        if(res.code == 1){
          this.resMessage = '<div class="alert alert-info">Report created successfully!!</div>';
          this.config.callApi({refresh:true, method:'get_report_details'});
        }
        else{
          this.resMessage = '<div class="alert alert-warning">Report created failed. Please try again!!</div>';
        }
      }, 
      error => {
        this.resMessage = '<div class="alert alert-warning">Report created failed. Please try again!!</div>';
        this.spinnerService.hide();
      });
  }

  customPresentToast(text, duration) {
    this.customToast = true;
    this.customToastMsg = text;
    setTimeout(() => {
      this.customToast = false;
    }, duration);
  }

  addEmail(i){
    this.emails.push({email_id:'',email:''})
  }
  
  deleteEmail(index){
    this.emails.splice(index,1)
  }

}
