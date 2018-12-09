import { Component, OnInit } from '@angular/core';
import { DialogComponent, DialogService } from "ng2-bootstrap-modal";
import { ConfigService } from '../config.service';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Http, Response } from '@angular/http';
import { window } from 'rxjs/operators/window';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
export interface ConfirmModel {}


@Component({
  selector: 'support',
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.css']
})
export class SupportComponent extends DialogComponent<ConfirmModel, boolean> implements ConfirmModel {

  formData:any = [];
  resMessage:string = '<div class="alert alert-info">Please wait validating..</div>';
  ticketAllowToPost: boolean = false;
  ticketResults:any = [];
  tockenId:any;
  errorMessage:any;

  constructor(
    private config:ConfigService,
    private http:Http,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private spinnerService: Ng4LoadingSpinnerService,
    dialogService: DialogService
  ) { 
    super(dialogService);

    this.ticketResults = {
      customer_name: '',
      complaint_url: '',
      ticket_id    :''
    };

    this.formData = {
      ticket_id:'',
      first_name: '',
      last_name: '',
      phone: '',
      email: '',
      category_name: '',
      product_name: '',
      attachements: '',
      message:'',
      tiny_url:'',
      customer_respond:0
    };
  }

  ngOnInit() {

    this.activatedRoute.params.subscribe((params: Params) => {
      if(params.ticket_id){
        this.getCustomerResponse(params.ticket_id);
      }
      else{
        this.getCustomerResponse(this.tockenId);
      }
    }); 
  }

  getCustomerResponse(ticketID){
      this.spinnerService.show();
      let jsondata = JSON.stringify({ticket_id: ticketID});
      this.http.post(this.config.getApiUrl()+'get_ticket_complaints',jsondata).map(res => res.json()).subscribe(res => {
          this.spinnerService.hide();
          if(res.code == 1){
            this.formData = res.results[0];
            if(res.results[0].attachements != null){
              this.formData.attachements = this.config.getBaseUrl()+'/'+res.results[0].attachements;
            } 
            this.ticketResults = res.results[0];
           // this.formData.tiny_url = this.config.getshortenUrlApi(res.results['tiny_url']);

           //For tiny url start
            this.http.post(this.config.shortenUrlApi,{longUrl:res.results['tiny_url']}).map(res => res.json()).subscribe(res => {
              this.formData.tiny_url = res.id;
            },
            error =>{
              this.formData.tiny_url = res.results['tiny_url'];
            });                         
            //For tiny url end
          }
      }, 
      
      error => {
        this.spinnerService.hide();
      });
  }

  closeMessage(){
    this.resMessage = '';
  }

}
