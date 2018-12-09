import { Component, OnInit, OnDestroy } from '@angular/core';
import { DialogService } from "ng2-bootstrap-modal";
import { Router } from '@angular/router';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { error } from 'selenium-webdriver';

import { ConfigService } from '../config.service';
import { SocialDiscoveryComponent } from '../social-discovery/social-discovery.component';
import { TicketsNewComponent } from '../tickets-new/tickets-new.component';
import { TicketsViewComponent } from '../tickets-view/tickets-view.component';
import { SupportComponent } from '../support/support.component';
import { ViewticketComponent } from '../viewticket/viewticket.component';
import { TicketApproveComponent } from '../ticket-approve/ticket-approve.component'

import { NgDatepickerModule } from 'ng2-datepicker';
import { DatepickerOptions } from 'ng2-datepicker';
import * as frLocale from 'date-fns/locale/fr';
 


@Component({
  selector: 'tickets',
  templateUrl: './tickets.component.html',
  styleUrls: ['./tickets.component.css']
})
export class TicketsComponent implements OnInit, OnDestroy {

  fullname:String;
  profile_image:String = 'assets/icons/user.png';
  myTickets:any = [];
  responseMessage:string = 'Loading..';

  private data: any[];
  selectedEntities: any[];

  filteredItems:any;
  allRecords:any;
  searchOption:number = 1;
  msg:String = "Loading..."
  
  notification: any = [];
  subscription:any;

  customToastMsg:any;
  fixedCenterMsg:any;
  lenovoAgent:boolean = false;
  filterVal:any;
  date = Date.now();
  currentRole:any;
  groupList:any;
  oldTickets:any[];



  //calender start
  options: DatepickerOptions = {
  minYear: 1970,
  maxYear: 2030,
  displayFormat: 'DD-MM-YYYY',
  barTitleFormat: 'DD-MM-YYYY',
  firstCalendarDay: 0, // 0 - Sunday, 1 - Monday
 locale: frLocale,
  minDate: new Date(Date.now()), // Minimal selectable date
  maxDate: new Date(Date.now()),  // Maximal selectable date
  barTitleIfEmpty: 'Click to select a date'
  };
   //calender end
  
  constructor(
    private config:ConfigService,
    private dialogService:DialogService,
    private router: Router,
    private http:Http,
    private spinnerService: Ng4LoadingSpinnerService
  ) { 
    let userData = this.config.getUserDetails();
    this.fullname = userData.fullname;
    if(userData.profile_image != 'undefined' && userData.profile_image != null){
     //this.profile_image = userData.profile_image;
    }

    if(Number(userData.role) == this.config.getRoleAgentOwner()){
      this.lenovoAgent = true;
    }
    this.getMytickets({});

    Observable.interval(7000).subscribe(x => {
       if(Number(this.config.getCurrentRole()) == this.config.getRoleAgentOwner() || Number(this.config.getCurrentRole()) == this.config.getRoleAdmin()){
        this.refreshMytickets();
       } 
    });

    Observable.interval(300000).subscribe(x => {
      if(Number(this.config.getCurrentRole()) == this.config.getRoleAgentOwner() || Number(this.config.getCurrentRole()) == this.config.getRoleAdmin()){
       this.checkTicketStatus(false);
      } 
   });

   this.getFreshDeskGroups();
  }

  ngOnInit() {
     this.currentRole =Number(this.config.getCurrentRole()) ;
      if(this.currentRole != this.config.getRoleAdmin() && this.currentRole != this.config.getRoleAgentOwner()){
        localStorage.clear();
        this.router.navigateByUrl('/')
      }
      else{
        this.notificationChecking();
      }    
  }
  ngOnDestroy() {
      if(this.currentRole == this.config.getRoleAdmin() || this.currentRole == this.config.getRoleAgentOwner()){
        this.subscription.unsubscribe();
      }
  }

  getMytickets(obj) {
    this.config.callApi({status:1, discover_status:null, method:'get_mytickets',refresh:obj.refresh}).then(res => {
      this.msg = "No Record Found"  
      if(res.code == 1){
        this.myTickets = res.results;
        this.allRecords = res.results;//This for search option
        //this.msg = "No Record Found"  
      }
      else if(res.code == 2){
        this.responseMessage = 'No results found.';
        //this.msg = "No Record Found"
      }
      else{
        //this.msg = "No Record Found"
        this.responseMessage = 'Sorry!! Something went wrong.';
      }
    });
  }

  refreshMytickets(){
    let jsondata = JSON.stringify({status:1, discover_status:null });
    this.http.post(this.config.getApiUrl()+'get_mytickets',jsondata).map(res => res.json()).subscribe(res => {
      if(res.code == 1){
        this.allRecords = res.results;//This for search option
        if(this.filterVal == null){
          this.myTickets = res.results;
        }
        else{
          this.filterItem(this.filterVal)
        }
      }
    });
  }

  createNewTicket(){
    let disposable = this.dialogService.addDialog(TicketsNewComponent, {
      title:'Confirm title', 
      message:'Confirm message'},{ backdropColor: 'rgba(0, 0, 0, 0.5)' })
      .subscribe((isConfirmed)=>{
        if(isConfirmed) {
        }
        else {
          this.getMytickets({});
        }
    });
  }

  getSocialDiscovery(record){
  
    this.dialogService.addDialog(SocialDiscoveryComponent,{record:record,userId:this.config.getCurrentUserId()},{ backdropColor: 'rgba(0, 0, 0, 0.5)' })
  }

  getCutomerResponse(tockenId){
    this.dialogService.addDialog(SupportComponent,{tockenId:tockenId},{ backdropColor: 'rgba(0, 0, 0, 0.5)' })
  }

  requestSD(ticketID){
    this.spinnerService.show();
    this.config.updateSocialDiscovery({ticket_id:ticketID,user_id:this.config.getCurrentUserId()}).then(res => {
      if(res.code == 1){
        this.refreshMytickets();
        this.responseMessage = 'No results found.'; 
        this.spinnerService.hide();
      }
      else if(res.code == 2){
        this.responseMessage = 'No results found.';
        this.spinnerService.hide();
      }
      else{
        this.responseMessage = 'Sorry!! Something went wrong.';
        this.spinnerService.hide();
      }
    }, error => {
      this.responseMessage = 'Sorry!! Something went wrong.';
      this.spinnerService.hide();
    });

  }

  public setSelectedEntities($event: any) {
    this.selectedEntities = $event;
  }

  assignCopy(){
    this.myTickets = Object.assign([], this.allRecords);
  }

  filterItem(value){
    if(!value){
      this.filterVal = null;
      this.assignCopy(); //when nothing has typed
    } 
    else{
      this.filterVal = value;
     if(this.searchOption == 1){
        this.myTickets = Object.assign([], this.allRecords).filter(
          record => record.ticket_id.toLowerCase().indexOf(value.toLowerCase()) > -1)
      }
      else if(this.searchOption == 2){
        if(value == 1){
          this.assignCopy();
        }
        else{
           this.myTickets = Object.assign([], this.allRecords).filter(
             record => record.ticket_status.toLowerCase().indexOf(value) > -1)
        }
        // if(value == 1){
        //   let ticket_status = 1;
        //   let discovery_ticket_status = 0;
        //   let temp = Object.assign([], this.allRecords).filter(
        //     record => record.ticket_status.toLowerCase().indexOf(ticket_status) > -1)

        //   this.myTickets = Object.assign([], temp).filter(
        //     record => record.discovery_ticket_status.toLowerCase().indexOf(discovery_ticket_status) > -1)
        // }
        // else if(value == 2){
        //   let ticket_status = 1;
        //   let discovery_ticket_status = 1;
        //   let temp = Object.assign([], this.allRecords).filter(
        //     record => record.ticket_status.toLowerCase().indexOf(ticket_status) > -1)

        //   this.myTickets = Object.assign([], temp).filter(
        //     record => record.discovery_ticket_status.toLowerCase().indexOf(discovery_ticket_status) > -1)
        // }
        // else if(value == 3){
        //   let ticket_status = 3;
        //   this.myTickets = Object.assign([], this.allRecords).filter(
        //     record => record.ticket_status.toLowerCase().indexOf(ticket_status) > -1)
        // }
        // else if(value == 4){
        //   let ticket_status = 4;
        //   this.myTickets = Object.assign([], this.allRecords).filter(
        //     record => record.ticket_status.toLowerCase().indexOf(ticket_status) > -1)
        // }
        // else{
        //   this.assignCopy();
        // }
        
      }
      else if(this.searchOption == 3){
        this.myTickets = Object.assign([], this.allRecords).filter(
          record => record.customer_name.toLowerCase().indexOf(value.toLowerCase()) > -1)
      }
      else if(this.searchOption == 4){
        this.myTickets = Object.assign([], this.allRecords).filter(
          record => {
            if(record.email != null && record.email != undefined && record.email != ''){
             return record.email.toLowerCase().indexOf(value.toLowerCase()) > -1
            }
          })
      }
      else if(this.searchOption == 5){
       // var d = new Date(value);
       let month;
       if(value.getMonth()+1 >0 && value.getMonth()+1<10){
        month = '0'+(value.getMonth()+1);
       }
       else{
        month = value.getMonth()+1;
       }
       console.log('month',month)
       let date = value.getDate()+'-'+month +'-'+value.getFullYear()

        this.myTickets = Object.assign([], this.allRecords).filter(
          record => record.created_on.toLowerCase().indexOf(date.toLowerCase()) == 0)
      }
      else if(this.searchOption == 6){
        if(value == 1){
          let discover_status = 0;
          this.myTickets = Object.assign([], this.allRecords).filter(
            record => record.discover_status.toLowerCase().indexOf(discover_status) > -1)
        }
        else if(value == 2){
          let discover_status = 1;
          let discovery_ticket_status = 1; 
          let temp =  Object.assign([], this.allRecords).filter(
            record => record.discover_status.toLowerCase().indexOf(discover_status) > -1)
         
            this.myTickets = Object.assign([], temp).filter(
            record => record.discovery_ticket_status.toLowerCase().indexOf(discovery_ticket_status) > -1)
        }
        else if(value == 3){
          let discover_status = 1;
          let discovery_ticket_status = 0; 
          let temp =  Object.assign([], this.allRecords).filter(
            record => record.discover_status.toLowerCase().indexOf(discover_status) > -1)
          this.myTickets = Object.assign([], temp).filter(
            record => record.discovery_ticket_status.toLowerCase().indexOf(discovery_ticket_status) > -1) 
        }
        else{
          this.assignCopy();
        }
      }
      else if(this.searchOption == 7){
        if(value == 1){
          let customer_respond = 0;
          let customer_view = 0;
          let temp = Object.assign([], this.allRecords).filter(
            record => record.customer_respond.toLowerCase().indexOf(customer_respond) > -1)

          this.myTickets = Object.assign([], temp).filter(
            record => record.customer_view.toLowerCase().indexOf(customer_view) > -1)
        }
        else if(value == 2){
          let customer_respond = 0;
          let customer_view = 1;
          let temp = Object.assign([], this.allRecords).filter(
            record => record.customer_respond.toLowerCase().indexOf(customer_respond) > -1)

          this.myTickets = Object.assign([], temp).filter(
            record => record.customer_view.toLowerCase().indexOf(customer_view) > -1)
        }
        else if(value == 3){
          let customer_respond = 1;
          this.myTickets = Object.assign([], this.allRecords).filter(
            record => record.customer_respond.toLowerCase().indexOf(customer_respond) > -1)
        }
        else{
          this.assignCopy();
        }
      }
      else if(this.searchOption == 8){      
        if(value < 4){
          this.myTickets = Object.assign([], this.allRecords).filter(
            record => record.service_type_id.toLowerCase().indexOf(value) > -1)
        }
        else{
          this.assignCopy();
        }
      }
      else if(this.searchOption == 9){     
        if(value  == 1){
          this.assignCopy();
        }
        else{
          this.myTickets = Object.assign([], this.allRecords).filter(
            record => record.group_id.toLowerCase().indexOf(value) > -1)
        }
      }
      else{
        this.assignCopy();
      }
    }
 }

 viewTicket(item){
  window.localStorage.setItem('ticket_id',item.ticket_id);
  window.localStorage.setItem('client_ticket_id',item.client_ticket_id);
  let disposable = this.dialogService.addDialog(TicketsViewComponent, {
    title:'Confirm title', 
    message:'Confirm message',
    record:item
  },{ backdropColor: 'rgba(0, 0, 0, 0.5)' }).subscribe((isConfirmed)=>{
    if(isConfirmed) {
    }
    else {
    }
  });
}

  openViewTicket(record){
    this.dialogService.addDialog(ViewticketComponent,{record:record,agent_type:1},{ backdropColor: 'rgba(0, 0, 0, 0.5)' })
  }

  logout(){
    localStorage.clear();
    this.router.navigateByUrl('/')
  }
  
  getFreshDeskTicketsAndSync(item, type){
    this.config.callApi({refresh:1, method:'get_ticket_details'});
    let freshDeskApi = this.config.getUserDetail('freshDeskApi');
    let freshDeskPassword = this.config.getUserDetail('freshDeskPassword');
    let freshDeskDomain = this.config.getUserDetail('freshDeskDomain');
    let url = 'https://'+freshDeskDomain+'.freshdesk.com/api/v2/tickets/'+item.client_ticket_id+'/conversations';
    let jsondata = JSON.stringify({});
    let headers = new Headers({ 'Content-Type': 'application/json', "Authorization": "Basic " + btoa(freshDeskApi + ":" + freshDeskPassword) });
    let options = new RequestOptions({ headers: headers });
    this.fixedCenterMsg = 'Please wait...';
    this.http.get(url, options).map(res => res.json()).subscribe(res => {
      let body1 = JSON.stringify({
        ticket_id: item.ticket_id,
        insert_type: 2, //1 manual 2 freshdesk,
        items:res,
        user_id: this.config.getCurrentUserId()
      });
      this.http.post(this.config.getApiUrl()+'create_ticket_details',body1).map(res => res.json()).subscribe(insertRes => {
        this.fixedCenterMsg = '';
        if(insertRes.code == 1){
          if(type == 1){
            this.customPresentToast('Sync success', 1000);
          }
        }
        else{
          if(type == 1){
            this.customPresentToast('Sync success. No data found', 1000);
          }
        }
      }, error => {
        this.fixedCenterMsg = '';
        if(type == 1){
          this.customPresentToast('Error. Try again', 1000);
        }
      });
    }, 
    error => {
      this.fixedCenterMsg = '';
      if(type == 1){
        this.customPresentToast('Error. Try again', 1000);
      }
    });
  }

  syncAllTicketTransactions(){
    this.config.callApi({status:1, discover_status:null, method:'get_mytickets_present_clients'}).then(res => {
      if(res.code == 1){
        if(res.results.length > 0){
          for(var i=0; i<res.results.length; i++){
            this.getFreshDeskTicketsAndSync(res.results[i], 2);
          }
        }
      }
      else if(res.code == 2){
        this.customPresentToast('No results found', 1000);
      }
      else{
        this.customPresentToast('Sorry!! Something went wrong.', 1000);
      }
    });
  }

  customPresentToast(text, duration) {
    this.customToastMsg = text;
    setTimeout(() => {
      this.customToastMsg = '';
    }, duration);
  }
  
	//Notification start
  notificationChecking(){
    let timer = Observable.timer(2000,60000);//start, every 1 minute
    this.subscription = timer.subscribe(t=> {
      this.config.callNotificationChecking({}).then(res => {
        if(res.code == 1){
          this.notification = res;
        }
        else{
          this.notification = {total_count:0, notify_count:0, cutomer_notify_count:0 };
        }
      });
    });
  }

  notificationClosed(){
    this.notification = {total_count:0, notify_count:0, cutomer_notify_count:0 };
    this.config.callNotificationClosed();
  }
  //Notification end


  /****STATUS UPDATE START*****/
  checkTicketStatus(refresh){
    if(refresh){
      this.fixedCenterMsg = 'Please wait...';
    }
    let jsondata ={
      status :1,
      discover_status : null
    }
    this.http.post(this.config.getApiUrl()+'get_tickets_for_status_update',jsondata).map(res => res.json()).subscribe(res => {
      if(res.code == 1){
        if(refresh){
          this.fixedCenterMsg = '';
          this.customPresentToast('Sync success', 1000);
        }
        if(res.results.length > 0){
            this.getTicketFromFreshdesk(res.results);
        }
      }
      else if(res.code == 2){
        if(refresh){
          this.fixedCenterMsg = '';
           this.customPresentToast('No results found', 1000);
        }
      }
      else{
        if(refresh){
          this.fixedCenterMsg = '';
          this.customPresentToast('Sorry!! Something went wrong.', 1000);
        }
      }
    }, 
    error => {});
  }

  getTicketFromFreshdesk(ticket){
    let freshDeskApi = this.config.getUserDetail('freshDeskApi');
    let freshDeskPassword = this.config.getUserDetail('freshDeskPassword');
    let freshDeskDomain = this.config.getUserDetail('freshDeskDomain');
  
    let currentDate = new Date(Date.now());
    let customeDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    customeDate.setMonth(customeDate.getMonth()-1);
    let date = customeDate.getFullYear()+'-'+("0" + (customeDate.getMonth() + 1)).slice(-2)+'-'+ ("0" + customeDate.getDate()).slice(-2);

    let url = 'https://'+freshDeskDomain+'.freshdesk.com/api/v2/tickets?updated_since='+date;

    let headers = new Headers({ 'Content-Type': 'application/json', "Authorization": "Basic " + btoa(freshDeskApi + ":" + freshDeskPassword) });
    let options = new RequestOptions({ headers: headers });
    this.http.get(url, options).map(res => res.json()).subscribe(res => {
      ticket.forEach(element1 => {
        res.forEach(element2 => {
          if(element1.id == element2.id && Number(element1.ticket_status)!= element2.status){
            this.updateTicketStatusInVOC(element1.ticket_id,element2.status);
          }
        });
      });
    }, 
    error => {
    });
  }

  updateTicketStatusInVOC(ticketID,newStatus){
    let jsondata ={
      ticket_id :ticketID,
      status : newStatus,
      user_id:this.config.getCurrentUserId()
    }
    this.http.post(this.config.getApiUrl()+'update_ticket_status',jsondata).map(res => res.json()).subscribe(res => {
    }, 
    error => {});
  }
   /****STATUS UPDATE END*****/

   getFreshDeskGroups(){
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

openApproveTicket(item){
  
  // this.oldTickets = Object.assign([], this.myTickets).filter(
  //   record => {
  //     if(record.email){
  //       record.email.toLowerCase().indexOf(item.email.toLowerCase()) > -1;
  //     }
  //   })


  let oldTickets = [];
 // console.log(this.myTickets)
    this.myTickets.forEach(function (value) {
      //console.log(value)
      if(value.email && value.email == item.email && value.ticket_id != item.ticket_id){
        //this.oldTickets=value;
          oldTickets.push(value);
        // console.log('itemmmmmmmm',oldTickets)
      }
    });

  let disposable = this.dialogService.addDialog(TicketApproveComponent, {
    title:'Confirm title', 
    message:'Confirm message',
    record:item,
    oldTickets:oldTickets
    //allRecord:this.myTickets
  },{ backdropColor: 'rgba(0, 0, 0, 0.5)' }).subscribe((isConfirmed)=>{
    if(isConfirmed) {
    }
    else {
    }
  });
}

}
