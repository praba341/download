import { Component, OnInit } from '@angular/core';
import { ConfigService } from '../../config.service';
import { DialogService } from 'ng2-bootstrap-modal';
import { ReportViewComponent } from '../report-view/report-view.component';
import { ReportAddComponent } from '../report-add/report-add.component';


@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css']
})
export class ReportComponent implements OnInit {

  repots:any = [];
  responseMessage:string = 'Loding...';
  reportEmail:any=[];
  constructor(
    public config:ConfigService,
    public dialogService:DialogService) { 
    this.getReportDetails();
  }

  ngOnInit() {
  }

  getReportDetails() {
    this.config.callApi({status:1,  method:'get_report_details'}).then(res => {
      if(res.code == 1){
        this.repots = res.results;
      }
      else if(res.code == 2){
        this.responseMessage = 'No Data';
      }
      else{
        this.responseMessage = 'Sorry!! Something went wrong.';
      }
    });
  }

  viewReportDetails(reportDetails){
    let disposable = this.dialogService.addDialog(ReportViewComponent, {
      title:'Confirm title', 
      message:'Confirm message',
      reportData:reportDetails
    },{ backdropColor: 'rgba(0, 0, 0, 0.5)' })
      .subscribe((isConfirmed)=>{
        if(isConfirmed) {
          console.log('isConfirmed');
        }
        else {
          this.getReportDetails();
        }
    });
  }

  createNewReport(){
    let disposable = this.dialogService.addDialog(ReportAddComponent, {
      title:'Confirm title', 
      message:'Confirm message'},{ backdropColor: 'rgba(0, 0, 0, 0.5)' })
      .subscribe((isConfirmed)=>{
        //We get dialog result
        this.getReportDetails();
        if(isConfirmed) {
        }
        else {
          //this.getReportDetails();
        }
    });
  }

}
