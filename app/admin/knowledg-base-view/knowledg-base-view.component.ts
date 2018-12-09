import { Component, OnInit } from '@angular/core';
import { DialogComponent, DialogService } from "ng2-bootstrap-modal";
export interface ConfirmModel{}

@Component({
  selector: 'app-knowledg-base-view',
  templateUrl: './knowledg-base-view.component.html',
  styleUrls: ['./knowledg-base-view.component.css']
})
export class KnowledgBaseViewComponent extends DialogComponent<ConfirmModel, boolean> implements ConfirmModel {
  kewords:any;
  resMessage:String;
  constructor(dialogService: DialogService) {
    super(dialogService);
    
   }

  ngOnInit() {
    if(!this.kewords){
        this.resMessage = '<div class="alert alert-warning">No kewords found...!!</div>';
    }
    console.log('kewordskewords',this.kewords)
  }


}
