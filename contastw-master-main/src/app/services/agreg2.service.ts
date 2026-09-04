import { inject, Injectable, signal, computed } from '@angular/core';
import { Contas2Service } from './contas2.service';
import { FirestoreService } from './firestore.service';
import { LctosService } from './lctos.service';
import { TimestampService } from './timestamp.service';
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  doc,
  Timestamp,
  updateDoc,
  increment,
  getDoc,
  DocumentSnapshot,
  FieldPath,
  FieldValue,
  limit,
} from 'firebase/firestore';
import { BmarkService } from './bmark.service';

@Injectable({
  providedIn: 'root',
})
export class Agreg2Service {
  fs = inject(FirestoreService);
  cs = inject(Contas2Service);
  ts = inject(TimestampService);
  ls = inject(LctosService);

  valordeb = signal<number>(0);
  valorcred = signal<number>(0);
  resultado = signal<number>(0);
  agreg = signal<any[]>([]);
  fonte: any[] = [];

  hoje = new Date().getMonth();
  ano = new Date().getFullYear();
  dia = new Date().getDate();
  ano1 = 2026;

  cal2025 = [
    {
      inicio: new Date(this.ano, 0, 1),
      fim: new Date(this.ano, 0, 31),
      label: 'ano' + this.ano + '.jan',
    },
    {
      inicio: new Date(this.ano, 0, 1),
      fim: new Date(this.ano, 1, 28),
      label: 'ano' + this.ano + '.fev',
    },
    {
      inicio: new Date(this.ano, 0, 1),
      fim: new Date(this.ano, 2, 31),
      label: 'ano' + this.ano + '.mar',
    },
    {
      inicio: new Date(this.ano, 0, 1),
      fim: new Date(this.ano, 3, 30),
      label: 'ano' + this.ano + '.abr',
    },
    {
      inicio: new Date(this.ano, 0, 1),
      fim: new Date(this.ano, 4, 31),
      label: 'ano' + this.ano + '.mai',
    },
    {
      inicio: new Date(this.ano, 0, 1),
      fim: new Date(this.ano, 5, 30),
      label: 'ano' + this.ano + '.jun',
    },
    {
      inicio: new Date(this.ano, 0, 1),
      fim: new Date(this.ano, 6, 31),
      label: 'ano' + this.ano + '.jul',
    },
    {
      inicio: new Date(this.ano, 0, 1),
      fim: new Date(this.ano, 7, 31),
      label: 'ano' + this.ano + '.ago',
    },
    {
      inicio: new Date(this.ano, 0, 1),
      fim: new Date(this.ano, 8, 30),
      label: 'ano' + this.ano + '.set',
    },
    {
      inicio: new Date(this.ano, 0, 1),
      fim: new Date(this.ano, 9, 31),
      label: 'ano' + this.ano + '.out',
    },
    {
      inicio: new Date(this.ano, 0, 1),
      fim: new Date(this.ano, 10, 30),
      label: 'ano' + this.ano + '.nov',
    },
    {
      inicio: new Date(this.ano, 0, 1),
      fim: new Date(this.ano, 11, 31),
      label: 'ano' + this.ano + '.dez',
    },
  ];

  cal2026 = [
    {
      inicio: new Date(this.ano1, 0, 1),
      fim: new Date(this.ano1, 0, 31),
      label: 'ano' + this.ano1 + '.jan',
    },
    {
      inicio: new Date(this.ano1, 0, 1),
      fim: new Date(this.ano1, 1, 28),
      label: 'ano' + this.ano1 + '.fev',
    },
    {
      inicio: new Date(this.ano1, 0, 1),
      fim: new Date(this.ano1, 2, 31),
      label: 'ano' + this.ano1 + '.mar',
    },
    {
      inicio: new Date(this.ano1, 0, 1),
      fim: new Date(this.ano1, 3, 30),
      label: 'ano' + this.ano1 + '.abr',
    },
    {
      inicio: new Date(this.ano1, 0, 1),
      fim: new Date(this.ano1, 4, 31),
      label: 'ano' + this.ano1 + '.mai',
    },
    {
      inicio: new Date(this.ano1, 0, 1),
      fim: new Date(this.ano1, 5, 30),
      label: 'ano' + this.ano1 + '.jun',
    },
    {
      inicio: new Date(this.ano1, 0, 1),
      fim: new Date(this.ano1, 6, 31),
      label: 'ano' + this.ano1 + '.jul',
    },
    {
      inicio: new Date(this.ano1, 0, 1),
      fim: new Date(this.ano1, 7, 31),
      label: 'ano' + this.ano1 + '.ago',
    },
    {
      inicio: new Date(this.ano1, 0, 1),
      fim: new Date(this.ano1, 8, 30),
      label: 'ano' + this.ano1 + '.set',
    },
    {
      inicio: new Date(this.ano1, 0, 1),
      fim: new Date(this.ano1, 9, 31),
      label: 'ano' + this.ano1 + '.out',
    },
    {
      inicio: new Date(this.ano1, 0, 1),
      fim: new Date(this.ano1, 10, 30),
      label: 'ano' + this.ano1 + '.nov',
    },
    {
      inicio: new Date(this.ano1, 0, 1),
      fim: new Date(this.ano1, 11, 31),
      label: 'ano' + this.ano1 + '.dez',
    },
  ];
  mesesCampos = [
    'jan',
    'fev',
    'mar',
    'abr',
    'mai',
    'jun',
    'jul',
    'ago',
    'set',
    'out',
    'nov',
    'dez',
  ];

  constructor() {
    this.fs.conectar();
  }

  async pegarShAgreg(a, b, c) {
    const colRef = collection(this.fs.db, 'sh_agregados');
    const qs0 = query(
      colRef,

      where(a, b, c),
      orderBy('cod', 'asc')
    );
    const qs = await getDocs(qs0);
    let contasData: any[] = [];
    contasData = qs.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return contasData; // Log the retrieved data
  }

  async pegarTab() {
    const colRef = collection(this.fs.db, 'sh_agregados');
    const qs0 = query(
      colRef,

      where(
        'cod',
        'in',
        [
          900, 900.1, 901, 901.1, 902, 902.1, 903, 903.1, 904, 905, 910, 913,
          914, 915, 918, 921, 922, 923, 928, 930, 931, 933,
        ]
      ),
      orderBy('cod', 'asc')
    );
    const qs = await getDocs(qs0);
    let contasData: any[] = [];
    contasData = qs.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return contasData; // Log the retrieved data
  }

  async pegarTab2() {
    const colRef = collection(this.fs.db, 'sh_agregados');
    const qs0 = query(
      colRef,

      where('cod', 'in', [950.1, 950.2, 950.3, 950.4, 950.5, 950.51]),
      orderBy('cod')
    );
    const qs = await getDocs(qs0);
    let contasData: any[] = [];
    contasData = qs.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return contasData; // Log the retrieved data
  }

  async pegarTab3() {
    const colRef = collection(this.fs.db, 'sh_agregados');
    const qs0 = query(
      colRef,

      where('cod', 'in', [910, 913, 914, 915, 918, 921, 922, 923, 928]),
      orderBy('ano2025.total', 'desc')
    );
    const qs = await getDocs(qs0);
    let contasData: any[] = [];
    contasData = qs.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return contasData; // Log the retrieved data
  }

  async off() {
    this.calcular1(
      'cod',
      'in',
      [932],
      'contadebitada.mod_despesa',
      'contacreditada.mod_despesa',
      this.ts.caldesp
    );
  }

  async superavitLiquido() {
    if (this.hoje === 0) {
      const campoMes_1 = `ano${this.ano - 1}.${this.mesesCampos[11]}`;
      let docData: number = await this.getNestedFieldValueClient(
        'sh_agregados',
        '7yLtE9Loqo2Q416w9ndK',
        campoMes_1
      );

      let docData2: number = await this.getNestedFieldValueClient(
        'sh_agregados',
        'BB9Wo3WLdeFanctk8fYH',
        campoMes_1
      );

      const campoMes = `ano${this.ano}.${this.mesesCampos[this.hoje]}`;

      let docData3: number = await this.getNestedFieldValueClient(
        'sh_agregados',
        '7yLtE9Loqo2Q416w9ndK',
        campoMes
      );

      //console.log(docData);

      let docData4: number = await this.getNestedFieldValueClient(
        'sh_agregados',
        'BB9Wo3WLdeFanctk8fYH',
        campoMes
      );

      let superavitliq_1 = (docData + docData2) * -1;
      let superavitliq = (docData3 + docData4) * -1;
      //  await this.atualizarValoresPorMes(
      //   'WdtS8S1jtIhQ2aoUloA8',
      //   11,
      //   superavitliq_1
      // );

      await this.atualizarValoresPorMes(
        'WdtS8S1jtIhQ2aoUloA8',
        this.hoje,
        superavitliq
      );
    } else {
      const campoMes_1 = `ano${this.ano}.${this.mesesCampos[this.hoje - 1]}`;

      let docData: number = await this.getNestedFieldValueClient(
        'sh_agregados',
        '7yLtE9Loqo2Q416w9ndK',
        campoMes_1
      );

      console.log(docData);

      let docData2: number = await this.getNestedFieldValueClient(
        'sh_agregados',
        'BB9Wo3WLdeFanctk8fYH',
        campoMes_1
      );

      console.log(docData2);

      const campoMes = `ano${this.ano}.${this.mesesCampos[this.hoje]}`;

      let docData3: number = await this.getNestedFieldValueClient(
        'sh_agregados',
        '7yLtE9Loqo2Q416w9ndK',
        campoMes
      );

      console.log(docData);

      let docData4: number = await this.getNestedFieldValueClient(
        'sh_agregados',
        'BB9Wo3WLdeFanctk8fYH',
        campoMes
      );

      console.log(docData2);

      let superavitliq_1 = (docData + docData2) * -1;
      let superavitliq = (docData3 + docData4) * -1;

      // let desp_recliq = (docData2 / docData) * -1;
      console.log(superavitliq_1);

      await this.atualizarValoresPorMes(
        'WdtS8S1jtIhQ2aoUloA8',
        this.hoje - 1,
        superavitliq_1
      );

      await this.atualizarValoresPorMes(
        'WdtS8S1jtIhQ2aoUloA8',
        this.hoje,
        superavitliq
      );
      // await this.atualizarValoresPorMes(
      //   'lkZLhYcIZPtXMp6JLcF3',
      //   this.hoje - 1,
      //   desp_recliq
      // );
    }
  }

  //+++++++++++++++++++++ calculo do des/rec total+++++++++++++++++++++++++++

  async totalizador() {
    //receita e despesa total

    let i = this.hoje;

    //despesa e receita liquida

    let totaloff0 = await this.saldoporNatureza(
      'contadebitada.mod_despesa',
      'contacreditada.mod_despesa',
      'off',
      this.cal2025[i].inicio,
      this.cal2025[i].fim
    );

    let totaloff = this.ts.roundToTwoDecimals(totaloff0);

    await this.atualizarValoresPorMes('2yAZKd4gIdYGP9l3xQP6', 12, totaloff);

    //multiplos desp/rec total e desp/rec liq

    let fonte1: any[] = [];
    fonte1 = await this.pegarShAgreg('agregado', '==', 'superávit líquido');
    console.log(fonte1);

    if (fonte1.length > 0 && fonte1[0].ano2025) {
      let jan = fonte1[0][`ano${this.ano}`].jan;
      let fev = fonte1[0][`ano${this.ano}`].fev;
      let mar = fonte1[0][`ano${this.ano}`].mar;
      let abr = fonte1[0][`ano${this.ano}`].abr;
      let mai = fonte1[0][`ano${this.ano}`].mai;
      let jun = fonte1[0][`ano${this.ano}`].jun;
      let jul = fonte1[0][`ano${this.ano}`].jul;
      let ago = fonte1[0][`ano${this.ano}`].ago;
      let set = fonte1[0][`ano${this.ano}`].set;
      let out = fonte1[0][`ano${this.ano}`].out;
      let nov = fonte1[0][`ano${this.ano}`].nov;
      let dez = fonte1[0][`ano${this.ano}`].dez;

      console.log(jan);

      let total = this.ts.roundToTwoDecimals(
        jan + fev + mar + abr + mai + jun + jul + ago + set + out + nov + dez
      );
      // console.log(total);

      await this.atualizarValoresPorMes('WdtS8S1jtIhQ2aoUloA8', 12, total);
    }

    let fonte2: any[] = [];
    fonte2 = await this.pegarDespEnq();
    //console.log(fonte2);

    for (let i = 0; i < fonte2.length; i++) {
      let id = fonte2[i].id;
      let agreg = fonte2[i].agregado;
      let jan = fonte2[i][`ano${this.ano}`].jan;
      let fev = fonte2[i][`ano${this.ano}`].fev;
      let mar = fonte2[i][`ano${this.ano}`].mar;
      let abr = fonte2[i][`ano${this.ano}`].abr;
      let mai = fonte2[i][`ano${this.ano}`].mai;
      let jun = fonte2[i][`ano${this.ano}`].jun;
      let jul = fonte2[i][`ano${this.ano}`].jul;
      let ago = fonte2[i][`ano${this.ano}`].ago;
      let set = fonte2[i][`ano${this.ano}`].set;
      let out = fonte2[i][`ano${this.ano}`].out;
      let nov = fonte2[i][`ano${this.ano}`].nov;
      let dez = fonte2[i][`ano${this.ano}`].dez;

      let total = this.ts.roundToTwoDecimals(
        jan + fev + mar + abr + mai + jun + jul + ago + set + out + nov + dez
      );
      //console.log(agreg, total);
      await this.atualizarValoresPorMes(id, 12, total);
    }
  }

  //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

  async calcular1(a, b, c, d, e, f) {
    let fonte = await this.pegarShAgreg(a, b, c);
    //console.log(fonte);

    for (let i = 0; i < fonte.length; i++) {
      let mes = new Date().getMonth();
      let id = fonte[i].id;
      let agreg = fonte[i].agregado;
      let nat = fonte[i].tipo;
      let resp = fonte[i].resp;
      let anoant = fonte[i][`fechamento${this.ano-1}`];
      let inicio = f[mes].inicio;
      let fim = f[mes].fim;

      let saldo0 = await this.saldoporNatureza(
        d,
        e,
        // 'contadebitada.natureza',
        // 'contacreditada.natureza',
        resp,
        inicio,
        fim
      );
      let res = this.ts.roundToTwoDecimals(saldo0 + anoant);
      //console.log(res);
      this.atualizarValoresPorMes(id, mes, res);

      if (mes > 0) {
        let inic = f[mes - 1].inicio;
        let fim = f[mes - 1].fim;
        let result9 = await this.saldoporNatureza(d, e, resp, inic, fim);
        let result10 = this.ts.roundToTwoDecimals(result9 + anoant);

        this.atualizarValoresPorMes(id, mes - 1, result10);
        //console.log('calculo retroativo realizado!');
      }
    }
  }

  //ativo e passivo
  async menosum() {
    await this.calcular1(
      'cod',
      'in',
      [900, 901],
      'contadebitada.natureza',
      'contacreditada.natureza',
      this.cal2025
    );
    //console.log('terminado ativo e passivo');

    if (this.dia < 15 && this.hoje != 0) {
      console.log('calculando o mes anterior ativo e passivo....');

      let campoMes_1 = `ano${this.ano}.${this.mesesCampos[this.hoje - 1]}`;
      let pass_1: number = await this.getNestedFieldValueClient(
        'sh_agregados',
        '0AVwFNrr2L0iAhm5vkSp',
        campoMes_1
      );
      //console.log(pass_1);
      let ativ_1: number = await this.getNestedFieldValueClient(
        'sh_agregados',
        'AmWuqcCmRZ3ZzgH7kEbO',
        campoMes_1
      );
      //  console.log(ativ_1);
      let pass_ativ_1: number = (pass_1 / ativ_1) * -1;
      await this.atualizarValoresPorMes(
        '9r9xraRfB4VJNr46WYji',
        this.hoje - 1,
        pass_ativ_1
      );
    }

    let campoMes = `ano${this.ano}.${this.mesesCampos[this.hoje]}`;
    let pass: number = await this.getNestedFieldValueClient(
      'sh_agregados',
      '0AVwFNrr2L0iAhm5vkSp',
      campoMes
    );
    //  console.log(pass);
    let ativ: number = await this.getNestedFieldValueClient(
      'sh_agregados',
      'AmWuqcCmRZ3ZzgH7kEbO',
      campoMes
    );
    //  console.log(ativ);

    let pass_ativ: number = parseFloat(((pass / ativ) * -1).toFixed(3));

    // console.log(pass_ativ);
    // console.log(pass_ativ_1);

    //  await this.atualizarValoresPorMes(
    //  '9r9xraRfB4VJNr46WYji',
    //  this.hoje,
    //   pass_ativ
    //  );

    await this.atualizarValoresPorMes('9r9xraRfB4VJNr46WYji', 12, pass_ativ);

    await this.atualizarValoresPorMes('0AVwFNrr2L0iAhm5vkSp', 12, pass);
    await this.atualizarValoresPorMes('AmWuqcCmRZ3ZzgH7kEbO', 12, ativ);
  }

  //despesa e receita total
  async menosum2() {
    await this.calcular1(
      'cod',
      'in',
      [902, 903],
      'contadebitada.natureza',
      'contacreditada.natureza',
      this.ts.caldesp
    );
    //console.log('terminado despesa e receita');

    if (this.dia < 15 && this.hoje != 0) {
      let campoMes_1 = `ano${this.ano}.${this.mesesCampos[this.hoje - 1]}`;
      let desp_1: number = await this.getNestedFieldValueClient(
        'sh_agregados',
        'vDi7ftEXgHavCzngGik5',
        campoMes_1
      );
      // console.log(desp_1);
      let rec_1: number = await this.getNestedFieldValueClient(
        'sh_agregados',
        'TQxibYZpx7k7CbSz7DGg',
        campoMes_1
      );
      // console.log(rec_1);
      let desp_rec_1: number = (desp_1 / rec_1) * -1;
      await this.atualizarValoresPorMes(
        '3TDHxqu8M25B3DjtNVWs',
        this.hoje - 1,
        desp_rec_1
      );
    }

    let campoMes = `ano${this.ano}.${this.mesesCampos[this.hoje]}`;
    let desp: number = await this.getNestedFieldValueClient(
      'sh_agregados',
      'vDi7ftEXgHavCzngGik5',
      campoMes
    );
    //console.log(desp);
    let rec: number = await this.getNestedFieldValueClient(
      'sh_agregados',
      'TQxibYZpx7k7CbSz7DGg',
      campoMes
    );
    //console.log(rec);

    let desp_rec: number = (desp / rec) * -1;

    // console.log(desp_rec);
    //console.log(desp_rec_1);

    await this.atualizarValoresPorMes(
      '3TDHxqu8M25B3DjtNVWs',
      this.hoje,
      desp_rec
    );

    let saldo0 = await this.saldoporNatureza(
      'contadebitada.natureza',
      'contacreditada.natureza',
      'despesa',
      this.cal2025[this.hoje].inicio,
      this.cal2025[this.hoje].fim
    );

    // console.log(saldo0)

    let saldo1 = await this.saldoporNatureza(
      'contadebitada.natureza',
      'contacreditada.natureza',
      'receita',
      this.cal2025[this.hoje].inicio,
      this.cal2025[this.hoje].fim
    );
    //console.log(saldo1)

    await this.atualizarValoresPorMes('vDi7ftEXgHavCzngGik5', 12, saldo0);
    await this.atualizarValoresPorMes('TQxibYZpx7k7CbSz7DGg', 12, saldo1);
  }

  //despesa liquida
  async menosum3() {
    await this.calcular1(
      'cod',
      'in',
      [930, 931],
      'contadebitada.mod_despesa',
      'contacreditada.mod_despesa',
      this.ts.caldesp
    );
    //console.log('terminado compr e ger');

    if (this.dia < 15 && this.hoje != 0) {
      let campoMes_1 = `ano${this.ano}.${this.mesesCampos[this.hoje - 1]}`;
      let comp_1: number = await this.getNestedFieldValueClient(
        'sh_agregados',
        'RON4QGNrj8ZykZrQJSuU',
        campoMes_1
      );
      //console.log(comp_1);
      let ger_1: number = await this.getNestedFieldValueClient(
        'sh_agregados',
        'v9cgg3wHHiVAgkuqlbvc',
        campoMes_1
      );
      // console.log(ger_1);

      let despliquida_1: number = this.ts.roundToTwoDecimals(comp_1 + ger_1);
      this.atualizarValoresPorMes(
        'BB9Wo3WLdeFanctk8fYH',
        this.hoje - 1,
        despliquida_1
      );
    }

    let campoMes = `ano${this.ano}.${this.mesesCampos[this.hoje]}`;
    let comp: number = await this.getNestedFieldValueClient(
      'sh_agregados',
      'RON4QGNrj8ZykZrQJSuU',
      campoMes
    );
    // console.log(comp);
    let ger: number = await this.getNestedFieldValueClient(
      'sh_agregados',
      'v9cgg3wHHiVAgkuqlbvc',
      campoMes
    );
    // console.log(ger);

    let despliquida: number = this.ts.roundToTwoDecimals(comp + ger);

    this.atualizarValoresPorMes('BB9Wo3WLdeFanctk8fYH', this.hoje, despliquida);

    // Função para somar valores aninhados
    const userDoc = doc(this.fs.db, 'sh_agregados', 'BB9Wo3WLdeFanctk8fYH');
    const userSnapshot = await getDoc(userDoc);

    if (userSnapshot.exists()) {
      const userData = userSnapshot.data();
      const mapData = userData['ano2025'];
      let totalSum = 0;

      for (const key in mapData) {
        if (mapData.hasOwnProperty(key)) {
          totalSum += mapData[key];
        }
      } //console.log(`A soma total dos valores do campo  é: ${totalSum}`);
    } else {
      console.log('Documento do usuário não encontrado.');
    }
  }

  //desp dividido por rec liquida e superavit liquido
  async menosum5() {
    if (this.dia < 15 && this.hoje != 0) {
      console.log('calcualando mes anterior desp/rec');

      let campoMes_1 = `ano${this.ano}.${this.mesesCampos[this.hoje - 1]}`;
      console.log(campoMes_1);
      let despliquida_1: number = await this.getNestedFieldValueClient(
        'sh_agregados',
        'BB9Wo3WLdeFanctk8fYH',
        campoMes_1
      );
      console.log(despliquida_1);
      // console.log(despliquida_1);
      let recliquida_1: number = await this.getNestedFieldValueClient(
        'sh_agregados',
        '7yLtE9Loqo2Q416w9ndK',
        campoMes_1
      );
      console.log(recliquida_1);
      let desprecliquida_1: number = (despliquida_1 / recliquida_1) * -1;

      this.atualizarValoresPorMes(
        'lkZLhYcIZPtXMp6JLcF3',
        this.hoje - 1,
        desprecliquida_1
      );
    }

    let campoMes = `ano${this.ano}.${this.mesesCampos[this.hoje]}`;
    let despliquida: number = await this.getNestedFieldValueClient(
      'sh_agregados',
      'BB9Wo3WLdeFanctk8fYH',
      campoMes
    );
    console.log(despliquida);
    let recliquida: number = await this.getNestedFieldValueClient(
      'sh_agregados',
      '7yLtE9Loqo2Q416w9ndK',
      campoMes
    );
    console.log(recliquida);

    let desprecliquida: number = (despliquida / recliquida) * -1;

    // console.log(desprecliquida_1, desprecliquida);

    this.atualizarValoresPorMes(
      'lkZLhYcIZPtXMp6JLcF3',
      this.hoje,
      desprecliquida
    );

    await this.superavitLiquido();
    await this.totalizador();
    await this.atualizarMesEnquadramento();
  }

  async DFO(dia, fontes) {
    let dfo: any[] = [];
    dfo = await this.pegarDFO();
    console.log(dfo);

    for (let i = 0; i < dfo.length; i++) {
      let campoMes = `ano2025.${this.mesesCampos[dia]}`;

      let id = dfo[i].id0;

      let sdo = await this.getNestedFieldValueClient(
        'contas2025',
        id,
        campoMes
      );
      console.log(id, sdo);

      fontes.push(sdo);

      let somaTotal = fontes.reduce((acumulador, valorAtual) => {
        return acumulador + valorAtual;
      }, 0); // O '0' é o valor inicial do acumulador

      console.log('O array final é:', fontes);
      console.log('A soma total dos valores é:', somaTotal);

      // Você pode agora retornar a soma ou fazer o que precisar com ela

      const docRef = doc(this.fs.db, 'sh_agregados', 'dBhgmT8mW1aPtj12tZQc');
      await updateDoc(docRef, {
        [campoMes]: somaTotal,
        atualizacao: Timestamp.now(),
      });
    }
  }

  async pegarDFO() {
    const colRef = collection(this.fs.db, 'contas2025');
    const q = query(colRef, where('cod', 'in', [37, 32, 40, 39, 35]));

    const qs = await getDocs(q);
    let contasData = qs.docs.map((doc) => ({
      id0: doc.id,
      ...doc.data(),
    }));

    return contasData; // Log the retrieved data
  }

  async saldoporNatureza(tipo1, tipo2, nat, inicio, fim) {
    let fonte = await this.totalizarporNatureza(tipo1, nat, inicio, fim);
    let fonte2 = fonte.reduce(function (a, b) {
      return a + b.valor;
    }, 0);

    let fonte3 = await this.totalizarporNatureza(tipo2, nat, inicio, fim);
    let fonte4 = fonte3.reduce(function (a, b) {
      return a + b.valor;
    }, 0);

    let montante = fonte2 - fonte4;

    //console.log(fonte2, fonte4, montante);

    return montante;
  }

  async pegarUltimoMesPrevi(reg) {
    const colRef = collection(this.fs.db, 'previ');
    const q = query(colRef, where('reg', '==', reg));
    const qs = await getDocs(q);

    let contasData: any[] = qs.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Se não encontrou dados, tenta com reg - 1
    if (!contasData || contasData.length === 0) {
      const qAlt = query(colRef, where('reg', '==', reg - 1));
      const qsAlt = await getDocs(qAlt);

      contasData = qsAlt.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    }

    // Verifica novamente se encontrou dados após a segunda tentativa
    if (!contasData || contasData.length === 0) {
      // Retorna valor padrão ou null, conforme sua lógica
      return ['sem dados', 0];
    }

    // Agora é seguro acessar contasData[0]
    const sf = contasData[0].saldo_final ?? 0;
    const reg0 = contasData[0].reg;
    const sf2 = sf * 0.9;

    return [reg0, sf2];
  }

  async totalizarporNatureza(fonte, nat, inicio, fim) {
    const colRef = collection(this.fs.db, 'lancamentos2025');
    const q = query(
      colRef,
      where(fonte, '==', nat),
      where('datalcto', '>=', inicio),
      where('datalcto', '<=', fim)
    );
    const qs = await getDocs(q);

    let contasData: any[] = [];
    contasData = qs.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return contasData; // Log the retrieved data
  }

  async atualizarValoresPorMes(
    documentId: string,
    mes: number,
    novoValor: number
  ): Promise<void> {
    const collectionRef = collection(this.fs.db, 'sh_agregados'); // Substitua 'sua_colecao' pelo nome da sua coleção
    const docRef = doc(collectionRef, documentId);

    const updateData = {};

    switch (mes) {
      case 0:
        updateData[`ano${this.ano}.jan`] = novoValor;
        break;
      case 1:
        updateData[`ano${this.ano}.fev`] = novoValor;
        break;
      case 2:
        updateData[`ano${this.ano}.mar`] = novoValor;
        break;
      case 3:
        updateData[`ano${this.ano}.abr`] = novoValor;
        break;
      case 4:
        updateData[`ano${this.ano}.mai`] = novoValor;
        break;
      case 5:
        updateData[`ano${this.ano}.jun`] = novoValor;
        break;
      case 6:
        updateData[`ano${this.ano}.jul`] = novoValor;
        break;
      case 7:
        updateData[`ano${this.ano}.ago`] = novoValor;
        break;
      case 8:
        updateData[`ano${this.ano}.set`] = novoValor;
        break;
      case 9:
        updateData[`ano${this.ano}.out`] = novoValor;
        break;
      case 10:
        updateData[`ano${this.ano}.nov`] = novoValor;
        break;
      case 11:
        updateData[`ano${this.ano}.dez`] = novoValor;
        break;
      case 12:
        updateData[`ano${this.ano}.total`] = novoValor;
        break;
      default:
        console.error('Mês inválido:', mes);
        return; // Encerra a função se o mês for inválido
    }

    // Adiciona um timestamp para registrar quando os dados foram atualizados
    updateData['atualizacao'] = Timestamp.now();

    try {
      await updateDoc(docRef, updateData);
      console.log(`Campo atualizado para o mês de ${mes} com sucesso!`);
    } catch (error) {
      console.error('Erro ao atualizar o documento:', error);
      throw new Error('Erro ao atualizar o documento');
    }
  }

  async atualizarValoresPorMesFOPAG(
    documentId: string,
    mes: number, // 0 para Jan, ..., 11 para Dez, 12 para Total
    valorAIncrementar: number // O valor que será somado ao valor existente
  ): Promise<void> {
    const collectionRef = collection(this.fs.db, 'sh_agregados');
    const docRef = doc(collectionRef, documentId);

    const updateData: { [key: string]: any } = {}; // Tipagem mais genérica para updateData

    const mesesNomes = [
      'jan',
      'fev',
      'mar',
      'abr',
      'mai',
      'jun',
      'jul',
      'ago',
      'set',
      'out',
      'nov',
      'dez',
    ];

    let campoAfetado = '';

    if (mes >= 0 && mes <= 11) {
      // Caso seja um mês específico (0-11)

      const nomeDoCampoMes = `ano${this.ano}.${mesesNomes[mes]}`;
      console.log(nomeDoCampoMes);
      updateData[nomeDoCampoMes] = increment(valorAIncrementar);
      // Também incrementamos o total do ano
      updateData[`ano${this.ano}.total`] = increment(valorAIncrementar);
      campoAfetado = `mês de ${mesesNomes[mes]} e total`;
    } else if (mes === 12) {
      // Caso seja para atualizar apenas o total (mes === 12)
      updateData[`ano${this.ano}.total`] = increment(valorAIncrementar);
      campoAfetado = 'total';
    } else {
      console.error('Mês inválido:', mes);
      // É uma boa prática lançar um erro para que o chamador saiba que algo deu errado
      throw new Error(
        `Mês inválido: ${mes}. Use 0-11 para meses ou 12 para o total.`
      );
    }

    // Adiciona um timestamp para registrar quando os dados foram atualizados
    updateData['atualizacao'] = Timestamp.now();

    try {
      await updateDoc(docRef, updateData);
      console.log(
        `Campo(s) (${campoAfetado}) incrementado(s) em ${valorAIncrementar} com sucesso para o documento ${documentId}!`
      );
    } catch (error) {
      console.error('Erro ao atualizar o documento:', error);
      throw new Error('Erro ao atualizar o documento'); // Re-lança o erro para o chamador
    }
  }

  async getNestedFieldValueClient<T = unknown>(
    collectionPath: string,
    documentId: string,
    fieldPath: string | FieldPath // Aceita string com '.' ou um FieldPath
  ): Promise<T | undefined> {
    try {
      const docRef = doc(this.fs.db, collectionPath, documentId); // Sintaxe do Client SDK
      const docSnap: DocumentSnapshot = await getDoc(docRef); // Função getDoc() do Client SDK

      // Note a função exists() no Client SDK
      if (docSnap.exists()) {
        // O método get() do snapshot funciona da mesma forma aqui!
        const value = docSnap.get(fieldPath);

        if (value !== undefined) {
          // console.log(`Documento encontrado. Valor do campo '${String(fieldPath)}':`, value);
          return value as T;
        } else {
          // console.log(
          //   `Documento encontrado, mas o campo no caminho '${String(
          //     fieldPath
          //   )}' não existe ou é undefined.`
          // );
          return undefined;
        }
      } else {
        console.log(
          `Documento não encontrado em ${collectionPath}/${documentId}`
        );
        return undefined;
      }
    } catch (error) {
      console.error(
        `Erro ao buscar o campo '${String(
          fieldPath
        )}' no documento ${collectionPath}/${documentId} (verifique regras de segurança):`,
        error
      );
      throw error;
    }
  }

  async pegarAgreg() {
    const colRef = collection(this.fs.db, 'sh_agregados');
    const qs0 = query(
      colRef,

      orderBy('cod', 'asc')
    );
    const qs = await getDocs(qs0);
    let contasData: any[] = [];
    contasData = qs.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return contasData; // Log the retrieved data
  }

  async pegarAtivPassRes() {
    const colRef = collection(this.fs.db, 'sh_agregados');
    const qs0 = query(
      colRef,

      where('cod', 'in', [900, 901, 905]),
      orderBy('cod', 'asc')
    );
    const qs = await getDocs(qs0);
    let contasData: any[] = [];
    contasData = qs.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return contasData; // Log the retrieved data
  }

  async pegarDespRecTotal() {
    const colRef = collection(this.fs.db, 'sh_agregados');
    const qs0 = query(
      colRef,

      where('cod', 'in', [902, 903]),
      orderBy('cod', 'asc')
    );
    const qs = await getDocs(qs0);
    let contasData: any[] = [];
    contasData = qs.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return contasData; // Log the retrieved data
  }

  async pegarDespEnq() {
    const colRef = collection(this.fs.db, 'sh_agregados');
    const qs0 = query(
      colRef,

      where('cod', 'in', [910, 913, 914, 915, 918, 921, 922, 923, 928, 933]),
      orderBy('ano2025.total', 'desc')
    );
    const qs = await getDocs(qs0);
    let contasData: any[] = [];
    contasData = qs.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return contasData; // Log the retrieved data
  }

  async pegarAtPasEnq() {
    const colRef = collection(this.fs.db, 'sh_agregados');
    const qs0 = query(
      colRef,

      where('cod', 'in', [911, 912, 916, 919, 920, 924, 927]),
      orderBy('cod', 'asc')
    );
    const qs = await getDocs(qs0);
    let contasData: any[] = [];
    contasData = qs.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return contasData; // Log the retrieved data
  }

  async pegarModDesp() {
    const colRef = collection(this.fs.db, 'sh_agregados');
    const qs0 = query(
      colRef,

      where('cod', 'in', [930, 931, 932]),
      orderBy('cod', 'asc')
    );
    const qs = await getDocs(qs0);
    let contasData: any[] = [];
    contasData = qs.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return contasData; // Log the retrieved data
  }

  async pegarParc() {
    let data: any[] = [];
    data = await this.pegarAgreg();
    this.agreg.set(data);
    //console.log(this.agreg());
  }
  async pegarAtivoPas() {
    let data: any[] = [];
    data = await this.pegarAtivPassRes();
    this.agreg.set(data);
    // console.log(this.agreg());
  }

  async pegarDespRec() {
    let data: any[] = [];
    data = await this.pegarDespRecTotal();
    this.agreg.set(data);
    //  console.log(this.agreg());
  }

  async pegarEnq() {
    let data: any[] = [];
    data = await this.pegarDespEnq();
    this.agreg.set(data);
    // console.log(this.agreg());
  }

  async pegarAtPasEnq1() {
    let data: any[] = [];
    data = await this.pegarAtPasEnq();
    this.agreg.set(data);
    // console.log(this.agreg());
  }

  async pegarModDesp1() {
    let data: any[] = [];
    data = await this.pegarModDesp();
    this.agreg.set(data);
    // console.log(this.agreg());
  }

  async atualizarMesAtivoPas() {
    await this.pegarAtivoPas();

    for (let i = 0; i < this.agreg().length; i++) {
      console.log('teste');

      console.log(this.agreg());
      let a = this.hoje;
      let id = this.agreg()[i].id;
      let agreg = this.agreg()[i].agregado;
      let nat = this.agreg()[i].tipo;
      let resp = this.agreg()[i].resp;
      let anoant = this.agreg()[i].fechamento2024;

      let inic = this.cal2025[a].inicio;
      let fim = this.cal2025[a].fim;
      let label = this.cal2025[a].label;
      let inicano = new Date(2025, 0, 1);
      let fimano = new Date(2025, 11, 31);
      //       //let label = this.ts.cal2025[a].label

      let result = await this.saldoporNatureza(
        'contadebitada.natureza',
        'contacreditada.natureza',
        resp,
        inic,
        fim
      );
      let result2 = result + anoant;
      console.log(id, agreg, nat, resp, result2);

      this.atualizarValoresPorMes(id, a, result2);

      if (a > 0) {
        let inic = this.cal2025[a - 1].inicio;
        let fim = this.cal2025[a - 1].fim;
        let result9 = await this.saldoporNatureza(
          'contadebitada.natureza',
          'contacreditada.natureza',
          resp,
          inic,
          fim
        );
        let result10 = result9 + anoant;

        this.atualizarValoresPorMes(id, a - 1, result10);
        console.log('calculo retroativo realizado!');
      }
    }
  }

  async atualizarMesDespRec() {
    await this.pegarDespRec();

    for (let i = 0; i < this.agreg().length; i++) {
      console.log('teste');

      console.log(this.agreg());
      let a = this.hoje;
      let id = this.agreg()[i].id;
      let agreg = this.agreg()[i].agregado;
      let nat = this.agreg()[i].tipo;
      let resp = this.agreg()[i].resp;
      let anoant = this.agreg()[i].fechamento2024;

      let inic = this.ts.caldesp[a].inicio;
      let fim = this.ts.caldesp[a].fim;
      let label = this.cal2025[a].label;
      let inicano = new Date(2025, 0, 1);
      let fimano = new Date(2025, 11, 31);
      //       //let label = this.ts.cal2025[a].label

      let result = await this.saldoporNatureza(
        'contadebitada.natureza',
        'contacreditada.natureza',
        resp,
        inic,
        fim
      );
      let result2 = result + anoant;
      console.log(id, agreg, nat, resp, result2);

      this.atualizarValoresPorMes(id, a, result2);

      if (a > 0) {
        let inic = this.ts.caldesp[a - 1].inicio;
        let fim = this.ts.caldesp[a - 1].fim;
        let result9 = await this.saldoporNatureza(
          'contadebitada.natureza',
          'contacreditada.natureza',
          resp,
          inic,
          fim
        );
        // let result10 = result9 + anoant;

        this.atualizarValoresPorMes(id, a - 1, result9);
        console.log('calculo retroativo realizado!');
      }

      // const docRef = doc(this.fs.db, 'sh_agregados', id);
      // await updateDoc(docRef, {
      //   atualizacao: Timestamp.now(),
      //   'ano2025.mar': result2,
      // });
    }

    //const docRef = doc(this.fs.db, 'update', 'mNdPjeV1ZfEBYen5gew1');
    // await updateDoc(docRef, {
    //  log: Timestamp.now(),
    // });
  }

  async atualizarMesEnquadramento() {
    await this.pegarEnq();

    console.log(this.agreg());

    for (let i = 0; i < this.agreg().length; i++) {
      console.log('teste');

      console.log(this.agreg());
      let a = this.hoje;
      let id = this.agreg()[i].id;
      let agreg = this.agreg()[i].agregado;
      let nat = this.agreg()[i].tipo;
      let resp = this.agreg()[i].resp;
      // let anoant = this.agreg()[i].fechamento2024;

      let inic = this.ts.caldesp[a].inicio;
      let fim = this.ts.caldesp[a].fim;
      let label = this.cal2025[a].label;
      let inicano = new Date(2025, 0, 1);
      let fimano = new Date(2025, 11, 31);
      //       //let label = this.ts.cal2025[a].label

      let result = await this.saldoporNatureza(
        'contadebitada.enquadramento',
        'contacreditada.enquadramento',
        resp,
        inic,
        fim
      );

      console.log(id, agreg, nat, resp, result);

      this.atualizarValoresPorMes(id, a, result);

      if (a > 0) {
        let inic = this.ts.caldesp[a - 1].inicio;
        let fim = this.ts.caldesp[a - 1].fim;
        let result9 = await this.saldoporNatureza(
          'contadebitada.enquadramento',
          'contacreditada.enquadramento',
          resp,
          inic,
          fim
        );

        this.atualizarValoresPorMes(id, a - 1, result9);
        console.log('calculo retroativo realizado!');
      }
    }
  }

  async atualizarMesEnqAtivoPassivo() {
    await this.pegarAtPasEnq1();

    for (let i = 0; i < this.agreg().length; i++) {
      console.log('teste');

      console.log(this.agreg());
      let a = this.hoje;
      let id = this.agreg()[i].id;
      let agreg = this.agreg()[i].agregado;
      let nat = this.agreg()[i].tipo;
      let resp = this.agreg()[i].resp;
      let anoant = this.agreg()[i].fechamento2024;

      let inic = this.ts.caldesp[a].inicio;
      let fim = this.ts.caldesp[a].fim;
      let label = this.cal2025[a].label;
      let inicano = new Date(2025, 0, 1);
      let fimano = new Date(2025, 11, 31);
      //       //let label = this.ts.cal2025[a].label

      let result = await this.saldoporNatureza(
        'contadebitada.enquadramento',
        'contacreditada.enquadramento',
        resp,
        inic,
        fim
      );

      let result2 = result + anoant;
      console.log(id, agreg, nat, resp, result2);

      this.atualizarValoresPorMes(id, a, result2);
    }
  }

  async atualizarMesModDesp() {
    await this.pegarModDesp1();

    for (let i = 0; i < this.agreg().length; i++) {
      console.log('teste');

      console.log(this.agreg());
      let a = this.hoje;
      let id = this.agreg()[i].id;
      let agreg = this.agreg()[i].agregado;
      let nat = this.agreg()[i].tipo;
      let resp = this.agreg()[i].resp;
      // let anoant = this.agreg()[i].fechamento2024;

      let inic = this.ts.caldesp[a].inicio;
      let fim = this.ts.caldesp[a].fim;
      let label = this.cal2025[a].label;
      let inicano = new Date(2025, 0, 1);
      let fimano = new Date(2025, 11, 31);
      //       //let label = this.ts.cal2025[a].label

      let result = await this.saldoporNatureza(
        'contadebitada.mod_despesa',
        'contacreditada.mod_despesa',
        resp,
        inic,
        fim
      );

      console.log(id, agreg, nat, resp, result);

      this.atualizarValoresPorMes(id, a, result);

      if (a > 0) {
        let inic = this.ts.caldesp[a - 1].inicio;
        let fim = this.ts.caldesp[a - 1].fim;
        let result9 = await this.saldoporNatureza(
          'contadebitada.mod_despesa',
          'contacreditada.mod_despesa',
          resp,
          inic,
          fim
        );
        // let result10 = result9 + anoant;

        this.atualizarValoresPorMes(id, a - 1, result9);
        console.log('calculo retroativo realizado!');
      }
    }
  }

  async calcularPAL() {
    let pal = await this.cs.pegarContasModDespesa(
      'enquadramento',
      '==',
      'pal',
      true
    );

    let paltotal = pal.reduce(function (a, b) {
      return a + b.saldo;
    }, 0);

    let coop = await this.cs.getFieldValue(
      'contas2025',
      '68r9EG7FnksvWICxXEiT',
      `saldo`
    );

    let palfinal = this.ts.roundToTwoDecimals(paltotal - coop) * -1;

    console.log('PAL total:', palfinal);
    return palfinal;
  }

  async atualizarPAL() {

    let i = new Date ().getMonth()
    let palfinal = await this.calcularPAL();

    this.atualizarValoresPorMes('wacee4kv8ZhBCPLZQ00R', 12, palfinal);
     this.atualizarValoresPorMes('wacee4kv8ZhBCPLZQ00R', i, palfinal);
  }

  async pegarObj() {
    const colRef = collection(this.fs.db, 'seriestemporais_pass_previ');
    const q = query(colRef, orderBy('reg', 'desc'), limit(1));
    const qs = await getDocs(q);

    let contasData: any[] = qs.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    let obj = contasData[0].objetivo_mes;
    console.log('obj mes:', obj);
    return obj;
  }


  async pegarRealizado() {
    const colRef = collection(this.fs.db, 'seriestemporais_pass_previ');
    const q = query(colRef, orderBy('reg', 'desc'), limit(1));
    const qs = await getDocs(q);

    let contasData: any[] = qs.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    let real = contasData[0].realizado_mes;
        return real;
  }

  async agregAtivoPassivoResultado2026() {
    let i = 0;

    //ativo
    let ativo = await this.saldoporNatureza(
      'contadebitada.natureza',
      'contacreditada.natureza',
      'ativo',
      this.cal2026[i].inicio,
      this.cal2026[i].fim
    );

    let ativoanoant = await this.cs.getFieldValue(
      'sh_agregados',
      'AmWuqcCmRZ3ZzgH7kEbO',
      `fechamento2025`
    );

    console.log(ativo, ativoanoant);

    let ativ = ativo + ativoanoant;

    console.log('ativo 2026:', ativ);

    this.atualizarValoresPorMes('AmWuqcCmRZ3ZzgH7kEbO', i, ativ);
    this.atualizarValoresPorMes('AmWuqcCmRZ3ZzgH7kEbO', 12, ativ);

    //passivo

    let passivo = await this.saldoporNatureza(
      'contadebitada.natureza',
      'contacreditada.natureza',
      'passivo',
      this.cal2026[i].inicio,
      this.cal2026[i].fim
    );

    let passivoanoant = await this.cs.getFieldValue(
      'sh_agregados',
      '0AVwFNrr2L0iAhm5vkSp',
      `fechamento2025`
    );

    console.log(passivo, passivoanoant);

    let passiv = passivo + passivoanoant;

    console.log('passivo 2026:', passiv);

    this.atualizarValoresPorMes('0AVwFNrr2L0iAhm5vkSp', i, passiv);
    this.atualizarValoresPorMes('0AVwFNrr2L0iAhm5vkSp', 12, passiv);

    //resultado

    let resultado = await this.saldoporNatureza(
      'contadebitada.natureza',
      'contacreditada.natureza',
      'resultado',
      this.cal2026[i].inicio,
      this.cal2026[i].fim
    );

    let resultadoanoant = await this.cs.getFieldValue(
      'sh_agregados',
      'Zy0E3sWi0nIsYX3WHGTr',
      `fechamento2025`
    );

    console.log(resultado, resultadoanoant);

    let result = resultado + resultadoanoant;

    console.log('resultado 2026:', result);

    this.atualizarValoresPorMes('Zy0E3sWi0nIsYX3WHGTr', i, result);
    this.atualizarValoresPorMes('Zy0E3sWi0nIsYX3WHGTr', 12, result);
  }
}
