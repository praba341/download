import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'app-customer-request',
  templateUrl: './customer-request.component.html',
  styleUrls: ['./customer-request.component.css']
})


export class CustomerRequestComponent implements OnInit {
  formData:any = [];
  errorMessage:string = '<div class="alert alert-info">Please wait validating..</div>';
  ticketAllowToPost: boolean = false;
  ticketResults:any = [];
  showContent:boolean;
  defaultMsg:string = 'Thank you for getting in touch! We have received your message and would like to thank you for writing to us.We will write an email back, at the email address you provided ';
  responseMsg:string;
  email:string;
  location:string;
  

  constructor() { 
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
  }

}
