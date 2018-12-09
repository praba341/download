import { Component, OnInit } from '@angular/core';
import { DialogService } from "ng2-bootstrap-modal";

import { ConfigService } from '../config.service';
import { SocialDiscoveryComponent } from '../social-discovery/social-discovery.component';
import { TicketsNewComponent } from '../tickets-new/tickets-new.component';
import { TicketsViewComponent } from '../tickets-view/tickets-view.component';
import { SupportComponent } from '../support/support.component';
import { Router } from '@angular/router';
import { Http, Response, Headers, RequestOptions } from '@angular/http';

@Component({
  selector: 'transaction',
  templateUrl: './transaction.component.html',
  styleUrls: ['./transaction.component.css']
})
export class TransactionComponent implements OnInit {

  fullname:String;
  profile_image:String = 'assets/icons/user.png';
  menu :boolean=false;
  menu_class:String='col-sm-11';
  myTickets:any = [];
  responseMessage:string = 'Loading..';

  private data: any[];
  selectedEntities: any[];

  filteredItems:any;
  allRecords:any;
  searchOption:number = 1;
  
  constructor(
    private config:ConfigService,
    private dialogService:DialogService,
    private router: Router,
    private http:Http
  ) { 
    let userData = this.config.getUserDetails();
    this.fullname = userData.fullname;
    if(userData.profile_image != 'undefined' && userData.profile_image != null){
     //this.profile_image = userData.profile_image;
    }
    this.getMytickets({});
  }

  ngOnInit() {
  }

  sideMenu(){
    if(this.menu == true){
      this.menu= false;
      this.menu_class='col-sm-11'
    }
    else{
      this.menu= true;
      this.menu_class='col-sm-9'
    }
  }

  getMytickets(obj) {
    this.config.callMyTickets({}).then(res => {
      if(res.code == 1){
        this.myTickets = res.results;
        this.allRecords = res.results;//This for search option  
      }
      else if(res.code == 2){
        this.responseMessage = 'No results found.';
      }
      else{
        this.responseMessage = 'Sorry!! Something went wrong.';
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
    this.config.updateSocialDiscovery({ticket_id:ticketID,user_id:this.config.getCurrentUserId()}).then(res => {
   
      if(res.code == 1){
        this.getMytickets({});
        this.responseMessage = 'No results found.'; 
      }
      else if(res.code == 2){
        this.responseMessage = 'No results found.';
      }
      else{
        this.responseMessage = 'Sorry!! Something went wrong.';
      }
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
      this.assignCopy(); //when nothing has typed
    } 
    else{
     if(this.searchOption == 1){
        this.myTickets = Object.assign([], this.allRecords).filter(
          record => record.ticket_id.toLowerCase().indexOf(value.toLowerCase()) > -1)
      }
      else if(this.searchOption == 2 && value <= 2){ 
        this.myTickets = Object.assign([], this.allRecords).filter(
          record => record.ticket_status.toLowerCase().indexOf(value.toLowerCase()) > -1)
      }
      else if(this.searchOption == 2 && value == 3){
        this.myTickets = Object.assign([], this.allRecords).filter(
          record => record.discover_status.toLowerCase().indexOf(1) > -1)
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
    results1:item
  },{ backdropColor: 'rgba(0, 0, 0, 0.5)' }).subscribe((isConfirmed)=>{
    if(isConfirmed) {
    }
    else {
    }
  });
}

 getFreshDeskTicketsAndSync(item){
  this.config.callApi({refresh:1, method:'get_ticket_details'});
  let freshDeskApi = this.config.getUserDetail('freshDeskApi');
  let freshDeskPassword = this.config.getUserDetail('freshDeskPassword');
  let freshDeskDomain = this.config.getUserDetail('freshDeskDomain');
  let url = 'https://'+freshDeskDomain+'.freshdesk.com/api/v2/tickets/'+item.client_ticket_id+'/conversations';
  let jsondata = JSON.stringify({});
  let headers = new Headers({ 'Content-Type': 'application/json', "Authorization": "Basic " + btoa(freshDeskApi + ":" + freshDeskPassword) });
  let options = new RequestOptions({ headers: headers });
  this.http.get(url, options).map(res => res.json()).subscribe(res => {
    let body1 = JSON.stringify({
      ticket_id: item.ticket_id,
      insert_type: 2, //1 manual 2 freshdesk,
      items:res,
      user_id: this.config.getCurrentUserId()
    });      
    this.http.post(this.config.getApiUrl()+'create_ticket_details',body1).map(res => res.json()).subscribe(insertRes => {
      if(insertRes.code == 1){
        alert('Success');
        console.log('insert success');
      }
      else{
        console.log('insert failed');
      }
    }, error => {

    });
  }, 
  error => {
  });
}

  logout(){
    localStorage.clear();
    this.router.navigateByUrl('/')
  }

}
