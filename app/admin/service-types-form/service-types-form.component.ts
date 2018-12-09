import { Component, OnInit } from '@angular/core';
import { DialogComponent, DialogService } from "ng2-bootstrap-modal";
import { Http, Response } from '@angular/http';
import{ ConfigService } from '../../config.service'
export interface ConfirmModel{}

@Component({
  selector: 'service-types-form',
  templateUrl: './service-types-form.component.html',
  styleUrls: ['./service-types-form.component.css']
})
export class ServiceTypesFormComponent  extends DialogComponent<ConfirmModel, boolean> implements ConfirmModel {

  isActiveForm:boolean = true;
  formData:any = [];
  formTitle:string = 'Create new';
  errorMessage:string = '';

  loader:boolean = false;
  customToastMsg:string = '';
  customToast:boolean = false;

  constructor(
    dialogService: DialogService,
    private http:Http,
    public config:ConfigService
  ) {
    super(dialogService);
  }

  ngOnInit() {
  }

  customPresentToast(text, duration) {
    this.customToast = true;
    this.customToastMsg = text;
    setTimeout(() => {
      this.customToast = false;
    }, duration);
  }

  createNew(){
    this.errorMessage = '';
    let method;
    if(this.formData.id){
      method = 'update_service_type';

    }
    else{
      method = 'create_service_type';
    }
    if(this.formData.text1 == '' || this.formData.text1 == undefined){
      this.customPresentToast('Please enter Service Type Name', 1000);
      return false;
    }

    let jsondata = JSON.stringify({
      edit_id:this.formData.id,
      text1:this.formData.text1,
      status:this.formData.status,
      user_id: this.config.getCurrentUserId()
    });
    this.http.post(this.config.getApiUrl()+method,jsondata).map(res => res.json()).subscribe(res => {
      if(res.code == 1){
        this.config.callApi({refresh:1, method:'get_config_data'});
        this.errorMessage = '<div class="alert alert-info">'+res.message+'</div>';
        this.isActiveForm = false;
      }
      else if(res.code == 2){
        this.customPresentToast(res.message, 1000);
      }   
      else{
        this.customPresentToast('Something went wrong. Please try again!!', 1000);
      }
    }, 
    error => {
      this.errorMessage = '<div class="alert alert-warning">Something went wrong. Please try again!!</div>';
    });
  }

  closeMessage(){
    this.errorMessage = '';
  }

}
