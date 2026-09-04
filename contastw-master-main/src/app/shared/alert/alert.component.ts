import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-alert',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.css'
})
export class AlertComponent {

  @Input() showAlert: boolean = false;
  @Input() title: string = '';
  @Input() message: string = '';
  @Input() alertType: 'success' | 'error' = 'success';

  @Output() close = new EventEmitter<void>();

  closeAlert() {
    this.showAlert = false;
    this.close.emit();
  }

}
