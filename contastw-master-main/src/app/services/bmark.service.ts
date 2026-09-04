import { AumService } from './aum.service';
import { TimestampService } from './timestamp.service';
import { computed, inject, Injectable, signal } from '@angular/core';
import { FirestoreService } from './firestore.service';
import {
  collection,
  addDoc,
  doc,
  getDoc,
  connectFirestoreEmulator,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import { Contas2Service } from './contas2.service';
import { Agreg2Service } from './agreg2.service';
import { Bp2Component } from '../pages/bp2/bp2.component';

@Injectable({
  providedIn: 'root',
})
export class BmarkService {
  fs = inject(FirestoreService);
  cs = inject(Contas2Service);
  ag = inject(Agreg2Service);
  ts = inject(TimestampService);
  //

  mes = new Date().getMonth();
  ctasPassivo = signal<any[]>([]);
  saldoPassivo = signal<number | null>(null);
  faltazerarPassivo = signal<number | null>(null);
  faltaatgAUM = signal<number | null>(null);
  alvo = signal<number | null>(null);
  ano0 = new Date().getFullYear();
  contasinvest = [175, 178, 5, 180, 6, 7, 8, 179]; //Códigos de contas de investimento
  invmenos1 = [388125.85]; //saldo de 2024 do agregado investimentos, sem previ
  constructor() {
    this.fs.conectar();
  }

  async getBmark(id): Promise<any | null> {
    try {
      const docRef = doc(this.fs.db, 'bmark', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return data ? data['alvo'] : null; // Retorna o valor do campo ou null se data for undefined
      } else {
        console.log('No such document!');
        return null;
      }
    } catch (error) {
      console.error('Error getting document:', error);
      return null;
    }
  }

  async falta2034() {
    let previap = await this.cs.getFieldValue(
      'contas2025',
      'N2Owfj9S7NcgFZtwrr5F',
      'saldo',
    );
    console.log(previap);
    let previ13 = await this.cs.getFieldValue(
      'contas2025',
      'vJC2pmKST51ZHGXvaKRt',
      'saldo',
    );
    console.log(previ13);

    let previtotal = previap + previ13;

    await this.cs.obterDados(
      'natureza',
      '==',
      'passivo',
      true,
      this.ctasPassivo,
      this.saldoPassivo,
    );
    console.log(this.saldoPassivo());

    let aum = await this.pegarAUM();
    console.log(aum);

    let diff = await this.ts.difAposentadoria();
    console.log(diff);

    let bmaposent0 = await this.getBmark('Mlb5v3nyBxYFS3xdWlQU');
    console.log(bmaposent0);
    this.alvo.set(bmaposent0);

    let bmaposent = bmaposent0 - aum;

    // let passivosemprevi = computed(() => {
    //   const saldo = this.saldoPassivo();
    //   if (saldo === null || diff === 0) return 0;

    //   return (saldo + previtotal) / diff;
    // });

    // console.log(passivosemprevi());

    let apos = bmaposent / diff;

    console.log(apos);

    let objetivo = await this.ag.pegarObj();

    this.faltazerarPassivo.set(objetivo);
    this.faltaatgAUM.set(apos);
  }

  async evolucaoPassivo() {
    const campoMes = `ano${this.ano0}.${this.ag.mesesCampos[this.mes]}`;

    let passivohoje0: number = await this.ag.getNestedFieldValueClient(
      'sh_agregados',
      '0AVwFNrr2L0iAhm5vkSp',
      campoMes,
    );
    let passivohoje = passivohoje0*(-1);
    
    console.log(passivohoje);

    let jrsfinanciamento: number = await this.ag.getNestedFieldValueClient(
      'contas2025',
      'kYDgq0vIGZVjsX3TigCu',
      campoMes,
    );
    console.log(jrsfinanciamento);

     let prestamista: number = await this.ag.getNestedFieldValueClient(
      'contas2025',
      'S4kEgeuzncBIHrj3hIhf',
      campoMes,
    );
    console.log(prestamista);

    if (this.mes == 0) {
      const campoMes0 = `ano${this.ano0 - 1}.${this.ag.mesesCampos[11]}`;

      let passivoanterior0: number = await this.ag.getNestedFieldValueClient(
        'sh_agregados',
        '0AVwFNrr2L0iAhm5vkSp',
        campoMes0,
      );

      let passivoanterior = passivoanterior0*(-1);
      console.log(passivoanterior);
      let pagonomes = passivohoje - passivoanterior - jrsfinanciamento - prestamista;

      return pagonomes;
    } else {
      const campoMes1 = `ano${this.ano0}.${this.ag.mesesCampos[this.mes - 1]}`;

      let passivohoje10: number = await this.ag.getNestedFieldValueClient(
        'sh_agregados',
        '0AVwFNrr2L0iAhm5vkSp',
        campoMes1,
      );
      let passivohoje1 = passivohoje10*(-1);

      console.log(passivohoje1);
      let pagonomes0 = (passivohoje - passivohoje1 - jrsfinanciamento - prestamista);
      let pagonomes = this.ts.roundToTwoDecimals(pagonomes0)
      console.log(pagonomes);

      return pagonomes;
    }
  }

   async evolucaoPassivoMenos1() {
    const campoMes = `ano${this.ano0}.${this.ag.mesesCampos[this.mes-1]}`;

    let passivohojeX: number = await this.ag.getNestedFieldValueClient(
      'sh_agregados',
      '0AVwFNrr2L0iAhm5vkSp',
      campoMes,
    );

    let passivohoje = passivohojeX*(-1);
    console.log(passivohoje);

    let jrsfinanciamento: number = await this.ag.getNestedFieldValueClient(
      'contas2025',
      'kYDgq0vIGZVjsX3TigCu',
      campoMes,
    );
    console.log(jrsfinanciamento);

     let prestamista: number = await this.ag.getNestedFieldValueClient(
      'contas2025',
      'S4kEgeuzncBIHrj3hIhf',
      campoMes,
    );
    console.log(prestamista);

    if (this.mes-1 == 0) {
      const campoMes0 = `ano${this.ano0 - 1}.${this.ag.mesesCampos[11]}`;

      let passivoanteriorX: number = await this.ag.getNestedFieldValueClient(
        'sh_agregados',
        '0AVwFNrr2L0iAhm5vkSp',
        campoMes0,
      );
      let passivoanterior = passivoanteriorX*(-1);
      console.log(passivoanterior);
      let pagonomes = passivohoje - passivoanterior - jrsfinanciamento - prestamista;
      console.log(pagonomes);
      return pagonomes*(-1);
    } else {
      const campoMes1 = `ano${this.ano0}.${this.ag.mesesCampos[this.mes - 2]}`;

      let passivohoje1X: number = await this.ag.getNestedFieldValueClient(
        'sh_agregados',
        '0AVwFNrr2L0iAhm5vkSp',
        campoMes1,
      );
      let passivohoje1 = passivohoje1X*(-1);
      console.log(passivohoje1);
      let pagonomes = passivohoje - passivohoje1 - jrsfinanciamento - prestamista;
      console.log(pagonomes);

      return pagonomes*(-1);
    }
  }

  async evolucaoAUM() {
    if (this.mes === 0) {
      const campoMes = `ano${this.ano0}.${this.ag.mesesCampos[this.mes]}`;
      console.log(campoMes);

      let aumhoje: number = await this.ag.getNestedFieldValueClient(
        'sh_agregados',
        'K5eDh0H5pIiTc9s6W9zy',
        campoMes,
      );

      console.log(aumhoje);
      const campoMes2 = `ano${this.ano0 - 1}.${this.ag.mesesCampos[11]}`;

      let aumantes: number = await this.ag.getNestedFieldValueClient(
        'sh_agregados',
        'K5eDh0H5pIiTc9s6W9zy',
        campoMes2,
      );
      console.log(aumantes);

      let aplicadonomes = aumhoje - aumantes;
      console.log(aplicadonomes);

      return aplicadonomes;
    } else {
      const campoMes = `ano${this.ano0}.${this.ag.mesesCampos[this.mes]}`;

      let aumhoje: number = await this.ag.getNestedFieldValueClient(
        'sh_agregados',
        'K5eDh0H5pIiTc9s6W9zy',
        campoMes,
      );

      const campoMes2 = `ano${this.ano0}.${this.ag.mesesCampos[this.mes - 1]}`;

      let aumantes: number = await this.ag.getNestedFieldValueClient(
        'sh_agregados',
        'K5eDh0H5pIiTc9s6W9zy',
        campoMes2,
      );

      let aplicadonomes = aumhoje - aumantes;

      return aplicadonomes;
    }
  }

  async evolucaoAUMmenos2() {
    if (this.mes === 0) {
      const campoMes = `ano${this.ano0 - 1}.${this.ag.mesesCampos[11]}`;

      let aumhoje: number = await this.ag.getNestedFieldValueClient(
        'sh_agregados',
        'K5eDh0H5pIiTc9s6W9zy',
        campoMes,
      );

      const campoMes2 = `ano${this.ano0 - 1}.${this.ag.mesesCampos[10]}`;

      let aumantes: number = await this.ag.getNestedFieldValueClient(
        'sh_agregados',
        'K5eDh0H5pIiTc9s6W9zy',
        campoMes2,
      );
      let aplicadonomes = aumhoje - aumantes;

      return aplicadonomes;
    } else {
      const campoMes = `ano${this.ano0}.${this.ag.mesesCampos[this.mes - 1]}`;

      let aumhoje: number = await this.ag.getNestedFieldValueClient(
        'sh_agregados',
        'K5eDh0H5pIiTc9s6W9zy',
        campoMes,
      );

      const campoMes2 = `ano${this.ano0}.${this.ag.mesesCampos[this.mes - 2]}`;

      let aumantes: number = await this.ag.getNestedFieldValueClient(
        'sh_agregados',
        'K5eDh0H5pIiTc9s6W9zy',
        campoMes2,
      );

      let aplicadonomes = aumhoje - aumantes;

      return aplicadonomes;
    }
  }

  async pegarUltimoMesPrevi() {
    const colRef = collection(this.fs.db, 'previ');
    const q = query(colRef, orderBy('mes', 'desc'), limit(1));
    const qs = await getDocs(q);
    let contasData: any[] = [];
    contasData = qs.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    let sf = contasData[0].saldo_final;
    let reg = contasData[0].reg;
    let mes = contasData[0].mes;
    return [reg, sf, mes];
  }

  async pegarAUM() {
    let sf0 = await this.pegarUltimoMesPrevi();
    let sf = Math.round(sf0[1] * 0.9 * 100) / 100;
    //  console.log(sf);
    let mes = sf0[2].toDate().getMonth();
    //console.log(mes);
    const colRef = collection(this.fs.db, 'contas2025');
    const q = query(colRef, where('cod', 'in', this.contasinvest));
    const qs = await getDocs(q);
    let contasData: any[] = [];
    contasData = qs.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const inv = contasData.reduce(function (a, b) {
      return a + b.saldo;
    }, 0);

    let aum0 = sf + inv;
    let aum = Math.round(aum0 * 100) / 100;
    // await this.ag2.atualizarValoresPorMes('K5eDh0H5pIiTc9s6W9zy', 12, aum);
    // await this.pegarAUMmesAnterior(this.mes);
    // await this.pegarAUMmesAnterior(this.mes - 1);

    return aum;
  }

  async bM() {
    const colRef = collection(this.fs.db, 'indices_economicos');
    const q = query(colRef, where('reg', '==', 1));

    const qs = await getDocs(q);

    let items: any[] = [];

    items = qs.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return items;
  }

  async bM2() {
    const colRef = collection(this.fs.db, 'indices_economicos');
    const q = query(colRef, where('reg', '!=', 1));

    const qs = await getDocs(q);

    let items: any[] = [];

    items = qs.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return items;
  }
}
