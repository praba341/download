import { Component, OnInit } from '@angular/core';
import { DialogComponent, DialogService } from "ng2-bootstrap-modal";
import { ConfigService } from '../../config.service';
import { Http } from '@angular/http';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
export interface ConfirmModel{}

@Component({
  selector: 'app-knowledg-base-add',
  templateUrl: './knowledg-base-add.component.html',
  styleUrls: ['./knowledg-base-add.component.css']
})
export class KnowledgBaseAddComponent extends DialogComponent<ConfirmModel, boolean> implements ConfirmModel {
  customToast:boolean = false;
  customToastMsg:string = '';
  resMessage:String ='';
  formData = {
    'kb_name':'',
    'kb_link':'',
    'kb_keywords':'',
    'kb_keywords_arr':[],
    'user_id':this.config.getCurrentUserId()
  }
  constructor(dialogService: DialogService,
    private spinnerService: Ng4LoadingSpinnerService,
    public config:ConfigService,
    public http:Http) { 
    super(dialogService);
  }

  ngOnInit() {

  }
  valEnter(){
    if(this.formData.kb_keywords){
      this.formData.kb_keywords_arr.push({'val':this.formData.kb_keywords});
    }
   
    this.formData.kb_keywords='';
  }


  saveLink(){
    if(this.formData.kb_name == undefined || this.formData.kb_name == ''){
      this.customPresentToast('Please enter knowledge base name', 1000);
      return false;
    }
    else if(this.formData.kb_link == undefined || this.formData.kb_link == ''){
      this.customPresentToast('Please enter link', 1000);
      return false;
    }
    else if(this.formData.kb_keywords_arr.length == 0){
      this.customPresentToast('Please enter kewords', 1000);
      return false;
    }
    
    this.spinnerService.show();
    let jsondata = JSON.stringify({data:this.formData});
      this.http.post(this.config.getApiUrl()+'create_kb_link',jsondata).map(res => res.json()).subscribe(res => {
        this.spinnerService.hide();
        if(res.code == 1){
          this.resMessage = '<div class="alert alert-info">Link created successfully!!</div>';
          this.config.callApi({refresh:true, method:'get_knowledge_base'});
        }
        else{
          this.resMessage = '<div class="alert alert-warning">Link created failed. Please try again!!</div>';
        }
      }, 
      error => {
        this.resMessage = '<div class="alert alert-warning">Link created failed. Please try again!!</div>';
        this.spinnerService.hide();
      });
    
  }

  customPresentToast(text, duration) {
    this.customToast = true;
    this.customToastMsg = text;
    setTimeout(() => {
      this.customToast = false;
    }, duration);
  }
  

}
