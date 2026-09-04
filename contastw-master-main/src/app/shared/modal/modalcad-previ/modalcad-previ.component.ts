import {
  Component,
  EventEmitter,
  Input,
  NgModule,
  Output,
  signal,
  SimpleChanges,
} from '@angular/core';

import { FirestoreService } from '../../../services/firestore.service';
import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TimestampService } from '../../../services/timestamp.service';
import { Router } from '@angular/router';
import { Previ2Component } from '../../../pages/previ2/previ2.component';
import { AumService } from '../../../services/aum.service';
import { LoadingService } from '../../../services/loading.service';

@Component({
  selector: 'app-modalcad-previ',
  templateUrl: './modalcad-previ.component.html',
  styleUrls: ['./modalcad-previ.component.css'],
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
})
export class ModalcadPreviComponent {
  ultmes: any;
  meuForm: FormGroup;
  ultsdo: any;
  resgate = signal<number | null>(null);
  reg: number;

  constructor(
    private fs: FirestoreService,
    private ts: TimestampService,
    private as: AumService,
    private ls: LoadingService,
    private router: Router,
  ) {
    this.iniciarmeuForm();
    this.pegarUltSdoPrevi();
    console.log('carregando modal');
  }

  @Input() showModal3: boolean = false;
  @Input() item: any; // Item a ser editado

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  editedItem: any;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['item'] && this.item) {
      this.editedItem = { ...this.item }; // Cria uma cópia para edição

      console.log(this.editedItem);
    }
  }

  async ngOnInit(): Promise<void> {}

  async pegarUltSdoPrevi() {
    const colRef = collection(this.fs.db, 'previ');
    const q = query(colRef, orderBy('mes', 'desc'), limit(1));

    const qs = await getDocs(q);
    const items: any[] = [];
    qs.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() });
    });

    this.ultsdo = items[0].saldo_final;
    console.log(this.ultsdo);
    this.reg = items[0].reg;
    console.log(this.reg);

    // return this.resgate()
  }

  closeModal() {
    this.showModal3 = false;
    this.close.emit();
  }

  async saveChanges() {
    this.save.emit(this.editedItem);

    console.log(this.meuForm.value);

    let mes0 = this.meuForm.value.mes;
    let mes1 = mes0.split('-');
    let ano = mes1[0];
    let mesX = mes1[1];
    let mesY = new Date(ano, mesX - 1, 1);

    let mes = Timestamp.fromDate(mesY);

    let sdoinic = this.ultsdo;
    let cont = this.meuForm.value.cont;
    let rend = this.meuForm.value.rendimento;
    let sdofinal = sdoinic + cont + rend;

    let rent = rend / sdoinic;
    let reg = this.reg + 1;

    console.log(mes, sdoinic, cont, rend, sdofinal, rent, reg);

    const previ = {
      mes: mes,
      saldo_inicial: sdoinic,
      contribuicao: cont,
      rendimento: rend,
      saldo_final: sdofinal,
      reg: reg,

      rentabilidade: rent,
    };

    console.log(previ);

    await this.gravarPrevi(previ);
    await this.save.emit(previ);
    this.ls.show('Atualizando AUM...');
    await this.as.atualizarBDAUMAgregado();
    this.ls.hide();
    this.pegarUltSdoPrevi();

    this.closeModal();
  }

  iniciarmeuForm() {
    this.meuForm = new FormGroup({
      mes: new FormControl('', Validators.required),
      cont: new FormControl('', Validators.required),
      rendimento: new FormControl('', Validators.required),
    });
  }

  ResetForm() {
    this.meuForm.reset();
    console.log('formulario resetado');
  }

  async gravarPrevi(previ) {
    const colRef = collection(this.fs.db, 'previ');
    addDoc(colRef, previ).then((docRef) => {
      console.log('Lançamento criado com o ID:', docRef.id);
    });
  }

  navigateToComponent() {
    this.router.navigate(['/previ']);
  }
}
