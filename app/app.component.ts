import { Component } from '@angular/core';
import { Router } from '@angular/router';
import{ConfigService} from './config.service'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';
  logged:any;
  constructor(
    private router: Router,
    public config:ConfigService
  ){

    //router.events.subscribe((url:any) => console.log(url));
    let pathname = window.location.pathname;  // array of states
    var res = pathname.split("/");
    let path = res[1];
    // console.log('bbbbbbbbbbbbbbbb')
    // if(res[1] != 'support'){
    //   console.log('qqqqqqqqqqqqqqqqqqqqqqqqq')
      if(window.localStorage.getItem('userLogined') == '1'){
        let role = Number(window.localStorage.getItem('role'));
        if(role == this.config.getRoleAdmin()){
          this.router.navigateByUrl('/users');
        }
        else if(role == this.config.getRoleAgentOwner()){
          this.router.navigateByUrl('/mytickets');
        }
        else if(role == this.config.getLenovoAgent()){
          this.router.navigateByUrl('/login');
        }
        else{
          this.router.navigateByUrl('/dashboard');
        }
      }
      else{
        let fullpath = window.location.href;
        let support = fullpath.split("/");
        if((support.indexOf("customer") > -1)){
          this.router.navigateByUrl('/customer/'+support[5]);
        }
        else{
          this.router.navigateByUrl('/login');    
        }
      }
   // }
  }
}
