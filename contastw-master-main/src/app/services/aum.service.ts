import { inject, Injectable } from '@angular/core';
import {
  collection,
  orderBy,
  limit,
  getDocs,
  where,
  query,
  doc,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';
import { Agreg2Service } from './agreg2.service';
import { FirestoreService } from './firestore.service';
import { TimestampService } from './timestamp.service';
import { BmarkService } from './bmark.service';
import { RecliquidaService } from './recliquida.service';
import { Contas2Service } from './contas2.service';

@Injectable({
  providedIn: 'root',
})
export class AumService {
  constructor() {
    this.fs.conectar();
  }

  fs = inject(FirestoreService);
  ag2 = inject(Agreg2Service);
  ts = inject(TimestampService);
  bm = inject(BmarkService);
  rl = inject(RecliquidaService);
  cs = inject(Contas2Service);
  ano = new Date().getFullYear();
  mes = new Date().getMonth();
  contasinvest = [175, 178, 5, 180, 6, 7, 8, 179, 202, 200, 208]; //Códigos de contas de investimento
  //invmenos1 = [398917.29]; //saldo de 2025 do agregado investimentos, sem previ
  regid = [
    {
      reg: 0,
      id: 'gm4rxf2cKcY0zfTx3CpS',
    },
    {
      reg: 1,
      id: 'p1QCsDeaz5eYJvIBng67',
    },
    {
      reg: 2,
      id: 'uCi2LbgXzrgQGstjmIxv',
    },
    {
      reg: 3,
      id: 'jytyr6Js1qVnwWUXLPCt',
    },
    {
      reg: 4,
      id: 'yoMbg4ezivEvbdpRJSj9',
    },
    {
      reg: 5,
      id: 'y0JUd2SDNeIylrvJwyiL',
    },
    {
      reg: 6,
      id: 'HYNF1PJampWrUTxTacpR',
    },
    {
      reg: 7,
      id: 'DXIAKF3OGwON7eQCv0Uf',
    },
    {
      reg: 8,
      id: 'StlXhtpuFaoRsbzCStMY',
    },
    {
      reg: 9,
      id: 'oDahGhd3CnntViyt22Bz',
    },
    {
      reg: 10,
      id: 'fzGdqS4fsVsrNARmVHic',
    },
    {
      reg: 11,
      id: 'FTjOr66ZwBsrOwge5doL',
    },
    {
      reg: 12,
      id: 'eNHPrt2kC2wVx7MXTi3x',
    },
    {
      reg: 13,
      id: 'qxzSPo5WcqM6MR5WqVVA',
    },
    {
      reg: 14,
      id: 'jKSqxKov3jyA1EtElvcC',
    },
    {
      reg: 15,
      id: 'DpDtN34KSguBXrlYnLWN',
    },
    {
      reg: 16,
      id: 'wZtCZrKGIpuGD2A4JEdB',
    },
    {
      reg: 17,
      id: 'SLycaH5Yw8SMs3mtD1kZ',
    },
    {
      reg: 18,
      id: 'alBar3SNlo6Z7kDfEgN5',
    },
    {
      reg: 19,
      id: 'Z7nDWuWPD8ttqcsDiTm8',
    },
    {
      reg: 20,
      id: 'nj0mKHlubjs1NhfZNV5N',
    },
    {
      reg: 21,
      id: 'JiXLZY4kjUSiIWTQ4u2n',
    },
    {
      reg: 22,
      id: 'yzu2Wk6DdlDUV0Kl7Bk8',
    },
    {
      reg: 23,
      id: 'X2f8gHIq1OWsrDKP2da2',
    },
    {
      reg: 24,
      id: 'O8XK4nHbhW1Ir6l9Fb4E',
    },
    {
      reg: 25,
      id: 'P2FamWz24UjIlSpMQK6S',
    },
    {
      reg: 26,
      id: 'GAK1gWd52fP79p4rfVr7',
    },
    {
      reg: 27,
      id: 'Mc9OcJmm9bokeznMydfP',
    },
    {
      reg: 28,
      id: 'hmWpCQJgm2bR1U4HZsth',
    },
    {
      reg: 29,
      id: 'XWMNVCFqCsL468W7r9MH',
    },
    {
      reg: 30,
      id: 'gNIB6WVp2CBC413OEwKQ',
    },
    {
      reg: 31,
      id: 'SkRnZu8ZCaBepG3STYzT',
    },
    {
      reg: 32,
      id: 'UUCEvN2n0L4qGWXfZoaS',
    },
    {
      reg: 33,
      id: 'qjMc1QU4kJtPRoi7lKE4',
    },
    {
      reg: 34,
      id: '8JYklB0WkogZtOkl7XLN',
    },
    {
      reg: 35,
      id: 'yas5vzxipbeh4LCfDoI0',
    },
    {
      reg: 36,
      id: 'BuEqh5Oo8tqRLLhiyVfg',
    },
    {
      reg: 37,
      id: 'IxttHirzsVHlhyjdEsRL',
    },
    {
      reg: 38,
      id: 'xhoA8VzZsD9mfnRm648s',
    },
    {
      reg: 39,
      id: 'ElriioD3lCF0inJKApT5',
    },
    {
      reg: 40,
      id: 'Kmq8Hn54AMgy2utA6gdw',
    },
    {
      reg: 41,
      id: 'fZRwtZTsWcyCqMSom3sx',
    },
    {
      reg: 42,
      id: '89NkcfFtjJhOOWOw5z5H',
    },
    {
      reg: 43,
      id: '1zxveCnOBlDvcJk0udRG',
    },
    {
      reg: 44,
      id: 'yeHdoLKjv4ofHuLDxVm8',
    },
    {
      reg: 45,
      id: '9DcHzsaGq3rbrX7dkJIp',
    },
    {
      reg: 46,
      id: '7FT4Y3pvMdCnOKm5HwtQ',
    },
    {
      reg: 47,
      id: 'AywY4JaVxEMw17Bp1q5s',
    },
    {
      reg: 48,
      id: 'ddMbLYkWFcSPxk3Zh09A',
    },
    {
      reg: 49,
      id: '0YPXLSetN2SBJr0ZgGiv',
    },
    {
      reg: 50,
      id: 'vsnoqz9UoLbMmJVegDzh',
    },
    {
      reg: 51,
      id: 'IlpTDGYtlClPN1trV1nx',
    },
    {
      reg: 52,
      id: 'PrM8TJzmQzGTBoVR4cOr',
    },
    {
      reg: 53,
      id: 'y65ovGm08YV4uV5jLTOr',
    },
    {
      reg: 54,
      id: 'dN6Jq4x0hbnG5uHHUT7N',
    },
    {
      reg: 55,
      id: 'X6UEWx5z8oJuHdT7Tciw',
    },
    {
      reg: 56,
      id: 'mUPxHjprlwuHlg3hyg3R',
    },
    {
      reg: 57,
      id: 's7AxVYfGRo2miREUC4X7',
    },
    {
      reg: 58,
      id: 'fyS1YCxEtVrHYJD2Yrc4',
    },
    {
      reg: 59,
      id: 'zmJ38FqETZyHn2OeM4ox',
    },
    {
      reg: 60,
      id: 'QaQ8OZN1qkTJ0JXlJtz8',
    },
    {
      reg: 61,
      id: 'oOUiWWj5XoQBIGyqXIgh',
    },
    {
      reg: 62,
      id: '2sFNfkwQh3S3LnSeQNuH',
    },
    {
      reg: 63,
      id: 'khfTvIhzcSP0Wv8mDCWp',
    },
    {
      reg: 64,
      id: 'DqkUPCm8xaH8JNsT6aPI',
    },
    {
      reg: 65,
      id: 'BoMRZdsYfnasB3fPaTp5',
    },
    {
      reg: 66,
      id: '4afBx7IZglCL1vPnvJ2d',
    },
    {
      reg: 67,
      id: 'VrMCD5D38NqfLeKTbTtp',
    },
    {
      reg: 68,
      id: 'Vs7PjjYB8f2hfdiGJxNH',
    },
    {
      reg: 69,
      id: 'dop8VaZaF67PJRAWRMoU',
    },
    {
      reg: 70,
      id: 'hXOn6fyOn7yliWY8R94i',
    },
    {
      reg: 71,
      id: '9iVawgW3YcUVdH7QG6mP',
    },
    {
      reg: 72,
      id: 'xcvLXaZ9pslfiukDFP3s',
    },
    {
      reg: 73,
      id: '9P9e6eoBmFof0cR98mpr',
    },
    {
      reg: 74,
      id: 'LicYfEcdGrtEsuXCT4PU',
    },
    {
      reg: 75,
      id: 'tZzpGp1Wwmd0dllty11I',
    },
    {
      reg: 76,
      id: 'TwQHmyp3cOp9A3sOyoJv',
    },
    {
      reg: 77,
      id: 'lO8NzBE4z7KTgQwTocaU',
    },
    {
      reg: 78,
      id: '3Ef8ueSAKhs5GvdmDBfO',
    },
    {
      reg: 79,
      id: '97scfvcERhw5XuDbuqzm',
    },
    {
      reg: 80,
      id: 'PQA9TfWEZrJZqm2E6MFP',
    },
    {
      reg: 81,
      id: 'SyLIGxEaVEr3UrlBs4Vc',
    },
    {
      reg: 82,
      id: 'QNuXrTrWUhFyJ1MY7U7K',
    },
    {
      reg: 83,
      id: 'NWfTyUBfwATkKNn155EJ',
    },
    {
      reg: 84,
      id: 'zwaIyVHyTlawqfQYh1r8',
    },
    {
      reg: 85,
      id: 'bfpp1VubGKEbbSTqTd6D',
    },
    {
      reg: 86,
      id: 'hG6g9kxjlTpHbu7BeKE6',
    },
    {
      reg: 87,
      id: '94KC8UwfJYDQUIFaGlU0',
    },
    {
      reg: 88,
      id: 'k7gYjzl59Qxd2LHgCM9o',
    },
    {
      reg: 89,
      id: 'QdLdRGP5glzOHBCLMspf',
    },
    {
      reg: 90,
      id: 'Ac9vZ45VFU5SGwQRCTzm',
    },
    {
      reg: 91,
      id: 'TtfVme7KBGstfis9bxkS',
    },
    {
      reg: 92,
      id: 'JHcTmpNRaxdWsnRemA7d',
    },
    {
      reg: 93,
      id: 'BbvE9xCMS8VQRvvsv4s1',
    },
    {
      reg: 94,
      id: 'wWJabcLRlzHaKZqCkzBj',
    },
    {
      reg: 95,
      id: 'VPds2YlbvLaJwUt5SDfI',
    },
    {
      reg: 96,
      id: '1eqscV1kxaR78n3aZtL7',
    },
    {
      reg: 97,
      id: 'vH6ZEiGeKx6lL6L0K01g',
    },
    {
      reg: 98,
      id: 'Vrq1zL4EBWaIPXWflLBO',
    },
    {
      reg: 99,
      id: 'Oa1abFVd9dK8mGNreGsy',
    },
  ];

  //Atualizar agregado AUM

  async atualizarBDAUMAgregado() {
    let aum = await this.pegarAUM();
    console.log('passo1:' + aum);
    let diff = await this.ts.difAposentadoria();

    console.log('passo2' + diff);

    let referencia = 100 - diff;
    let bmaposent0 =
      Math.round((await this.bm.getBmark('Mlb5v3nyBxYFS3xdWlQU')) * 100) / 100;
    console.log('passo3:' + bmaposent0);

    let bmaposent = bmaposent0 - aum;
    console.log('passo4:' + bmaposent);
    await this.ag2.atualizarValoresPorMes(
      'K5eDh0H5pIiTc9s6W9zy',
      this.mes,
      aum,
    );

    await this.gravarSimulacaoAposentadoria50ou55();
    // await this.ag2.atualizarValoresPorMes('K5eDh0H5pIiTc9s6W9zy', 12, aum);

    //return [reg, sf, mes];

    if (this.mes != 0) {
      let aum = await this.pegarAUM();
      let aum0 = await this.pegarAUMmesAnterior(this.ano, this.mes - 1);
      console.log('passo5:' + aum0);

      await this.ag2.atualizarValoresPorMes(
        'K5eDh0H5pIiTc9s6W9zy',
        this.mes - 1,
        aum0,
      );
      console.log('AUM atualizado no agregado total');

      // atualizando serie temporal aposentadoria 2034 M e M-1
      let staps = await this.pegarQualquerMesSHAPOSENTporData(
        new Date(this.ano, this.mes, 1),
      );
      console.log(staps);
      let staps0 = await this.pegarQualquerMesSHAPOSENTporData(
        new Date(this.ano, this.mes - 1, 1),
      );
      console.log(staps0);

      let id = staps[0].id;
      let id0 = staps0[0].id;
      let reg = staps0[0].reg - 1;

      let regant = await this.pegarAposentporReg(reg);
      console.log('importante regant:', regant);

      let aum0ant = regant[0].aum_mes;
      let aumY = staps0[0].aum_mes;

      let diffant = aumY - aum0ant;

      let mm = await this.rl.mediamovel();
      let ev = aum - aum0;
      console.log('ev:' + ev);

      await this.lancarM(id, aum, bmaposent0, bmaposent, diff, ev);
      await this.lancarM1(id0, aum0, mm, diffant);
      await this.ag2.atualizarValoresPorMes(
        'K5eDh0H5pIiTc9s6W9zy',
        this.mes - 1,
        aum0,
      );
    } else {
      let aum = await this.pegarAUM();
      let aum0 = await this.pegarAUMmesAnterior(this.ano - 1, 11);
      console.log('modo jan 1 :' + aum0);
      let staps = await this.pegarQualquerMesSHAPOSENTporData(
        new Date(this.ano, this.mes, 1),
      );
      console.log(staps);
      let staps0 = await this.pegarQualquerMesSHAPOSENTporData(
        new Date(this.ano - 1, 11, 1),
      );
      console.log(staps0);

      let id = staps[0].id;
      let id0 = staps0[0].id;
      let reg = staps0[0].reg - 1;

      let regant = await this.pegarAposentporReg(reg);
      console.log('importante regant:', regant);

      let aum0ant = regant[0].aum_mes;
      let aumY = staps0[0].aum_mes;

      let diffant = aumY - aum0ant;

      let mm = await this.rl.mediamovel();
      let ev = aum - aum0;
      console.log('ev:' + ev);

      await this.lancarM(id, aum, bmaposent0, bmaposent, diff, ev);
      await this.lancarM1(id0, aum0, mm, diffant);
    }
    // console.log(
    //   'AUM atualizado em M e M-1 na série temporal aposentadoria 2034'
    // );
    console.log('capitalizando AUM futuro...  ');

    for (let i = referencia + 1; i <= 99; i++) {
      let id0 = await this.pegarAposentporReg(i);
      let id = id0[0].id;
      this.lancarfuturos(aum, bmaposent0, i, referencia, id);
      // console.log(
      //   'AUM atualizado em M+1 a M+N na série temporal aposentadoria 2034'
      // );
    }
  }

  async lancarM(id, aum, bmaposent0, bmaposent, ref, ev) {
    let rp = await this.rendaPassiva();
    let rl = await this.rl.recliquidamensal(12);
    console.log('recliquida anual: ' + rl);
    let rlmedio = (rl / (this.mes + 1)) * -1;
    console.log('recliquida media mensal: ' + rlmedio);

    const docRef = doc(this.fs.db, 'seriestemporais_aposent', id);
    await updateDoc(docRef, {
      atualizacao: Timestamp.now(),
      rendapassivamensal: rp,
      renda_alvo: Math.round((bmaposent0 * 0.8) / 100),
      aum_mes: aum,
      rl_mm: null,
      alvo: bmaposent0,
      objetivo_mes: Math.round((bmaposent / ref) * 100) / 100,
      // realizado_mes: Math.round((await this.bm.evolucaoAUM()) * 100) / 100,
      realizado_mes: Math.round(ev * 100) / 100,
    });
  }

  async lancarM1(id, aummenos1, mm, diffant) {
    const docRef2 = doc(this.fs.db, 'seriestemporais_aposent', id);
    await updateDoc(docRef2, {
      //alvo: Math.round(aum * 100) / 100,
      rl_mm: mm,
      atualizacao: Timestamp.now(),
      aum_mes: aummenos1,
      //  objetivo_mes: Math.round((bmaposent / (100 - ref - 1)) * 100) / 100,
      realizado_mes: this.ts.roundToNDecimals(diffant, 2),
    });
  }

  async lancarfuturos(aum, bmaposent0, reg, referencia, id) {
    // let rp = await this.rendaPassiva();
    let proj0 = await this.calcularJurosCompostos(aum, 0.8, reg - referencia);
    let proj = Math.round(proj0 * 100) / 100;
    const docRef3 = doc(this.fs.db, 'seriestemporais_aposent', id);
    await updateDoc(docRef3, {
      atualizacao: Timestamp.now(),
      rendapassivamensal: null,
      aum_mes: proj,
      renda_alvo: null,
      rl_mm: null,
      alvo: Math.round(bmaposent0 * 100) / 100,
      objetivo_mes: null,
      realizado_mes: null,
    });
  }

  async gravarSimulacaoAposentadoria50ou55() {
    let previ = await this.pegarUltimoMesPrevi();
    console.log('previ:', previ[1]);
    let previ50 = this.ts.roundToTwoDecimals((previ[1] * 0.52) / 100);
    console.log('previ50:', previ50);
    let previ55 = this.ts.roundToTwoDecimals((previ[1] * 0.83) / 100);
    console.log('previ55:', previ55);

    for (let i = 0; i < 37; i++) {
      let id = this.regid[i].id;
      const docRef0 = doc(this.fs.db, 'seriestemporais_aposent', id);
      await updateDoc(docRef0, {
        pensao_previ: null,
      });
    }

    for (let i = 37; i < 97; i++) {
      let id = this.regid[i].id;
      const docRef = doc(this.fs.db, 'seriestemporais_aposent', id);
      await updateDoc(docRef, {
        pensao_previ: previ50,
      });
    }

    for (let i = 97; i < 100; i++) {
      let id = this.regid[i].id;
      const docRef = doc(this.fs.db, 'seriestemporais_aposent', id);
      await updateDoc(docRef, {
        pensao_previ: previ55,
      });
    }
  }
  //pegar AUM ONLINE ----->>> atualizando tbm o sh_agregados TOTAL do ano
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

  // async pegarAUM() {
  //   let sf0 = await this.pegarUltimoMesPrevi();
  //   let sf = Math.round(sf0[1] * 0.9 * 100) / 100;
  //   //  console.log(sf);
  //   let mes = sf0[2].toDate().getMonth();
  //   //console.log(mes);
  //   const colRef = collection(this.fs.db, 'contas2025');
  //   const q = query(colRef, where('cod', 'in', this.contasinvest));
  //   const qs = await getDocs(q);
  //   let contasData: any[] = [];
  //   contasData = qs.docs.map((doc) => ({
  //     id: doc.id,
  //     ...doc.data(),
  //   }));

  //   const inv = contasData.reduce(function (a, b) {
  //     return a + b.saldo;
  //   }, 0);

  //   let aum0 = sf + inv;
  //   let aum = Math.round(aum0 * 100) / 100;

  //   return aum;
  // }

  async pegarQualquerMesPrevi(reg) {
    const colRef = collection(this.fs.db, 'previ');
    const q = query(colRef, where('reg', '==', reg));
    const qs = await getDocs(q);
    let contasData: any[] = [];
    contasData = qs.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    ('');
    let sf = Math.round(contasData[0].saldo_final * 0.9 * 100) / 100;

    return sf;
  }

  async pegarQualquerMesPreviporData(data) {
    const colRef = collection(this.fs.db, 'previ');
    const q = query(colRef, where('mes', '==', data));
    const qs = await getDocs(q);
    let contasData: any[] = [];
    contasData = qs.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    let sf = Math.round(contasData[0].saldo_final * 0.9 * 100) / 100;

    return sf;
  }

  async pegarQualquerMesSHAPOSENTporData(data) {
    const colRef = collection(this.fs.db, 'seriestemporais_aposent');
    const q = query(colRef, where('mes', '==', data));
    const qs = await getDocs(q);
    let contasData: any[] = [];
    contasData = qs.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return contasData;
  }

  async pegarQualquerMesSHAPOSENTporReg(reg) {
    const colRef = collection(this.fs.db, 'seriestemporais_aposent');
    const q = query(colRef, where('reg', '==', reg));
    const qs = await getDocs(q);
    let contasData: any[] = [];
    contasData = qs.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return contasData;
  }

  //AUM do mês anterior
  //return [reg, sf, mes];
  async pegarAUMmesAnterior(ano, mes) {
    let aummenosum = await this.pegarQualquerMesPreviporData(
      new Date(ano, mes, 1),
    );
    console.log('passo6' + aummenosum);

    let investimento = await this.pegarInvMesAnterior(mes);
    console.log('passo7' + investimento);

    let aumX = aummenosum + investimento;
    console.log('passo8' + aumX);

    //  await this.ag2.atualizarValoresPorMes('K5eDh0H5pIiTc9s6W9zy', mes, aum);
    return aumX;
  }

  async pegarInvMesAnterior(mes) {
    let anoanterior = await this.invest();

    let invmen: any[] = [];

    for (let i = 0; i < this.contasinvest.length; i++) {
      let inv = await this.ag2.saldoporNatureza(
        'contadebitada.cod',
        'contacreditada.cod',
        this.contasinvest[i],
        this.ts.calendar[mes].inicio,
        this.ts.calendar[mes].fim,
      );
      invmen.push(inv);
      //console.log("passo 9 invmneos um"+ this.contasinvest[i] + " = " + inv);
    }
    //  console.log(this.invmenos1);
    let totalinv0 = invmen.reduce((a, b) => a + b, 0);
    let totalinv = totalinv0 + anoanterior;
    console.log(totalinv);
    return totalinv;
  }

  async rendaPassiva() {
    let previ = await this.pegarUltimoMesPrevi();
    let previBB = (previ[1] / 2) * 0.8;
    let previBB0 = Math.round(previBB * 100) / 100;
    //  objetivo_mes: Math.round((bmaposent / (100 - ref - 1)) * 100) / 100,
    let esprevi: number = await this.ag2.getNestedFieldValueClient(
      'contas2025',
      'N2Owfj9S7NcgFZtwrr5F',
      'saldo',
    );
    let esprevi0 = Math.round(esprevi * 100) / 100;
    let previ13: number = await this.ag2.getNestedFieldValueClient(
      'contas2025',
      'vJC2pmKST51ZHGXvaKRt',
      'saldo',
    );
    let previ130 = Math.round(previ13 * 100) / 100;
    let totalprevi = (esprevi0 + previ130) * -1;

    let sdoBBpreviliq = previBB0 - totalprevi;

    let ir = ((previ[1] / 2 + sdoBBpreviliq) * 17.5) / 100;
    let ir0 = Math.round(ir * 100) / 100;

    let aum = await this.pegarAUM();
    console.log(aum);

    //let sdofinal = (previ[1]/2) + sdoBBpreviliq - ir0;

    let rp0 = aum - totalprevi - ir0;
    let rp1 = (rp0 * 0.8) / 100;
    let rp = Math.round(rp1 * 100) / 100;

    const docRef = doc(this.fs.db, 'bmark', 'pl6foBoWe2qiRvqInmWs');
    await updateDoc(docRef, {
      alvo: rp,
      atualizacao: Timestamp.now(),
    });

    //console.log(rp);
    return rp;
  }

  async calcularJurosCompostos(
    aum: number,
    taxa: number,
    i: number,
  ): Promise<number> {
    const fator = 1 + taxa / 100;
    return aum * Math.pow(fator, i);
  }

  async pegarAposent() {
    const colRef = collection(this.fs.db, 'seriestemporais_aposent');
    const q = query(colRef, orderBy('reg', 'asc'));
    const qs = await getDocs(q);
    let aposentData: any[] = [];
    aposentData = qs.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return aposentData;
  }

  async pegarAposentporReg(reg) {
    const colRef = collection(this.fs.db, 'seriestemporais_aposent');
    const q = query(colRef, where('reg', '==', reg));
    const qs = await getDocs(q);
    let aposentData: any[] = [];
    aposentData = qs.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return aposentData;
  }

  async pegarRendaAlvo() {
    let bmaposent0 =
      Math.round((await this.bm.getBmark('Mlb5v3nyBxYFS3xdWlQU')) * 100) / 100;

    let rendaalvo = Math.round((bmaposent0 * 0.8) / 100);
    return rendaalvo;
  }

  async pegarIndicesEconomicos() {
    const colRef = collection(this.fs.db, 'indices_economicos');
    const q = query(colRef, orderBy('reg', 'asc'));
    const qs = await getDocs(q);
    let indicesData: any[] = [];
    indicesData = qs.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    console.log(indicesData);
    return indicesData;
  }

  async pegarAUM() {
    let previ = await this.cs.getFieldValue(
      'contas2025',
      'vvcdWNT2lLjUhWOWxFq5',
      'saldo',
    );
    //console.log(previ);

    let sdo = await this.pegarUltimoMesPrevi();
    let sdo1 = sdo[1] * 0.9;
    //console.log(sdo1);

    let inv: any[] = [];
    inv = await this.cs.pegarContasNatureza(
      'enquadramento',
      '==',
      'investimento',
      true,
    );

    //console.log(inv)
    let invtotal = inv.reduce(function (a, b) {
      return a + b.saldo;
    }, 0);

    // console.log(invtotal);
    // return invtotal;

    let aum0 = invtotal - previ;
    //console.log(aum0);

    let aum = this.ts.roundToTwoDecimals(aum0 + sdo1);
    console.log(aum);

    return aum;
  }

  async invest() {
    let contasinvest = await this.pegarTodasContas([
      175, 178, 5, 180, 6, 7, 8, 179, 202, 200,
    ]);

    console.log(contasinvest);

    let ano = new Date().getFullYear();

    let campoMes = `fechamento${ano - 1}`;
    console.log(campoMes);

    let res: any[] = [];

    for (let i = 0; i < contasinvest.length; i++) {
      let fonte = contasinvest[i][campoMes];
      // console.log('Fonte:', fonte);
      res.push(fonte);
    }

    let totalinv = res.reduce((a, b) => a + b, 0);
    // console.log('Total Investimentos:', totalinv);
    return totalinv;
  }

  async pegarTodasContas(cod) {
    const colRef = collection(this.fs.db, 'contas2025');
    const q = query(colRef, where('cod', 'in', cod), orderBy('conta', 'asc'));

    const qs = await getDocs(q);

    let contasData: any[] = [];
    contasData = qs.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return contasData; // Log the retrieved data
  }
}
