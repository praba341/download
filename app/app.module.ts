import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import 'rxjs/add/operator/map';
import { from } from 'rxjs/observable/from';
import { RouterModule, Routes } from '@angular/router';
import { Ng4LoadingSpinnerModule } from 'ng4-loading-spinner';
import { BootstrapModalModule } from 'ng2-bootstrap-modal';
import { RatingModule } from "ng2-rating";
import { DataTableModule } from "ng2-data-table";
import { ClipboardModule } from 'ngx-clipboard';
import { CustomFormsModule } from 'ng2-validation'
import { NgDatepickerModule } from 'ng2-datepicker';



import { routes } from './app.routes';
import { AppComponent } from './app.component';
import { ConfigService } from './config.service';
import { LoginComponent } from './login/login.component';
import { AgentDashboardComponent } from './agent-dashboard/agent-dashboard.component';
import { SocialDiscoveryComponent } from './social-discovery/social-discovery.component';
import { ViewticketComponent } from './viewticket/viewticket.component';
import { TicketsComponent } from './tickets/tickets.component';
import { TicketsNewComponent } from './tickets-new/tickets-new.component';
import { TicketsViewComponent } from './tickets-view/tickets-view.component';
import { SupportComponent } from './support/support.component';
import { UsersComponent } from './admin/users/users.component';
import { UsersNewComponent } from './admin/users-new/users-new.component';
import { UsersEditComponent } from './admin/users-edit/users-edit.component';
import { ServiceTypesComponent } from './admin/service-types/service-types.component';
import { ServiceTypesFormComponent } from './admin/service-types-form/service-types-form.component';
import { SidemenuComponent } from './sidemenu/sidemenu.component';
import { TransactionComponent } from './transaction/transaction.component';
import { CustomerResponseComponent } from './customer-response/customer-response.component';
import { ReportComponent } from './admin/report/report.component';
import { ReportViewComponent } from './admin/report-view/report-view.component';
import { ReportAddComponent } from './admin/report-add/report-add.component';
import { CustomerRequestComponent } from './customer-request/customer-request.component';
import { TicketApproveComponent } from './ticket-approve/ticket-approve.component';

import { KnowledgeBaseComponent } from './admin/knowledge-base/knowledge-base.component';
import { KnowledgBaseViewComponent } from './admin/knowledg-base-view/knowledg-base-view.component';
import { KnowledgBaseAddComponent } from './admin/knowledg-base-add/knowledg-base-add.component';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    AgentDashboardComponent,
    SocialDiscoveryComponent,
    ViewticketComponent,
    TicketsComponent,
    TicketsNewComponent,
    TicketsViewComponent,
    SupportComponent,
    UsersComponent,
    UsersNewComponent,
    UsersEditComponent,
    ServiceTypesComponent,
    ServiceTypesFormComponent,
    SidemenuComponent,
    TransactionComponent,
    CustomerResponseComponent,
    ReportComponent,
    ReportViewComponent,
    ReportAddComponent,
    CustomerRequestComponent,
    TicketApproveComponent,
    KnowledgeBaseComponent,
    KnowledgBaseViewComponent,
    KnowledgBaseAddComponent
    ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    RouterModule.forRoot(routes, {useHash:true}),
    Ng4LoadingSpinnerModule,
    BootstrapModalModule.forRoot({container:document.body}),
    RatingModule,
    DataTableModule,
    ClipboardModule,
    CustomFormsModule,
    NgDatepickerModule
  ],
  entryComponents: [
    SocialDiscoveryComponent,
    ViewticketComponent,
    TicketsComponent,
    TicketsNewComponent,
    TicketsViewComponent,
    TicketApproveComponent,
    SupportComponent,
    UsersNewComponent,
    UsersEditComponent,
    ReportViewComponent,
    ReportAddComponent,
    ServiceTypesFormComponent,
    KnowledgBaseViewComponent,
    KnowledgBaseAddComponent,
  ],
  providers: [ConfigService],
  bootstrap: [AppComponent]
})
export class AppModule { }
