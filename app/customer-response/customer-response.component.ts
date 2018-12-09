import { Component, OnInit, ElementRef, Input } from '@angular/core';

import { ConfigService } from '../config.service';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { window } from 'rxjs/operators/window';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';


@Component({
  selector: 'customer-response',
  templateUrl: './customer-response.component.html',
  styleUrls: ['./customer-response.component.css']
})
export class CustomerResponseComponent implements OnInit {

  formData:any = [];
  errorMessage:string = '<div class="alert alert-info">Please wait validating..</div>';
  ticketAllowToPost: boolean = false;
  ticketResults:any = [];
  showContent:boolean;
  defaultMsg:string = 'Thank you for getting in touch! We have received your message and would like to thank you for writing to us.We will write an email back, at the email address you provided ';
  responseMsg:string;
  email:string;
  location:string;
  
  constructor(
    private config:ConfigService,
    private http:Http,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private spinnerService: Ng4LoadingSpinnerService,
    private el: ElementRef
  ) { 
    this.ticketResults = {
      customer_name: '',
      complaint_url: ''
    };

    this.formData = {
      ticket_id:'',
      first_name: '',
      last_name: '',
      phone: '',
      email: '',
      category_name: '',
      product_name: '',
      attachements: null,
      message:''
    };
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe((params: Params) => {
      this.formData.ticket_id = params.ticket_id;
      if(this.formData.ticket_id != ''){
        this.getCustomerLocation();
        this.getTicketInfo({ticket_id:this.formData.ticket_id});
      }
    });   

    

    // if(navigator.geolocation){
    //     navigator.geolocation.getCurrentPosition(this.setPosition.bind(this));
    //   }

      //var x = document.getElementById("demo");
      // function getLocation() {
      //   console.log('po',navigator.geolocation) 
      //         if (navigator.geolocation) {
      //             navigator.geolocation.getCurrentPosition(showPosition);
      //         } else {
      //             x.innerHTML = "Geolocation is not supported by this browser.";
      //         }
      //     }
          // function showPosition(position) {
          //     // x.innerHTML = "Latitude: " + position.coords.latitude + 
          //     // "<br>Longitude: " n position.coords.longitude;
          //     console.log('nnnnnnnn',position.coords)
          // }

    // console.log(navigator.geolocation.getCurrentPosition())

  }

  getCustomerLocation(){
    //For get browser information
    this.http.get("https://freegeoip.net/json/").map(res => res.json()).subscribe(res => {
        this.location =  res.country_name;
      }, 
      error => {
        return null;
      });


    // let timestamp;
    // let latitude;
    // let longitude;
    // navigator.geolocation.getCurrentPosition(position => {
    //       console.log('poiiiiiiiii',position)
    //       timestamp  = position.timestamp;
    //       latitude = position.coords.latitude;
    //       longitude = position.coords.longitude;

    //       console.log( 'bbbbbbbb ',timestamp,' vvvvv ' ,latitude,' longitude ',longitude) 

    //       this.http.get("https://maps.googleapis.com/maps/api/timezone/json?location="+latitude+","+longitude+"&timestamp="+timestamp+"&key=AIzaSyDP-qeNfcFtExgrTz9MTUkWOSMjWc3pT4E").map(res => res.json()).subscribe(res => {

    //       console.log('urlllll',"https://maps.googleapis.com/maps/api/timezone/json?location="+latitude+","+longitude+"&timestamp="+timestamp+"&key=AIzaSyDP-qeNfcFtExgrTz9MTUkWOSMjWc3pT4E")
    //           console.log('vvvvvssssssss',res)
    //         }, 
    //         error => {
    //           console.log('errrrrrr',error)
    //         });
    // })
  }

  getTicketInfo(obj) {
    this.config.callTicketInfoBasedTinyUrl({ticket_id:obj.ticket_id}).then(res => {
      if(res.code == 1){
        this.showContent = true;
        this.ticketResults = res.results;
        this.ticketAllowToPost = true;
        this.errorMessage = '';
        this.updateCustomerView(this.formData.ticket_id);
      }
      else if(res.code == 3){
        this.showContent = false;
        this.responseMsg = this.defaultMsg+ res.email +' Talk to you soon, Voice of Customer.'; 
      }
      else{
        this.showContent = false;
        this.responseMsg = 'Sorry!! Something went wrong. Please try again.';
      }
    });
  } 

  submitTicket(submitType){
    this.errorMessage = '';
    if(this.formData.last_name == undefined || this.formData.last_name == ''){
      this.errorMessage = '<div class="alert alert-info">Sorry!! Name field required.</div>';
      return false;
    }
    else if(this.formData.ticket_id == '' || this.formData.ticket_id == undefined || this.formData.ticket_id == null){
      this.responseMsg = this.defaultMsg+this.formData.email+' Talk to you soon, Voice of Customer.';
      this.showContent = false;
      return false;
    }
    else if(this.formData.email == undefined || this.formData.email == ''){
      this.errorMessage = '<div class="alert alert-info">Sorry!! E-mail field required.</div>';
      return false;
    }
    else if(this.formData.category_name == undefined || this.formData.category_name == ''){
      this.errorMessage = '<div class="alert alert-info">Sorry!! Product Category field required.</div>';
      return false;
    }
    else if(this.formData.product_name == undefined || this.formData.product_name == ''){
      this.errorMessage = '<div class="alert alert-info">Sorry!!  Product Model field required.</div>';
      return false;
    }
    else{
      this.spinnerService.show();
      let jsondata = {
        user_id: this.config.getCurrentUserId(),
        ticket_id: this.formData.ticket_id,
        first_name: this.formData.first_name,
        last_name: this.formData.last_name,
        phone: this.formData.phone,
        email: this.formData.email,
        category_name: this.formData.category_name,
        product_name: this.formData.product_name,
        attachements: this.formData.attachements,
        message: this.formData.message 
      };
      this.email = this.formData.email;// For sucess msg
      let body = JSON.stringify(jsondata);
      this.http.post(this.config.getApiUrl()+'create_ticket_complaints',jsondata).map(res => res.json()).subscribe(res => {
        setTimeout(() => {
          this.formData = [];
          this.spinnerService.hide();
          if(res.code == 1){
            this.updateTicketToFreshDesk(jsondata);
            this.showContent = false;
            this.responseMsg = 'Thank you!! Complaint created successfully. We will write an email back, at the email address you provided ' + this.email+ ' Talk to you soon, Voice of Customer.';
          }
          else if(res.code == 2){
            this.errorMessage = '<div class="alert alert-warning">Complaint create failed. Please try again!!</div>';
          }
          else if(res.code == 3){
            this.errorMessage = '<div class="alert alert-warning">Complaint create failed. Your access temporary disabled!!</div>';
          }
          else{
            this.errorMessage = '<div class="alert alert-warning">Webservice Error. Please try again!!</div>';
          }
        }, 500);
      }, 
      error => {
        this.spinnerService.hide();
        this.errorMessage = '<div class="alert alert-warning">Something went wrong. Please try again!!</div>';
      });
    }
  }

  updateTicketToFreshDesk(obj){
    let freshDeskApi = 'ANINcPL6R7sLzoXisvnW';
    let freshDeskPassword = '12345678';
    let freshDeskDomain = 'voiceofcustomer';
    let url = 'https://'+freshDeskDomain+'.freshdesk.com/api/v2/tickets/'+this.ticketResults.client_ticket_id;
    let jsondata = JSON.stringify({
      name: obj.first_name+' '+obj.last_name,
      description: obj.message,
      email: obj.email,
      subject: obj.first_name+' '+obj.last_name,
      priority: 2, //medium
      status: 3,
      phone: obj.phone,
      custom_fields : { cf_product: obj.product_name, cf_category: obj.category_name}
    });
    let headers = new Headers({ 'Content-Type': 'application/json', "Authorization": "Basic " + btoa(freshDeskApi + ":" + freshDeskPassword) });
    let options = new RequestOptions({ headers: headers });
    this.http.put(url, jsondata, options).map(res => res.json()).subscribe(res => {
    }, 
    error => {
    });
  }

  updateCustomerView(ticketID){
    this.spinnerService.show();
    //let location =  this.getCustomerLocation();
    let jsondata = {
      user_id: this.config.getCurrentUserId(),
      ticket_id: ticketID,
      location : this.location
    };
    let body = JSON.stringify(jsondata);
    this.http.post(this.config.getApiUrl()+'update_customer_view',jsondata).map(res => res.json()).subscribe(res => {
      setTimeout(() => {
        this.spinnerService.hide();
        if(res.code == 1){
        }
      }, 500);
    }, 
    error => {
      this.spinnerService.hide();
    });
  }

  closeMessage(){
    this.errorMessage = '';
  }

/* File Upload*/
handleFileSelect(evt){
  var files = evt.target.files;
  var file = files[0];

  if (files && file) {
      var reader = new FileReader();
      reader.onload =this._handleReaderLoaded.bind(this);
      reader.readAsBinaryString(file);
  }
}

_handleReaderLoaded(readerEvt) {
 var binaryString = readerEvt.target.result;
 this.formData.attachements= btoa(binaryString);
}
/* File Upload*/




}
