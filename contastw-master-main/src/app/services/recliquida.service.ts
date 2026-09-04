import { Injectable, inject } from '@angular/core';
import { Agreg2Service } from './agreg2.service';
import { FirestoreService } from './firestore.service';
import { TimestampService } from './timestamp.service';
import { BmarkService } from './bmark.service';
import { Contas2Service } from './contas2.service';
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
  where,
} from 'firebase/firestore';

@Injectable({
  providedIn: 'root',
})
export class RecliquidaService {
  fs = inject(FirestoreService);
  ag2 = inject(Agreg2Service);
  ts = inject(TimestampService);
  bm = inject(BmarkService);
  ano = new Date().getFullYear();
  mes = new Date().getMonth();
  cs = inject(Contas2Service);
  parsedData: any[] = [];
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
    'total',
  ];

  constructor() {
    this.fs.conectar();
  }

  //calcular a rec liquida
  async recliquidamensal(mes) {
    const campoMes = `ano${this.ano}.${this.mesesCampos[mes]}`;

    let receitatotal0: number = await this.ag2.getNestedFieldValueClient(
      'sh_agregados',
      'TQxibYZpx7k7CbSz7DGg',
      campoMes
    );

    let receitatotal = Math.abs(Math.round(receitatotal0 * 100) / 100);
    console.log('receitatotal', receitatotal);

    let fopagsmensais0: number = await this.ag2.getNestedFieldValueClient(
      'sh_agregados',
      'XgugZKlPuhn8QNvLToMB',
      campoMes
    );
    let fopagsmensais = Math.abs(Math.round(fopagsmensais0 * 100) / 100);
    console.log('fopagsmensais', fopagsmensais);

    let recliquida0 = (receitatotal - fopagsmensais) * -1;
    let recliquida = Math.round(recliquida0 * 100) / 100;
    //console.log("recliquidamesal", recliquidaanual)
    console.log(recliquida);
    return recliquida;
  }

  async atualizarRecLiq(mes) {
    let rec = await this.recliquidamensal(mes);

    const docRef = doc(this.fs.db, 'sh_agregados', '7yLtE9Loqo2Q416w9ndK');
    await updateDoc(docRef, {
      [`ano${this.ano}.${this.mesesCampos[mes]}`]: rec,
      atualizacao: Timestamp.now(),
    });
  }

  async mediamovel() {
    let diff0 = this.ts.dateToFirebaseTimestamp(new Date(2024, 0, 1));
    let indice = this.ts.calcularDiferencaMeses(diff0) * -1;

    let mm: any[] = [];

    for (let i = indice; i > indice - 12; i--) {
      let rl = await this.pegarMM(i);
      // console.log(rl)
      mm.push(rl);
    }
    let soma = mm.reduce((a, b) => a + b, 0);
    let media = this.ts.roundToTwoDecimals(soma / 12);
    console.log('média móvel:', media);

    const docRef = doc(this.fs.db, 'bmark', 'bpLq5M1AF3l9OwLcWt3C');
    await updateDoc(docRef, {
      alvo: media,
      atualizacao: Timestamp.now(),
    });
    return media;
  }

  async pegarMM(reg) {
    const colRef = collection(this.fs.db, 'sh_rl');
    const q = query(colRef, where('reg', '==', reg));
    const qs = await getDocs(q);
    let aposentData: any[] = [];
    aposentData = qs.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    // console.log(aposentData);
    let rl = aposentData[0].rl;
    // console.log(rl)

    // let rl = 0
    //aposentData[0].rl;
    return rl;
  }

  async atualizarSH_RL(rl) {
    //  console.log('Mes e RL recebidos:', mes, rl);

    //let fim = Date.now()
    let inicio = Timestamp.fromDate(new Date(2023, 11, 1));
    console.log(inicio);
    let diff0 = this.ts.calcularDiferencaMeses(inicio) * -1;
    let diff = diff0 - 1;

    console.log(diff);

    // Garantir que a data está correta (ano atual, mês correto, primeiro dia)
    //let data0 = new Date(this.ano, mes, 1);
    // Zerar hora/minuto/segundo para evitar problemas de comparação
    //data0.setHours(0, 0, 0, 0);

    //let data = Timestamp.fromDate(data0);
    //console.log('Data para busca:', data0, 'Timestamp:', data);

    // Verificar se existe documento
    let shrlmmenosum = await this.pegarQualquerMesSH_RL(diff);

    // if (!shrlmmenosum || shrlmmenosum.length === 0) {
    //     console.log('Nenhum documento encontrado para o mês', mes);
    //     // Criar novo documento se não existir
    //     await addDoc(collection(this.fs.db, 'sh_rl'), {
    //         mes: data,
    //         rl: rl,
    //         atualizacao: Timestamp.now()
    //     });
    //     return;

    // Atualizar documento existente
    let id = shrlmmenosum[0].id;
    console.log(id);
    const docRef = doc(this.fs.db, 'sh_rl', id);
    await updateDoc(docRef, {
      rl: rl,
      atualizacao: Timestamp.now(),
    });
  }

  async pegarQualquerMesSH_RL(reg) {
    const colRef = collection(this.fs.db, 'sh_rl');
    const q = query(colRef, where('reg', '==', reg));
    const qs = await getDocs(q);
    let contasData: any[] = [];
    contasData = qs.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    console.log(contasData);
    return contasData;
  }
}
