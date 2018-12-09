import { Component, OnInit } from '@angular/core';
import { DialogComponent, DialogService } from "ng2-bootstrap-modal";
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import{ ConfigService } from '../config.service'
export interface ConfirmModel{}

@Component({
  selector: 'tickets-new',
  templateUrl: './tickets-new.component.html',
  styleUrls: ['./tickets-new.component.css']
})
export class TicketsNewComponent  extends DialogComponent<ConfirmModel, boolean> implements ConfirmModel {

  ticketServiceTypes:any = [];
  isActiveForm:boolean = true;
  isActiveVocform:boolean = false;
  formData:any = [];
  formTitle:string = 'Create New Ticket';
  errorMessage:string = '';

  customToastMsg:string = '';
  customToast:boolean = false;
  custoemerResponseMsg:String=", Sorry you have been having this issue on our product.   We have initiated a process to understand and help you. Click this URL – that will initiate the formal complaint so that we can directly contact and help you resolve this problem";
  priortyList = [{value:4,name:'Urgent'},{value:3,name:'High'},{value:2,name:'Medium'},{value:1,name:'Low'}]
  groupList:any;
  closeOption:boolean = true;

  constructor(
    dialogService: DialogService,
    private http:Http,
    public config:ConfigService,
    private spinnerService: Ng4LoadingSpinnerService
  ) {
    super(dialogService);
    this.formData = {
      ticket_id: null,
      customer_name: '',
      complaint_url: '',
      notes: '',
      service_type_id: '',
      discover_status: 0,
      reply_notes:'',
      priority:'',
      group_id:''
    };
    this.getTicketServieTypes({});
    this.getGroupsFreshDesk();

    //For Testing
   // this.getFreshdeskCustomField();
    //this.mailToSupportAgent(51);
   // this.autoSynch();
  
   }

  ngOnInit() {
  }

  getTicketServieTypes(obj) {
    this.config.getTicketServieTypes({}).then(res => {
      if(res.code == 1){
        this.ticketServiceTypes = res.results;
      }
    });
  }

  submitTicket(submitType){
    this.errorMessage = '';
    if(this.formData.customer_name == undefined || this.formData.customer_name == ''){
      this.customPresentToast('Please enter customername', 1000);
      return false;
    }
    else if(this.formData.complaint_url == '' || this.formData.complaint_url == undefined){
      this.customPresentToast('Please enter Url', 1000);
      return false;
    }
    else if(this.formData.notes == '' || this.formData.notes == undefined){
      this.customPresentToast('Please enter Notes', 1000);
      return false;
    }
    else if(this.formData.service_type_id == '' || this.formData.service_type_id == undefined){
      this.customPresentToast('Please select service type', 1000);
      return false;
    }
    else if(this.formData.priority == '' || this.formData.priority == undefined){
      this.customPresentToast('Please select priorty type', 1000);
      return false;
    }
    else if(this.formData.group_id == '' || this.formData.group_id == undefined){
      this.customPresentToast('Please select group type', 1000);
      return false;
    }
    else{
      this.formData.reply_notes = "Hai "+this.formData.customer_name +this.custoemerResponseMsg;

      if(submitType == 'discover'){
        this.formData.discover_status = 1;
      }
      //Find insert or update start
      let methodName = '';
      if(this.formData.ticket_id == null){
        methodName = 'create_ticket';
      }
      else{
        methodName = 'update_ticket';
      }
      //Find insert or update end
      let jsondata = JSON.stringify({
        user_id: this.config.getCurrentUserId(),
        insert_type: 1,
        ticket_id: this.formData.ticket_id,
        customer_name: this.formData.customer_name,
        customer_id: this.formData.customer_id,
        complaint_url: this.formData.complaint_url,
        notes: this.formData.notes,
        service_type_id: this.formData.service_type_id.code,
        discover_status: this.formData.discover_status,
        priority : this.formData.priority,
        group_id : this.formData.group_id
      });
      this.spinnerService.show();
      this.http.post(this.config.getApiUrl()+methodName,jsondata).map(res => res.json()).subscribe(res => {
        if(res.code == 1){
          this.config.callApi({refresh:1, method:'get_mytickets'});
          this.config.callApi({refresh:1, method:'get_mytickets_present_clients'});			

          if(submitType == 'discover'){
            this.isActiveForm = false;
            this.errorMessage = '<div class="alert alert-info">Ticket saved successfully!!</div>';
            this.spinnerService.hide();
            this.closeOption = true;
          }
          else{
            if(methodName == 'create_ticket'){
              this.formData.ticket_id = res.results.ticket_id;
              this.formData.reply_notes = "Hai "+this.formData.customer_name +this.custoemerResponseMsg;
              //this.formData.tiny_url = res.results.tiny_url;
              //For tiny url start
               this.http.post(this.config.shortenUrlApi,{longUrl:res.results.tiny_url}).map(res => res.json()).subscribe(res => {
                  this.formData.tiny_url = res.id;
                  this.spinnerService.hide();
              },
              error =>{
                this.createErrorLog(JSON.stringify(error),methodName,this.formData.ticket_id);
                this.formData.tiny_url = res.results.tiny_url;
                this.spinnerService.hide();
              });
              //For tiny url end            
            }
            else if(methodName == 'update_ticket'){
              this.spinnerService.hide();
            }
            this.isActiveVocform = true;
            this.closeOption = false;
          }
        }
        else if(res.code == 2){
          this.createErrorLog('ticket creation error code 2',methodName,this.formData.ticket_id);
          this.spinnerService.hide();
          this.errorMessage = '<div class="alert alert-warning">Ticket saved failed. Please try again!!</div>';
          this.closeOption = true;
        }
        else if(res.code == 3){
          this.createErrorLog('ticket creation error code 3',methodName,this.formData.ticket_id);
          this.spinnerService.hide();
          this.errorMessage = '<div class="alert alert-warning">Ticket saved failed. Your access temporary disabled!!</div>';
          this.closeOption = true;
        }
        else{
          this.createErrorLog('ticket creation error',methodName,this.formData.ticket_id);
          this.spinnerService.hide();
          this.errorMessage = '<div class="alert alert-warning">Webservice Error. Please try again!!</div>';
          this.closeOption = true;
        }
      }, 
      error => {
        this.spinnerService.hide();
        this.errorMessage = '<div class="alert alert-warning">Something went wrong. Please try again!!</div>';
      });
    }
  }

  submitTicketReply(){
    this.errorMessage = '';
    if(this.formData.customer_name == undefined || this.formData.customer_name == ''){
      this.customPresentToast('Please enter customername', 1000);
      return false;
    }
    else if(this.formData.reply_notes == undefined || this.formData.reply_notes == ''){
      this.customPresentToast('Please enter notes', 1000);
      return false;
    }
    else{
      let jsondata = {
        user_id: this.config.getCurrentUserId(),
        ticket_id: this.formData.ticket_id,
        customer_name: this.formData.customer_name,
        reply_notes: this.formData.reply_notes,
        discover_status: this.formData.discover_status,
        priority : this.formData.priority,
        group_id : this.formData.group_id,
        tiny_url : this.formData.tiny_url
      };

      let body = JSON.stringify(jsondata);
      this.http.post(this.config.getApiUrl()+'update_ticket_reply',body).map(res => res.json()).subscribe(res => {
        if(res.code == 1){
          this.isActiveForm = false;
          this.errorMessage = '<div class="alert alert-info">Ticket saved successfully!!</div>';
          this.createTicketToFreshDesk(jsondata);
          window.open(this.formData.complaint_url, '_blank');
        }
        else if(res.code == 2){
          this.createErrorLog('updation error code 2','update_ticket_reply',this.formData.ticket_id);
          this.errorMessage = '<div class="alert alert-warning">Ticket saved failed. Please try again!!</div>';
        }
        else{
          this.createErrorLog('updation error','update_ticket_reply',this.formData.ticket_id);
          this.errorMessage = '<div class="alert alert-warning">Webservice Error. Please try again!!</div>';
        }
        this.closeOption = true;
      }, 
      error => {
        this.createErrorLog(JSON.stringify(error),'update_ticket_reply',this.formData.ticket_id);
        this.errorMessage = '<div class="alert alert-warning">Something went wrong. Please try again!!</div>';
        this.closeOption = true;
      });
    }
  } 

  createTicketToFreshDesk(obj){
    //this.getFreshdeskCustomField(obj);
    let freshDeskApi = this.config.getUserDetail('freshDeskApi');
    let freshDeskPassword = this.config.getUserDetail('freshDeskPassword');
    let freshDeskDomain = this.config.getUserDetail('freshDeskDomain');
    let url = 'https://'+freshDeskDomain+'.freshdesk.com/api/v2/tickets';
    let email = 'email'+obj.ticket_id+'@voc-support.com';

    let jsondata = JSON.stringify({
      description: '<b>Complaint Url : </b>'+this.formData.complaint_url +'<br><br><b> Issue posted in social media : </b><br>'+this.formData.notes+'<br><br><b>Notes to be Posted in Social Media : </b><br>' +obj.reply_notes +' <br>'+ this.formData.tiny_url,
      email: email,
      subject: obj.customer_name,
      priority: Number(this.formData.priority),
      status: 6,
      type:this.formData.service_type_id.text1,
      group_id: Number(this.formData.group_id),
      custom_fields : { cf_voc_id: Number(this.formData.ticket_id)}
    });
    let headers = new Headers({ 'Content-Type': 'application/json', "Authorization": "Basic " + btoa(freshDeskApi + ":" + freshDeskPassword) });
    let options = new RequestOptions({ headers: headers });
    this.http.post(url, jsondata, options).map(res => res.json()).subscribe(res => {
      //update client_ticket_id start
      let body1 = JSON.stringify({
        ticket_id: obj.ticket_id,
        client_ticket_id: res.id,
        user_id: this.config.getCurrentUserId()
      });
      this.http.post(this.config.getApiUrl()+'update_ticket_id_freshdesk',body1).map(res => res.json()).subscribe(res => {},
      error => {
        this.createErrorLog(JSON.stringify(error),'update_ticket_id_freshdesk',obj.ticket_id);
      });
      //update client_ticket_id end

      if(!obj.ticket_id){
        this.mailToSupportAgent(obj.ticket_id);
      }

      //For error catch
      if(!res.id){
        this.createErrorLog(JSON.stringify(res),url,obj.ticket_id);
      }
     
    }, 
    error => {
      this.createErrorLog(JSON.stringify(error)+'...Ticket creation error in fresh desk',url,obj.ticket_id);
      this.mailToSupportAgent(obj.ticket_id);
    });
  }

  mailToSupportAgent(ticketId){
    let jsondata ={
         ticket_id : ticketId
       }
    this.http.post(this.config.getApiUrl()+'create_mail_for_ticket_failure',jsondata).map(res => res.json()).subscribe(res => {

    }, 
    error => {

    });
  }
  
  editTicket(){
    this.formTitle = 'Edit Ticket';
    this.isActiveVocform = false;
  }

  customPresentToast(text, duration) {
    this.customToast = true;
    this.customToastMsg = text;
    setTimeout(() => {
      this.customToast = false;
    }, duration);
  }

  getGroupsFreshDesk(){
      let jsondata ={
        status : 1
      }
      this.http.post(this.config.getApiUrl()+'get_freshdesk_groups',jsondata).map(res => res.json()).subscribe(res => {
        if(res.code == 1){
          this.groupList = res.results;
        }
        else{
          this.groupList = [{freshdesk_group_id:null,name:'No Group Available'}]
        }
      }, 
      error => {
        this.groupList = [{freshdesk_group_id:null,name:'No Group Available'}]
      });
  }

  
  //For Test Use
  autoSynch(){
    this.http.post('http://localhost/lenovo/cron/conversation?','').map(res => res.json()).subscribe(res => {
        console.log('darrrrrrrr',res)
    }, 
    error => {
      console.log('errorerror',error)
    });
  }

  getFreshdeskCustomField(){
    let freshDeskApi = this.config.getUserDetail('freshDeskApi');
    let freshDeskPassword = this.config.getUserDetail('freshDeskPassword');
    let freshDeskDomain = this.config.getUserDetail('freshDeskDomain');

    let url = 'https://'+freshDeskDomain+'.freshdesk.com/api/v2/ticket_fields';
    
    let headers = new Headers({ 'Content-Type': 'application/json', "Authorization": "Basic " + btoa(freshDeskApi + ":" + freshDeskPassword) });
    let options = new RequestOptions({ headers: headers });
    this.http.get(url, options).map(res => res.json()).subscribe(res => {
        console.log('custome field',res)
    }, 
    error => {
      console.log('custome field error',error)
    });
  }

  createErrorLog(err,errorApi,ticketId){
    let jsondata = JSON.stringify({
      error:err,
      error_api:errorApi,
      ticket_id:ticketId
    });
    this.http.post(this.config.getApiUrl()+'create_error_log',jsondata).map(res => res.json()).subscribe(res => {
        this.spinnerService.hide();
    }, 
    error => {
      this.spinnerService.hide();
    });
}

  

}
