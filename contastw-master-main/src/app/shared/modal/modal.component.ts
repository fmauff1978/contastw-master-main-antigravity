import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-modal',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  standalone: true,
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css'
})
export class ModalComponent {

  @Input() showModal: boolean = false;
  @Input() item: any; // Item a ser editado
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  editedItem: any;
 

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['item'] && this.item) {
      this.editedItem = { ...this.item }; // Cria uma cópia para edição
    }
  }

  closeModal() {
    this.showModal = false;
    this.close.emit();
  }

  saveChanges() {
    this.save.emit(this.editedItem);
    this.closeModal();
    
  }

}
