import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
} from '@angular/core';
import { ContasService } from '../../services/contas.service';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AlertComponent } from '../../shared/alert/alert.component';

@Component({
  selector: 'app-contas',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, AlertComponent],
  templateUrl: './contas.component.html',
  styleUrl: './contas.component.css',
})
export class ContasComponent {
  selectedItem: any;

  @Input() item: any; // Item a ser editado

  editedItem: any;
  @Input() showModal2: boolean = false;

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  cod0: any;
  meuForm: FormGroup;
  natureza = ['ativo', 'passivo', 'despesa', 'receita', 'resultado'];
  enq = [
    { id: 1, enquadramento: 'circulante' },
    { id: 2, enquadramento: 'realizável' },
    { id: 3, enquadramento: 'investimento' },
    { id: 4, enquadramento: 'patrimônio' },
    { id: 5, enquadramento: 'rotativo' },
    { id: 6, enquadramento: 'cdc' },
     { id: 6.5, enquadramento: 'reneg' },

    { id: 7, enquadramento: 'financiamento' },
    { id: 7.11, enquadramento: 'alimentação fora de casa' },
    { id: 7.12, enquadramento: 'educação' },
    { id: 7.13, enquadramento: 'familiares' },
    { id: 7.14, enquadramento: 'financeiras' },
    { id: 7.15, enquadramento: 'fopag' },
    { id: 7.16, enquadramento: 'imobiliárias' },
    { id: 7.17, enquadramento: 'lazer' },
    { id: 7.18, enquadramento: 'mobilidade' },
    { id: 7.19, enquadramento: 'ordinárias' },
    { id: 7.2, enquadramento: 'streaming' },
    { id: 8, enquadramento: 'receitas' },
    { id: 9, enquadramento: 'resultado' },
  ];

  mod_despesa = ['compromissada', 'gerenciável', 'off', 'nihil'];
   showAlert: boolean = false;
  alertTitle: string = '';
  alertMessage: string = '';
  alertType: 'success' | 'error' = 'success';

  constructor(private cs: ContasService) {
    this.cs.pegarCod2().then((x) => {
      this.cod0 = x;

      console.log(this.cod0);
    });

    this.iniciarmeuForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['item'] && this.item) {
      this.editedItem = { ...this.item }; // Cria uma cópia para edição
    }
  }

  closeModal() {
    this.showModal2 = false;
    this.close.emit();
  }

  closeAlert() {
    this.showAlert = false;
    this.closeModal();
  }

  async saveChanges() {
    //this.save.emit(this.editedItem);
    await console.log(this.meuForm.value);

    let enq0 = this.meuForm.value.enquadramento;
    let x = this.enq.find((y) => y.enquadramento === enq0);
    let id_enq = x.id;
    let natureza = this.meuForm.value.natureza;

    if (natureza === 'despesa' || natureza === 'receita') {
      const contagravar = {
        em_uso: true,
        conta: this.meuForm.value.conta,
        natureza: this.meuForm.value.natureza,
        enquadramento: this.meuForm.value.enquadramento,
        mod_despesa: this.meuForm.value.mod_despesa,
        saldo: 0,
        cod: this.cod0,
        gd2024:0,
        gd2025:0,
        gd2026:0,
        enq: id_enq,
        ano2024: {
          jan: 0,
          fev: 0,
          mar: 0,
          abr: 0,
          mai: 0,
          jun: 0,
          jul: 0,
          ago: 0,
          set: 0,
          out: 0,
          nov: 0,
          dez: 0,
          total: 0,
        },
        ano2025: {
          jan: 0,
          fev: 0,
          mar: 0,
          abr: 0,
          mai: 0,
          jun: 0,
          jul: 0,
          ago: 0,
          set: 0,
          out: 0,
          nov: 0,
          dez: 0,
          total: 0,
        },
        ano2026: {
          jan: 0,
          fev: 0,
          mar: 0,
          abr: 0,
          mai: 0,
          jun: 0,
          jul: 0,
          ago: 0,
          set: 0,
          out: 0,
          nov: 0,
          dez: 0,
          total: 0,
        },
      };

      console.log(contagravar);

      this.cs.gravarConta(contagravar);
      this.ResetForm();

      this.alertTitle = 'Sucesso';
      this.alertMessage = 'Conta gravada!';
      this.alertType = 'success';
      this.showAlert = true;

    } else {
      const contagravar = {
        em_uso: true,
        conta: this.meuForm.value.conta,
        natureza: this.meuForm.value.natureza,
        enquadramento: this.meuForm.value.enquadramento,
        mod_despesa: this.meuForm.value.mod_despesa,
        saldo: 0,
        cod: this.cod0,
        enq: id_enq,
        fechamento2024:0,
        fechamento2025:0,
        fechamento2026:0,
      };

      console.log(contagravar);

      this.cs.gravarConta(contagravar);
      this.ResetForm();

      this.alertTitle = 'Sucesso';
      this.alertMessage = 'Conta gravada!';
      this.alertType = 'success';
      this.showAlert = true;
    }
  }

  

  iniciarmeuForm() {
    this.meuForm = new FormGroup({
      conta: new FormControl('', Validators.required),
      natureza: new FormControl('', Validators.required),
      enquadramento: new FormControl('', Validators.required),
      mod_despesa: new FormControl(''),
    });
  }

  ResetForm() {
    this.meuForm.reset();
    console.log('formulario resetado');
  }

  teste() {
    console.log(this.meuForm.value);
  }
}
