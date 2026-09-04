
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, SimpleChanges, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, FormControl, Validators

 } from '@angular/forms';
import { PreviComponent } from '../../../pages/previ/previ.component';
import { doc, Timestamp, updateDoc } from 'firebase/firestore';
import { FirestoreService } from '../../../services/firestore.service';
import { Previ2Component } from '../../../pages/previ2/previ2.component';
import { AumService } from '../../../services/aum.service';
import { LoadingService } from '../../../services/loading.service';

@Component({
  selector: 'app-modal-previ',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './modal-previ.component.html',
  styleUrls: ['./modal-previ.component.css']
})
export class ModalPreviComponent implements OnInit{

  ultmes: any
  editedItem: any;
 meuForm: any;

  constructor( private fs: FirestoreService, private as: AumService, 
    private ls: LoadingService
  ) {




  }

   @Input() showModal: boolean = false;
    @Input() item: any; // Item a ser editado
   // @Input() ultmes: any
    @Output() close = new EventEmitter<void>();
    @Output() save = new EventEmitter<any>();




    ngOnChanges(changes: SimpleChanges): void {
      if (changes['item'] && this.item) {
        this.editedItem = { ...this.item }; // Cria uma cópia para edição

        console.log(this.editedItem)
      }
    }

    ngOnInit(): void {

          this.iniciarmeuForm()
  }


    closeModal() {
      this.showModal = false;
      this.close.emit();
    }

   async saveChanges() {

    // mostrar spinner assim que o usuário acionar Salvar
    this.save.emit(this.editedItem);
    console.log(this.editedItem);

    const id = this.editedItem.id;
    const rendimento = this.editedItem.rendimento;
    const cont = this.editedItem.contribuicao;
    const sdoinic = this.editedItem.saldo_inicial;
    const rent = rendimento / sdoinic;
    const sdofim = sdoinic + cont + rendimento;
    console.log(rendimento, cont, rent);

    const docRef = doc(this.fs.db, 'previ', id);

    try {
      // exibimos o overlay de loading antes das operações assíncronas
      this.ls.show('Atualizando AUM...');

      await updateDoc(docRef, {
        contribuicao: cont,
        rendimento: rendimento,
        rentabilidade: rent,
        saldo_final: sdofim,
        atualizado_em: Timestamp.now(),
      });

      // atualiza AUM agregado (operação longa)
      await this.as.atualizarBDAUMAgregado();

    } catch (err) {
      console.error('Erro ao salvar previ:', err);
      // aqui poderíamos emitir um evento de erro ou mostrar mensagem ao usuário
    } finally {
      // garante que o spinner seja escondido mesmo em erro
      this.ls.hide();
      this.closeModal();
    }


    }

      iniciarmeuForm() {
                      this.meuForm = new FormGroup({
                        contribuicao: new FormControl('', Validators.required),
                              rendimento: new FormControl('', Validators.required),


                      });
                    }

}
