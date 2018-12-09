import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketApproveComponent } from './ticket-approve.component';

describe('TicketApproveComponent', () => {
  let component: TicketApproveComponent;
  let fixture: ComponentFixture<TicketApproveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TicketApproveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TicketApproveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
