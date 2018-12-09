import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';

@Injectable()
export class ConfigService {

  //  url:String ="http://localhost:8080/lenovo_3";
   url:String ="https://pointnine9.com/lenovo_api";
   //  url:String ="https://voc-support.com/lenovo_api"; 
   // url:String ="https://162.144.99.174/lenovo_api";
  
  
  shortenUrlApi:string='https://www.googleapis.com/urlshortener/v1/url?key=AIzaSyDP-qeNfcFtExgrTz9MTUkWOSMjWc3pT4E';

  ticketServiceTypes:any = [];
  ticketServiceTypesRefresh:number = 1;
  myTickets:any = [];
  myTicketsRefresh:number = 1;
  ticketInfoBasedTinyUrl:any = [];
  ticketInfoBasedTinyUrlRefresh:number = 1;
  results:any = [];

  constructor(
    private http:Http
  ) { 
    
  }
  
  getBaseUrl(){
    return  this.url;
  }

  getApiUrl(){
    return this.url+'/mobile/webservice?method=';
  }

  getCurrentUserId(){
    return window.localStorage.getItem('user_id');
  }

  getCurrentRole(){
    return window.localStorage.getItem('role');
  }


  getRoleAdmin(){
    return 1; // Admin
  }
  getRoleAgentOwner(){
    return 2; //lenovo marketing agent
  }
  getRoleAgenClient(){
    return 3; //iberis agent
  }

  getLenovoAgent(){
    return 4; //lenovo agent
  }

  getRoleCustomer(){
    return 5; //customer
  }


  setUserDetails(userdata){
    window.localStorage.setItem('userLogined','1');
    window.localStorage.setItem('user_id',userdata.user_id);
    window.localStorage.setItem('username',userdata.username);
    window.localStorage.setItem('fullname',userdata.firstname+' '+userdata.lastname);
    window.localStorage.setItem('role',userdata.role);
    window.localStorage.setItem('profile_image',userdata.profile_image);
    window.localStorage.setItem('userDetail',JSON.stringify(userdata));
  }

  getUserDetails(){
   let data = {
      user_id : window.localStorage.getItem('user_id'),
      username: window.localStorage.getItem('username'),
      fullname: window.localStorage.getItem('fullname'),
      role    : window.localStorage.getItem('role'),
      profile_image : window.localStorage.getItem('profile_image')
    }
    return data;
  }

  getUserDetail(param){
    var userDetail = JSON.parse(window.localStorage.getItem('userDetail'));
    return userDetail[param];
  }

  //getTicketServieTypes start
  getTicketServieTypes(obj): Promise<any> {
    if(this.ticketServiceTypes && this.ticketServiceTypesRefresh == 0){
      return Promise.resolve(this.ticketServiceTypes);
    }
    
    return new Promise(resolve => {
      var data = JSON.stringify({type:'SER_TYP'});
      this.http.post(this.getApiUrl()+'get_config_data', data).map(res => res.json()).subscribe(res => {
        this.ticketServiceTypesRefresh = 1;
        if(res.code == 1){
          this.ticketServiceTypes = {code:res.code, results:res.results, custom:JSON.parse(res.custom)};
        }
        else{
          this.ticketServiceTypes = {code:res.code};
        }
        return resolve(this.ticketServiceTypes);
      }, error => {
        this.ticketServiceTypes = {code:0};
        return resolve(this.ticketServiceTypes);
      });
    });
  }
  //getTicketServieTypes end

  //get mytickets start
  callMyTickets(obj): Promise<any> {
    if(this.myTickets && this.myTicketsRefresh == 0){
      return Promise.resolve(this.myTickets);
    }
    
    return new Promise(resolve => {
      var data = JSON.stringify({status:1, discover_status:null});
      this.http.post(this.getApiUrl()+'get_mytickets', data).map(res => res.json()).subscribe(res => {
        this.myTicketsRefresh = 1;
        if(res.code == 1){
          this.myTickets = {code:res.code, results:res.results, custom:JSON.parse(res.custom)};
        }
        else{
          this.myTickets = {code:res.code};
        }
        return resolve(this.myTickets);
      }, error => {
        this.myTickets = {code:0};
        return resolve(this.myTickets);
      });
    });
  }
  //get mytickets end  

  //get ticketInfoBasedTinyUrl start
  callTicketInfoBasedTinyUrl(obj): Promise<any> {
    if(this.ticketInfoBasedTinyUrl && this.ticketInfoBasedTinyUrlRefresh == 0){
      return Promise.resolve(this.ticketInfoBasedTinyUrl);
    }
    
    return new Promise(resolve => {
      var data = JSON.stringify(obj);
      this.http.post(this.getApiUrl()+'get_tinyurl_ticket', data).map(res => res.json()).subscribe(res => {
        this.ticketInfoBasedTinyUrlRefresh = 1;
        if(res.code == 1){
          this.ticketInfoBasedTinyUrl = {code:res.code, results:res.results, custom:JSON.parse(res.custom)};
        }
        else if(res.code == 3){
          this.ticketInfoBasedTinyUrl = {code:res.code, email:res.results.email };
        }
        else{
          this.ticketInfoBasedTinyUrl = {code:res.code};
        }
        return resolve(this.ticketInfoBasedTinyUrl);
      }, error => {
        this.ticketInfoBasedTinyUrl = {code:0};
        return resolve(this.ticketInfoBasedTinyUrl);
      });
    });
  }
  //get ticketInfoBasedTinyUrl end

  //Get api results start
  callApi(obj): Promise<any> {
    if(obj.refresh){
      this.results[obj.method+'-api'] = true;
    }
    else{
      if(this.results[obj.method] && this.results[obj.method+'-api'] == false){
        return Promise.resolve(this.results[obj.method]);
      }
      
      return new Promise(resolve => {
        var data = JSON.stringify(obj);
        this.http.post(this.getApiUrl()+obj.method, data).map(res => res.json()).subscribe(res => {
          this.results[obj.method+'-api'] = false;
          if(res.code == 1){
            this.results[obj.method] = {code:res.code, results:res.results, custom:JSON.parse(res.custom)};
          }
          else{
            this.results[obj.method] = {code:res.code};
          }
          return resolve(this.results[obj.method]);
        }, error => {
          this.results[obj.method] = {code:0};
          return resolve(this.results[obj.method]);
        });
      });
    }
  }
  //Get api results end
  

  //update social discovery start
  updateSocialDiscovery(obj): Promise<any> {    
    return new Promise(resolve => {
      var data = JSON.stringify(obj);
      this.http.post(this.getApiUrl()+'update_social_discovery', data).map(res => res.json()).subscribe(res => {
        if(res.code == 1){
          return resolve({code:res.code, results:res.results});
        }
      }, error => {
        let res;
        return resolve(res['code']= false);
      });
    });
  }
  //update social discovery end 

  decodeBase64(value){
    return window.atob(value); 
  }
  
  callNotificationChecking(obj): Promise<any> {
    let output:any = [];
    return new Promise(resolve => {
      let data = JSON.stringify({
        type:this.getUserDetail('role'),
        user_id: this.getCurrentUserId(),
      });
      this.http.post(this.getApiUrl()+'get_ticket_notify', data).map(res => res.json()).subscribe(res => {
        if(res.results.total_count > 0){
          output = {
            code:1,
            total_count:res.results.total_count,
            notify_count:res.results.notify_count,
            cutomer_notify_count:res.results.cutomer_notify_count,
            notify_title:res.results.notify_title,
            cutomer_notify_title:res.results.cutomer_notify_title,
            message:res.results.message
          };
        }
        else{
          output = {code:2};
        }
        return resolve(output);
      }, error => {
        output = {code:0};
        return resolve(output);
      });
    });
  }

  callNotificationClosed(){
    let jsondata = JSON.stringify({
      type:this.getUserDetail('role'),
      user_id: this.getCurrentUserId(),
    });
    this.http.post(this.getApiUrl()+'create_ticket_notify',jsondata).map(res => res.json()).subscribe(res => {
    }, 
    error => {
    });    
  }

  setTicketDettails(item){
    window.localStorage.setItem('ticket_id',item.ticket_id);
    window.localStorage.setItem('client_ticket_id',item.client_ticket_id);
  }

}
