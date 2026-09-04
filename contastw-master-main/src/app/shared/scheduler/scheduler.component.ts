import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';


@Component({
  selector: 'app-scheduler',
  imports: [CommonModule],
  templateUrl: './scheduler.component.html',
  styleUrl: './scheduler.component.css',
})
export class SchedulerComponent {
  hoje = new Date();

  dia = this.hoje.getDay();

  constructor() {}

  inicio() {}
}
