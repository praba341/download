import { Component, OnInit } from '@angular/core';
import { ConfigService } from '../../config.service';
import { DialogService } from 'ng2-bootstrap-modal';
import { KnowledgBaseViewComponent } from '../knowledg-base-view/knowledg-base-view.component'
import { KnowledgBaseAddComponent } from '../knowledg-base-add/knowledg-base-add.component'
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';

@Component({
  selector: 'app-knowledge-base',
  templateUrl: './knowledge-base.component.html',
  styleUrls: ['./knowledge-base.component.css']
})
export class KnowledgeBaseComponent implements OnInit {
  repots:any = [];
  responseMessage:string = 'Loding...';
  reportEmail:any=[];
  constructor(
    public config:ConfigService,
    public dialogService:DialogService,
    private spinnerService: Ng4LoadingSpinnerService) { 
    this.getKB();
  }

  ngOnInit() {
  }

  getKB() {
    this.spinnerService.show();
    this.config.callApi({status:1,  method:'get_knowledge_base'}).then(res => {
      this.spinnerService.hide();
      if(res.code == 1){
        this.repots = res.results;
      }
      else if(res.code == 2){
        this.responseMessage = 'No Data';
      }
      else{
        this.responseMessage = 'Sorry!! Something went wrong.';
      }
    },error=>{
      this.responseMessage = 'Sorry!! Something went wrong.';
      this.spinnerService.hide();
    });
  }

  viewKeywords(item){
    this.spinnerService.show();
    this.config.callApi({status:1,  method:'get_keywords', refresh:true});
    this.config.callApi({status:1, kb_solution_id:item.kb_solution_id,  method:'get_keywords'}).then(res => {
      this.spinnerService.hide();
      let disposable = this.dialogService.addDialog(KnowledgBaseViewComponent, {
        title:'Confirm title', 
        message:'Confirm message',
        kewords:res.results
      },{ backdropColor: 'rgba(0, 0, 0, 0.5)' })
        .subscribe((isConfirmed)=>{
          // if(isConfirmed) {
          //   console.log('isConfirmed');
          // }
          // else {
          //   this.getKB();
          // }
         
      });

    },
    error=>{
      this.spinnerService.show();
    });
  }

  createNewLink(){
    let disposable = this.dialogService.addDialog(KnowledgBaseAddComponent, {
      title:'Confirm title', 
      message:'Confirm message'},{ backdropColor: 'rgba(0, 0, 0, 0.5)' })
      .subscribe((isConfirmed)=>{
        if(isConfirmed) {
          console.log('isConfirmed');
        }
        else {
          this.getKB();
        }
    });
  }

  deleteKB(obj){
   
    this.spinnerService.show();
    this.config.callApi({status:1,  method:'update_kb_solution_status', refresh:true});
    this.config.callApi({status:0, kb_solution_id:obj.kb_solution_id,user_id:this.config.getCurrentUserId(),  method:'update_kb_solution_status'}).then(res => {
      this.config.callApi({status:1,  method:'get_knowledge_base', refresh:true});
      this.spinnerService.hide();
      this.getKB();
    },
    error=>{
      this.spinnerService.show();
    });
  }

}
