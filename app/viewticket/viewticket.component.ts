import {Component,Input, ViewChild, OnInit} from '@angular/core';
import { DialogComponent, DialogService } from "ng2-bootstrap-modal";
export interface ConfirmModel{
}

@Component({
  selector: 'app-viewticket',
  templateUrl: './viewticket.component.html',
  styleUrls: ['./viewticket.component.css']
})
export class ViewticketComponent  extends DialogComponent<ConfirmModel, boolean> implements ConfirmModel {
  record:any;
  customerName:any;
  message: string;
  agent_type:any;
  constructor(dialogService: DialogService,) {
    super(dialogService); 
   }

  ngOnInit(): void {
    console.log(this.record);
    }

}
