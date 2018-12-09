import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AgentDashboardComponent } from './agent-dashboard/agent-dashboard.component';
import { ViewticketComponent } from './viewticket/viewticket.component';
import { TicketsComponent } from './tickets/tickets.component';
import { TicketsNewComponent } from './tickets-new/tickets-new.component';
import { SupportComponent } from './support/support.component';
import { UsersComponent } from './admin/users/users.component';
import { ServiceTypesComponent } from './admin/service-types/service-types.component';
import { CustomerResponseComponent } from './customer-response/customer-response.component';
import { ReportComponent } from './admin/report/report.component';
import { CustomerRequestComponent } from './customer-request/customer-request.component';
import { KnowledgeBaseComponent } from './admin/knowledge-base/knowledge-base.component'


export const routes: Routes = [
   { path: '', redirectTo: 'login', pathMatch: 'full' },
   { path: 'login', component: LoginComponent },
   { path: 'dashboard', component: AgentDashboardComponent },
   { path: 'mytickets', component: TicketsComponent },
   { path: 'support/:ticket_id', component: SupportComponent },
   { path: 'users', component: UsersComponent },
   { path: 'servicetypes', component: ServiceTypesComponent },
   { path: 'customer/:ticket_id', component: CustomerResponseComponent },
   { path: 'report', component: ReportComponent },
   { path: 'customer-request', component: CustomerRequestComponent },
   { path: 'kb', component: KnowledgeBaseComponent }
];