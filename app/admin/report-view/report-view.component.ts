import { Component, OnInit } from '@angular/core';
import { DialogComponent, DialogService } from "ng2-bootstrap-modal";
import { Jsonp, Http } from '@angular/http';
import { ConfigService } from '../../config.service';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
export interface ConfirmModel{}

@Component({
  selector: 'app-report-view',
  templateUrl: './report-view.component.html',
  styleUrls: ['./report-view.component.css']
})
export class ReportViewComponent  extends DialogComponent<ConfirmModel, boolean> implements ConfirmModel{
  reportData:any;
  formData = {
    'report_id':'',
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
          public config:ConfigService,
          private spinnerService: Ng4LoadingSpinnerService,
          public http:Http) {
    super(dialogService);
   }

  ngOnInit() {
    this.formData = this.reportData;
    this.config.callApi({refresh:true, method:'get_report_email'});
    this.getReportEmail();
  }


  addEmail(i){
    this.emails.push({email_id  : "",email : null})
  }
  
  deleteEmail(index){
    this.emails.splice(index,1)
  }

  getReportEmail(){
    this.config.callApi({status:1, report_id:this.reportData.report_id, method:'get_report_email'}).then(res => {
      if(res.code == 1){
        this.emails = res.results;
      }
    });
  }

  updateReport(){
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
      this.http.post(this.config.getApiUrl()+'update_report',jsondata).map(res => res.json()).subscribe(res => {
        this.spinnerService.hide();
        if(res.code == 1){
          this.resMessage = '<div class="alert alert-info">Report updated successfully!!</div>';
          this.config.callApi({refresh:true, method:'get_report_details'});
        }
        else{
          this.resMessage = '<div class="alert alert-warning">Report update failed. Please try again!!</div>';
        }
      }, 
      error => {
        this.resMessage = '<div class="alert alert-warning">Report update failed. Please try again!!</div>';
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

}
