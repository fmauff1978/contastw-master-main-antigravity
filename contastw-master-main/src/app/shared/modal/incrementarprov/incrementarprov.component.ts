import {
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
  SimpleChanges,
} from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  Timestamp,
  addDoc,
  doc,
  increment,
  updateDoc,
  setDoc,
} from 'firebase/firestore';
import { FirestoreService } from '../../../services/firestore.service';
import { TimestampService } from '../../../services/timestamp.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-incrementarprov',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './incrementarprov.component.html',
  styleUrl: './incrementarprov.component.css',
})
export class IncrementarprovComponent {
  fs = inject(FirestoreService);
  ts = inject(TimestampService);
  router = inject(Router);
  ultmes: any;
  ultcod: number;

  constructor() {
    this.iniciarmeuForm();
  }

  @Input() showModal4: boolean = false;
  @Input() item: any; // Item a ser editado

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  editedItem: any;
  meuForm: any;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['item'] && this.item) {
      this.editedItem = { ...this.item }; // Cria uma cópia para edição

      console.log(this.editedItem);
    }
  }

  closeModal() {
    this.showModal4 = false;
    this.close.emit();
  }

  async saveChanges() {
    this.save.emit(this.editedItem);
    console.log(this.editedItem);
    let id = this.editedItem.id;

    console.log(this.meuForm.value);

    let mes = this.ts.converterDataForm(this.meuForm.value.mes);

    let historico = this.meuForm.value.descricao;

    let valor = this.meuForm.value.saldo;

    const inc = {
      criado_em: Timestamp.now(),
      data: mes,
      historico: historico,
      valor: valor,
    };

    await this.incrementar(id, valor, inc);
    await this.save.emit(inc);
    //  this.pegarUltSdoPrevi();

    this.closeModal();
  }

  iniciarmeuForm() {
    this.meuForm = new FormGroup({
      mes: new FormControl('', Validators.required),
      descricao: new FormControl('', Validators.required),
      saldo: new FormControl('', Validators.required),
    });
  }

  ResetForm() {
    this.meuForm.reset();
    console.log('formulario resetado');
  }

  // async gravarIncremento(prov, id ,valor) {
  //   const colProvisoesRef = collection(this.fs.db, 'provisoes');

  //    const dadosNovoDocumento = { sublctos: prov, referenteAoPrincipalId: id }; // Adicionando referência
  // addDoc(colProvisoesRef, dadosNovoDocumento).then((docRef) => {
  //   console.log('Log de incremento (sublctos) criado com o ID:', docRef.id, 'referente a provisão:', id);
  // });

  //  await this.incrementar(id, valor)

  // }

  navigateToComponent() {
    this.router.navigate(['/prov']);
  }

  async incrementar(id, valor, inc) {
    const docRef = doc(this.fs.db, 'provisoes', id);
    const sublctosRef = collection(docRef, 'sublctos');
    // const updateData = {};

    await addDoc(sublctosRef, { [`${Date.now()}`]: inc });

    await updateDoc(docRef, { saldo: increment(valor) });
    await updateDoc(docRef, { atualizacao: Timestamp.now() });

    //updateData[`${Date.now()}`] = inc; // Adiciona o campo sublctos ao objeto de atualização
    // await updateDoc(docRef, { sublctos: inc  });

    //await updateDoc(doc(this.fs.db, "provisoes", id), updateData);

    // Adiciona um timestamp para registrar quando os dados foram atualizados

    // try {
    //   await updateDoc(docRef, updateData);

    // } catch (error) {
    //   console.error('Erro ao atualizar o documento:', error);
    //   throw new Error('Erro ao atualizar o documento');
    // }
  }
}
