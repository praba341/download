import { Component, OnInit } from '@angular/core';
import { DialogService } from "ng2-bootstrap-modal";
import { Router } from '@angular/router';
import { window } from 'rxjs/operators/window';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Jsonp } from '@angular/http/src/http';
import { Observable } from 'rxjs/Rx';

import { ConfigService } from '../config.service';
import { SocialDiscoveryComponent } from '../social-discovery/social-discovery.component';
import { ViewticketComponent } from '../viewticket/viewticket.component';
import { SupportComponent } from '../support/support.component';
import { TicketsViewComponent } from '../tickets-view/tickets-view.component';
import { timeout } from 'rxjs/operator/timeout';

@Component({
  selector: 'app-agent-dashboard',
  templateUrl: './agent-dashboard.component.html',
  styleUrls: ['./agent-dashboard.component.css']
})
export class AgentDashboardComponent implements OnInit  {

  fullname:String;
  profileImage:String = 'assets/icons/user.png';
  userRole:any;
  records=[];

  filteredItems:any;
  allRecords:any;
  searchOption:number = 1;
  sample:boolean=false;
  msg:String = "Loading..."
  customToastMsg:any;
  fixedCenterMsg:any;
  syncAll:boolean=false;
  filterVal:any;
  date = Date.now();

  selectedRow : Number;
  setClickedRow : Function;
  

  constructor(
    private config:ConfigService,
    private dialogService:DialogService,
    private router: Router,
    private http:Http,
    private spinnerService: Ng4LoadingSpinnerService) { 


    let currentRole =Number(this.config.getCurrentRole()) ;
    if(currentRole != this.config.getRoleAgenClient()){
      localStorage.clear();
      this.router.navigateByUrl('/')
    }
    else{
      let userData = this.config.getUserDetails();
      this.fullname = userData.fullname;
  
      if(userData.profile_image != undefined && userData.profile_image != 'null' && userData.profile_image != 'unknown' ){     
        this.profileImage = userData.profile_image;
        this.userRole = userData.role;
      }
       this.getDiscoveryRecords(false)
  
       this.setClickedRow = function(index){
        this.selectedRow = index;
      }
  
      //For Refresh Table
      Observable.interval(5000).subscribe(x => {
        if(Number(this.config.getCurrentRole()) == this.config.getRoleAgenClient()){
            this.getDiscoveryRecords(true);
        }
      });
    }

  }

  ngOnInit() {
  }


  openCreateForm(record){
    let disposable = this.dialogService.addDialog(SocialDiscoveryComponent,{record:record,userId:this.config.getCurrentUserId()},{ backdropColor: 'rgba(0, 0, 0, 0.5)'
    })
      .subscribe((isConfirmed)=>{
        //We get dialog result
        if(isConfirmed) {
          console.log('isConfirmed');
        }
        else {
          this. getDiscoveryRecords(true);
        }
    });
  
  }

  openViewTicket(record){
    this.dialogService.addDialog(ViewticketComponent,{record:record,agent_type:2},{ backdropColor: 'rgba(0, 0, 0, 0.5)' })
  }

  getCutomerResponse(tockenId){
    this.dialogService.addDialog(SupportComponent,{tockenId:tockenId},{ backdropColor: 'rgba(0, 0, 0, 0.5)' })
  }

  logout(){
    localStorage.clear();
    this.router.navigateByUrl('/')
  }

  getDiscoveryRecords(refresh){
    if(!refresh){
      this.spinnerService.show();
    }
    let jsondata = JSON.stringify({type:1 });
    this.http.post(this.config.getApiUrl()+'get_dicoveryRecords',jsondata).map(res => res.json()).subscribe(res => {
      this.spinnerService.hide();
      if(res.code == 1){
        this.allRecords = res.results;//This for search option
        if(this.filterVal == null){
          this.records = res.results;
        }
        else{
          this.filterItem(this.filterVal)
        }
      }
      else if(res.code == 2){
        this.msg = "No Record Found"
      }
      else{
        this.msg = "Get data failed"
      }
    
    }, 
    error => {
      if(!refresh){
      this.spinnerService.hide();
      }
      this.msg = "No Record Found"
    });
  }


  assignCopy(){
    
    this.records = Object.assign([], this.allRecords);
 }
 filterItem(value){
    if(!value){
      this.filterVal = null;
      this.assignCopy(); //when nothing has typed
    } 
    else{
      this.filterVal = value;
     if(this.searchOption == 1){
        this.records = Object.assign([], this.allRecords).filter(
          record => record.ticket_id.toLowerCase().indexOf(value.toLowerCase()) > -1)
      }
      // else if(this.searchOption == 2 && value < 2){   
      //   this.records = Object.assign([], this.allRecords).filter(
      //     record => record.discovery_ticket_status.toLowerCase().indexOf(value.toLowerCase()) > -1)
      // }
      else if(this.searchOption == 2){
        if(value == 1){
          let ticket_status = 1;
          let discovery_ticket_status = 0;
          let temp = Object.assign([], this.allRecords).filter(
            record => record.ticket_status.toLowerCase().indexOf(ticket_status) > -1)

          this.records = Object.assign([], temp).filter(
            record => record.discovery_ticket_status.toLowerCase().indexOf(discovery_ticket_status) > -1)
        }
        else if(value == 2){
          let ticket_status = 1;
          let discovery_ticket_status = 1;
          let temp = Object.assign([], this.allRecords).filter(
            record => record.ticket_status.toLowerCase().indexOf(ticket_status) > -1)

          this.records = Object.assign([], temp).filter(
            record => record.discovery_ticket_status.toLowerCase().indexOf(discovery_ticket_status) > -1)
        }
        else if(value == 3){
          let ticket_status = 3;
          this.records = Object.assign([], this.allRecords).filter(
            record => record.ticket_status.toLowerCase().indexOf(ticket_status) > -1)
        }
        else if(value == 4){
          let ticket_status = 4;
          this.records = Object.assign([], this.allRecords).filter(
            record => record.ticket_status.toLowerCase().indexOf(ticket_status) > -1)
        }
        else{
          this.assignCopy();
        }
        
      }
      else if(this.searchOption == 3){
        this.records = Object.assign([], this.allRecords).filter(
          record => record.customer_name.toLowerCase().indexOf(value.toLowerCase()) > -1)
      }
      else if(this.searchOption == 4){
        this.records = Object.assign([], this.allRecords).filter(
          record => {
            if(record.email != null && record.email != undefined && record.email != ''){
             return record.email.toLowerCase().indexOf(value.toLowerCase()) > -1
            }
          })
      }
      else if(this.searchOption == 5){
        let month;   
        if(value.getMonth()+1 >0 && value.getMonth()+1<10){
         month = '0'+(value.getMonth()+1);
        }
        else{
         month = value.getMonth()+1;
        }
        let date = value.getFullYear()+'-'+ month +'-'+value.getDate();
        
        this.records = Object.assign([], this.allRecords).filter(
          record => record.created_on.toLowerCase().indexOf(date.toLowerCase()) == 0)
      }
      else if(this.searchOption == 6){
        if(value == 1){
          let customer_respond = 0;
          let customer_view = 0;
          let temp = Object.assign([], this.allRecords).filter(
            record => record.customer_respond.toLowerCase().indexOf(customer_respond) > -1)

          this.records = Object.assign([], temp).filter(
            record => record.customer_view.toLowerCase().indexOf(customer_view) > -1)
        }
        else if(value == 2){
          let customer_respond = 0;
          let customer_view = 1;
          let temp = Object.assign([], this.allRecords).filter(
            record => record.customer_respond.toLowerCase().indexOf(customer_respond) > -1)

          this.records = Object.assign([], temp).filter(
            record => record.customer_view.toLowerCase().indexOf(customer_view) > -1)
        }
        else if(value == 3){
          let customer_respond = 1;
          this.records = Object.assign([], this.allRecords).filter(
            record => record.customer_respond.toLowerCase().indexOf(customer_respond) > -1)
        }
        else{
          this.assignCopy();
        }
      }
      else if(this.searchOption == 7){
        if(value < 4){
          this.records = Object.assign([], this.allRecords).filter(
            record => record.service_type_id.toLowerCase().indexOf(value) > -1)
        }
        else{
          this.assignCopy();
        }
      }
      else if(this.searchOption == 8){
        if(value <2){
          this.records = Object.assign([], this.allRecords).filter(
            record => record.discovery_ticket_status.toLowerCase().indexOf(value) > -1)
        }
        else{
          this.assignCopy();
        }
      }
      else{
        this.assignCopy();
      }
    }
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
          this.selectedRow = null;
        }
      }
      else{
        if(type == 1){
          this.customPresentToast('Sync success. No data found', 1000);
          this.selectedRow = null;
        }
      }
    }, error => {
      this.fixedCenterMsg = '';
      if(type == 1){
        this.customPresentToast('Error. Try again', 1000);
        this.selectedRow = null;
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
          if(i+1 == res.results.length){
            setTimeout(() => {
            }, 1100);
          }
        }
      }
    }
    else if(res.code == 2){
      this.customPresentToast('No results found', 1000);
    }
    else{
      this.syncAll = false;
      this.customPresentToast('Sorry!! Something went wrong.', 1000);
    }
  });
}

viewTicket(item){
 this.config.setTicketDettails(item);
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

customPresentToast(text, duration) {
  this.customToastMsg = text;
  setTimeout(() => {
    this.customToastMsg = '';
  }, duration);
}

}
