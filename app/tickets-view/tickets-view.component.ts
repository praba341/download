import { Component, OnInit } from '@angular/core';
import { DialogComponent, DialogService } from "ng2-bootstrap-modal";
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import{ ConfigService } from '../config.service'
export interface ConfirmModel{}

@Component({
  selector: 'tickets-view',
  templateUrl: './tickets-view.component.html',
  styleUrls: ['./tickets-view.component.css']
})
export class TicketsViewComponent  extends DialogComponent<ConfirmModel, boolean> implements ConfirmModel {

  results:any = [];
  ticket_id:string = '';
  client_ticket_id:string = '';
  formTitle:string = 'View Ticket';
  record:any;
  conversationMsg:String = 'Loading...';
  editOption:boolean = false;
  customToastMsg:any;
  record_ticket_status = 0;
  formData = {
    ticket_id:null,
    customer_name: '',
    complaint_url: '',
    notes: '',
    service_type_id:''
  };

  status =[
      {'value':0, 'name':'Select new status' },
      {'value':5, 'name':'Closed' },
  ];

  constructor(
    dialogService: DialogService,
    private http:Http,
    public config:ConfigService,
    private spinnerService: Ng4LoadingSpinnerService
  ) {
    super(dialogService);
    this.config.callApi({refresh:1, method:'get_ticket_details'});
    this.ticket_id = window.localStorage.getItem('ticket_id');
    this.client_ticket_id = window.localStorage.getItem('client_ticket_id');
    this.getTickets({});

  }

  ngOnInit() {
    if(this.record.ticket_status == 5){
      this.record_ticket_status = this.record.ticket_status;
    }
    //console.log('csssssss',this.record)
  }

  getTickets(obj) {
    this.config.callApi({ticket_id:this.ticket_id, method:'get_ticket_details'}).then(res => {
      if(res.code == 1){
        this.conversationMsg = 'Conversation History';
        this.results = res.results;
        console.log('convertion mag',this.results)
      }
      else{
        this.conversationMsg = 'No conversation Found';
      }
    });
  }

  edit(record){
    this.editOption = true;
    this.formData = record;
  }

  save(){
    this.spinnerService.show();
    let jsondata = JSON.stringify({
      user_id: this.config.getCurrentUserId(),
      ticket_id: this.formData.ticket_id,
      customer_name: this.formData.customer_name,
      complaint_url: this.formData.complaint_url,
      notes: this.formData.notes,
      service_type_id: this.formData.service_type_id,
    });
    this.http.post(this.config.getApiUrl()+'update_ticket',jsondata).map(res => res.json()).subscribe(res => {
      this.spinnerService.hide();
      if(res.code == 1){
        this.editOption = false;
        this.customPresentToast('Ticket updated sucessfully', 1000);
      }
      else{
        this.customPresentToast('Ticket update failed', 1000);
      }
    }, 
    error => {
      this.spinnerService.hide();
      this.customPresentToast('Ticket update failed', 1000);
    });
  }

  customPresentToast(text, duration) {
    this.customToastMsg = text;
    setTimeout(() => {
      this.customToastMsg = '';
    }, duration);
  }

  updateStatus(record){
    if(this.record_ticket_status != 5){
      this.customPresentToast('Please choose correct status', 1500);
      return false;
    }
    this.spinnerService.show();
    let freshDeskApi = this.config.getUserDetail('freshDeskApi');
    let freshDeskPassword = this.config.getUserDetail('freshDeskPassword');
    let freshDeskDomain = this.config.getUserDetail('freshDeskDomain');
    let url = 'https://'+freshDeskDomain+'.freshdesk.com/api/v2/tickets/'+record.client_ticket_id;
    
    let jsondata = JSON.stringify({
      status : Number(this.record_ticket_status)
    });
    let headers = new Headers({ 'Content-Type': 'application/json', "Authorization": "Basic " + btoa(freshDeskApi + ":" + freshDeskPassword) });
    let options = new RequestOptions({ headers: headers });
    this.http.put(url, jsondata, options).map(res => res.json()).subscribe(res => {
        
      let jsondata = JSON.stringify({
        ticket_id : record.ticket_id,
        status  : this.record_ticket_status,
        user_id : this.config.getCurrentUserId()
      });
      this.http.post(this.config.getApiUrl()+'update_ticket_status',jsondata).map(res => res.json()).subscribe(res => {
          this.spinnerService.hide();
          if(res.code == 1){
             this.customPresentToast('Ticket status updated sucessfully', 1000);
          }
          else{
            this.customPresentToast('Ticket status update failed in local but updated successful in freshdesk', 1000);
          }
        }, 
        error => {
          this.spinnerService.hide();
          this.customPresentToast('Ticket status update failed in local but updated successful in freshdesk', 1000);
        });
    }, 
    error => {
      this.customPresentToast('Ticket status update failed', 1000);
    });
  }

}
