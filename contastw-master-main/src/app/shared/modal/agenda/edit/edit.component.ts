import {
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FirestoreService } from '../../../../services/firestore.service';
import { TimestampService } from '../../../../services/timestamp.service';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  addDoc,
  collection,
  doc,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';

@Component({
  selector: 'app-edit',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.css',
})
export class EditComponent {
  meuForm: any;
  origem = ['despesa', 'pmt', 'fatura', 'tarefa', 'outros'];

  recor = ['sem repeticao', 'semanal', 'quinzenal', 'mensal', 'anual'];

  constructor(
    private fs: FirestoreService,
    private ts: TimestampService,
  ) {
    this.iniciarmeuForm();
  }

  @Input() showModal4: boolean = false;
  @Input() item: any; // Item a ser editado
  // @Input() ultmes: any
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  editedItem: any;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['item'] && this.item) {
      this.editedItem = { ...this.item };

      if (this.item.agendado_para) {
        const d = this.item.agendado_para.toDate
          ? this.item.agendado_para.toDate()
          : new Date(this.item.agendado_para);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        this.editedItem.agendado_para = `${yyyy}-${mm}-${dd}`;
      }
      console.log(this.editedItem);
    }
  }

  ngOnInit(): void {}

  closeModal() {
    this.showModal4 = false;
    this.close.emit();
  }

  async saveChanges() {
    this.save.emit(this.editedItem);

    let id = this.editedItem.id;
    //  let agendado_para = this.ts.converterDataForm(this.meuForm.value.agendado_para)
    let agendado_para0 = this.meuForm.value.agendado_para;
    console.log(agendado_para0);
    let agendadopara1 = this.ts.converterDataForm(agendado_para0);
    console.log(agendadopara1);
    let agendado_para = agendadopara1.toDate();

    let descricao = this.meuForm.value.descricao;
    let origem = this.meuForm.value.origem;
    let valor = this.meuForm.value.valor;
    let recor = this.meuForm.value.recor;

    console.log(id, descricao, agendado_para, origem, valor, recor);

    const docRef = doc(this.fs.db, 'agenda', id);
    await updateDoc(docRef, {
      agendado_para: agendado_para,
      descricao: descricao,
      origem: origem,
      valor: valor,
      recor: recor,
      ativa: true,
      atualizado_em: Timestamp.now(),
    });

    this.save.emit(this.editedItem);

    this.closeModal();
  }

  iniciarmeuForm() {
    this.meuForm = new FormGroup({
      agendado_para: new FormControl('', Validators.required),
      descricao: new FormControl('', Validators.required),
      origem: new FormControl('', Validators.required),
      valor: new FormControl('', Validators.required),
      recor: new FormControl('', Validators.required),
    });
  }

  ResetForm() {
    this.meuForm.reset();
    console.log('formulario resetado');
  }

  gravarCompromisso(compromissogravar) {
    const coll = collection(this.fs.db, 'agenda');
    addDoc(coll, compromissogravar);
  }
}
