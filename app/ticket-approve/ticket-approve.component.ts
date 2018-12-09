import { Component, OnInit } from '@angular/core';
import { DialogComponent, DialogService } from "ng2-bootstrap-modal";
import { Http, Headers, RequestOptions } from '@angular/http';
import{ ConfigService } from '../config.service'
export interface ConfirmModel{}
import {Observable} from 'rxjs'; // Angular 6 

@Component({
  selector: 'app-ticket-approve',
  templateUrl: './ticket-approve.component.html',
  styleUrls: ['./ticket-approve.component.css']
})
//export class TicketApproveComponent implements OnInit {
export class TicketApproveComponent  extends DialogComponent<ConfirmModel, boolean> implements ConfirmModel {

  record:any;
  allRecord:any=[];
  oldTickets:any;
  formData:any = [];
  ticketServiceTypes:any = [];
  groupList:any;
  responseMsg:String;
  customToastMsg:string = '';
  customToast:boolean = false;
  isActiveForm:boolean = true;
  priortyList = [{value:4,name:'Urgent'},{value:3,name:'High'},{value:2,name:'Medium'},{value:1,name:'Low'}]
  constructor(dialogService: DialogService,
    private http:Http,
    public config:ConfigService) { 
    super(dialogService);

    this.formData = {
      ticket_id: null,
      service_type_id: '',
      priority:'',
      group_id:''
    };
    
    this.getTicketServieTypes({});
    this.getGroupsFreshDesk();
    //this.getCustomerOldTicketDetails();
  }

  ngOnInit() {
    // this.getCustomerOldTicketDetails();
    // this.allRecord.forEach(function (value) {
    //   if(value.email == this.record.email){
    //     //this.oldTickets=value;
    //     this.oldTickets.push(value);
         console.log('itemmmmmmmm',this.oldTickets)
    //   }
    // });

   
  }

  getTicketServieTypes(obj) {
    this.config.getTicketServieTypes({}).then(res => {
  
      if(res.code == 1){
        this.ticketServiceTypes = res.results;
      }
    });
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

  approveTicket(record){

    if(this.formData.service_type_id==undefined || this.formData.service_type_id ==''){
      this.customPresentToast('Please select identtify type', 1000);
      return false;
    }
    else if(this.formData.priority==undefined || this.formData.priority ==''){
      this.customPresentToast('Please select severity level', 1000);
      return false;
    }
    else if(this.formData.group_id==undefined || this.formData.group_id ==''){
      this.customPresentToast('Please select gourp type', 1000);
      return false;
    }
    else{
        this.createTicketToFreshDesk(record);
    }
   
  }

  createTicketToFreshDesk(obj){
    //this.getFreshdeskCustomField(obj);
    let freshDeskApi = this.config.getUserDetail('freshDeskApi');
    let freshDeskPassword = this.config.getUserDetail('freshDeskPassword');
    let freshDeskDomain = this.config.getUserDetail('freshDeskDomain');
    let url = 'https://'+freshDeskDomain+'.freshdesk.com/api/v2/tickets';
    //let email = 'email'+obj.ticket_id+'@voc-support.com';

    let jsondata = JSON.stringify({
      //description: '<b>Complaint Url : </b>'+this.formData.complaint_url +'<br><br><b> Issue posted in social media : </b><br>'+this.formData.notes+'<br><br><b>Notes to be Posted in Social Media : </b><br>' +obj.reply_notes +' <br>'+ this.formData.tiny_url,
      description:obj.message,
      email: obj.email,
      subject: obj.customer_name,
      priority: Number(this.formData.priority),
      status: 2,//Open
      type:this.formData.service_type_id.text1,
      group_id: Number(this.formData.group_id),
      custom_fields : { cf_voc_id: Number(obj.ticket_id), cf_product: obj.product_name, cf_category: obj.category_name}
    });

    // console.log('aproveeeeee',jsondata)
    let headers = new Headers({ 'Content-Type': 'application/json', "Authorization": "Basic " + btoa(freshDeskApi + ":" + freshDeskPassword) });
    let options = new RequestOptions({ headers: headers });
    this.http.post(url, jsondata, options).map(res => res.json()).subscribe(res => {
      //update client_ticket_id start
      let body1 = JSON.stringify({
        ticket_id: obj.ticket_id,
        service_type_id:this.formData.service_type_id.id,
        ticket_status:2,//Open
        priority:this.formData.priority,
        customer_respond:1,//Voc responded
        client_ticket_id: res.id,
        group_id:this.formData.group_id,
        user_id: this.config.getCurrentUserId()
      });
      this.http.post(this.config.getApiUrl()+'update_customer_ticket',body1).map(res => res.json()).subscribe(res => {
        if(res.code==1){
          this.isActiveForm = false;
          this.responseMsg = '<div class="alert alert-info">Ticket approved successfully..!</div>';
        }
        else{
          this.isActiveForm = false;
          this.responseMsg = '<div class="alert alert-warning">Ticket approve failed...But ticket created in freshdesk..Please contact admin..!!</div>';
        }
      },
      error => {
        this.isActiveForm = false;
        this.responseMsg = '<div class="alert alert-warning">Ticket approve failed...But ticket created in freshdesk..Please contact admin..!!</div>';
      });
      //update client_ticket_id end

      if(!obj.ticket_id){
        this.mailToSupportAgent(obj.ticket_id);
      }
    }, 
    error => {
      this.isActiveForm = false;
      this.responseMsg = '<div class="alert alert-warning">Ticket approve failed...Please try again..!!</div>';
      this.mailToSupportAgent(obj.ticket_id);
    });
  }

  rejectTicket(record){
    let body = JSON.stringify({
      ticket_id: record.ticket_id,
      ticket_status:8,//Rejected
      user_id: this.config.getCurrentUserId()
    });
    this.http.post(this.config.getApiUrl()+'update_customer_ticket_status',body).map(res => res.json()).subscribe(res => {
      if(res.code==1){
        this.isActiveForm = false;
        this.responseMsg = '<div class="alert alert-info">Ticket rejected successfully..!</div>';
      }
      else{
        this.isActiveForm = false;
        this.responseMsg = '<div class="alert alert-warning">Ticket rejected failed please try again..!!</div>';
      }
    },
    error => {
      this.isActiveForm = false;
      this.responseMsg = '<div class="alert alert-warning">Ticket rejected failed please try again..!!</div>';
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

  customPresentToast(text, duration) {
    this.customToast = true;
    this.customToastMsg = text;
    setTimeout(() => {
      this.customToast = false;
    }, duration);
  }

  getCustomerOldTicketDetails(){

    this.allRecord.forEach(function (value) {
      if(value.email == this.record.email){
        //this.oldTickets=value;
        this.oldTickets.push(value);
        console.log('itemmmmmmmm',this.oldTickets)
      }
    });

    // let email=this.record.email;
    // this.allRecord.forEach(function (value) {
    //   if(value.email == email){
    //     //this.oldTickets=value;
    //     this.oldTickets.push(value);
    //     //console.log('itemmmmmmmm',this.oldTickets)
    //   }
    // });
     


    //console.log('ttttttttttttt',this.record.email)
    //console.log('dddddddddd',this.allRecord)
    // this.oldTickets = Object.assign([], this.allRecord).filter(
    //   record => {
    //     if(record.email){
    //       record.email.toLowerCase().indexOf(this.record.email.toLowerCase()) > -1
    //       //console.log('itemmmmmmmm',this.oldTickets)
    //     }
    //     // else{
    //     //   record.email.indexOf(this.record.email.toLowerCase()) > -1
    //     // }
    //   }
    //   )

      // Observable.interval(1000).subscribe(x => {
      //   console.log('itemmmmmmmm',this.oldTickets)
      // });

  }

}
