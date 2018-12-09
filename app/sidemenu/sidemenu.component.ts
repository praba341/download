import { Component, OnInit } from '@angular/core';
import { DialogService } from "ng2-bootstrap-modal";

import { ConfigService } from '../config.service';
import { SocialDiscoveryComponent } from '../social-discovery/social-discovery.component';
import { TicketsNewComponent } from '../tickets-new/tickets-new.component';
import { SupportComponent } from '../support/support.component';
import { Router } from '@angular/router';
import { window } from 'rxjs/operators/window';

@Component({
  selector: 'sidemenu',
  templateUrl: './sidemenu.component.html',
  styleUrls: ['./sidemenu.component.css']
})
export class SidemenuComponent implements OnInit {

  admin:boolean=false;
  marketAgent:boolean=false;
  iberisAgent:boolean=false;
  constructor(
    private config:ConfigService,
    private dialogService:DialogService,
    private router: Router
  ) { 
  
  }

  ngOnInit() {
      let currentRole =Number(this.config.getCurrentRole()) ;
      if(currentRole == this.config.getRoleAdmin()){
        this.admin = true;
      }
      else if(currentRole == this.config.getRoleAgentOwner()){
        this.marketAgent = true;
      }
      else if(currentRole == this.config.getRoleAgenClient()){
        this.iberisAgent = true;
      }
  }
 
  logout(){
    localStorage.clear();
    this.router.navigateByUrl('/')
  }

}
