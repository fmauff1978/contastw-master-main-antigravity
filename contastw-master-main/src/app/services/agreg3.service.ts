import { inject, Injectable } from '@angular/core';
import {
  collection,
  where,
  orderBy,
  getDocs,
  query,
  doc,
  Timestamp,
  updateDoc,
  DocumentSnapshot,
  FieldPath,
  getDoc,
} from 'firebase/firestore';
import { FirestoreService } from './firestore.service';
import { TimestampService } from './timestamp.service';
import { RecliquidaService } from './recliquida.service';
import { Contas2Service } from './contas2.service';

@Injectable({
  providedIn: 'root',
})
export class Agreg3Service {
  fs = inject(FirestoreService);
  ts = inject(TimestampService);
  rl = inject(RecliquidaService);
  cs = inject(Contas2Service);

  hoje = new Date();
  mes = this.hoje.getMonth(); //0 a 11
  ano = this.hoje.getFullYear();
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

  constructor() {}

  //ATIVO PASSIVO RESULTADO

  async calcularAgregAtivoPassivoResultado() {
    await this.calcularAtivPasRes(
      'cod',
      'in',
      [900, 901, 905],
      'contadebitada.natureza',
      'contacreditada.natureza',
      this.ts.standardCalendarAtivoPassivoResultado,
    );
  }

  //PAL

  async calcularpal() {
    await this.atualizarPAL();
  }

  //DESPESA E RECEITA TOTAIS

  async calcularDespReceitaTotais() {
    await this.calcularDespReceita(
      'cod',
      'in',
      [902, 903],
      'contadebitada.natureza',
      'contacreditada.natureza',
      this.ts.standardCalendarDespesaReceita,
    );
  }

  //DESPESA LIQUIDA

  async calcularDespesaLiquida() {
    await this.calcularDespReceita(
      'cod',
      'in',
      [930, 931],
      'contadebitada.mod_despesa',
      'contacreditada.mod_despesa',
      this.ts.standardCalendarDespesaReceita,
    );

    let campoMes = `ano${this.ano}.${this.mesesCampos[this.mes]}`;
    let comp: number = await this.getNestedFieldValueClient(
      'sh_agregados',
      'RON4QGNrj8ZykZrQJSuU',
      campoMes,
    );
    console.log('compromissada' + comp);
    let ger: number = await this.getNestedFieldValueClient(
      'sh_agregados',
      'v9cgg3wHHiVAgkuqlbvc',
      campoMes,
    );
    console.log('gerenci' + ger);
    let despliquida: number = this.ts.roundToTwoDecimals(comp + ger);

    console.log('despliq' + despliquida);

    this.atualizarValoresPorMes('BB9Wo3WLdeFanctk8fYH', this.mes, despliquida);

    if (this.mes > 0) {
      let campoMes0 = `ano${this.ano}.${this.mesesCampos[this.mes - 1]}`;
      let comp0: number = await this.getNestedFieldValueClient(
        'sh_agregados',
        'RON4QGNrj8ZykZrQJSuU',
        campoMes0,
      );
      console.log(comp0);
      let ger0: number = await this.getNestedFieldValueClient(
        'sh_agregados',
        'v9cgg3wHHiVAgkuqlbvc',
        campoMes0,
      );
      console.log(ger0);
      let despliquida0: number = this.ts.roundToTwoDecimals(comp0 + ger0);

      console.log(despliquida0);

      this.atualizarValoresPorMes(
        'BB9Wo3WLdeFanctk8fYH',
        this.mes - 1,
        despliquida0,
      );
    }
  }

  //RECEITA LIQUIDA
  async Recliquida() {
    await this.rl.atualizarRecLiq(this.mes);
    await this.rl.atualizarRecLiq(12);
    // let rl = await this.rl.recliquidamensal(this.mes);
    // console.log('Recliquida mensal:', rl);

    //    await this.rl.atualizarSH_RL(rl)

    // const i = this.mes
    // const mes = this.mesesCampos[i]

    // const docRef = doc(this.fs.db, 'seriestemporais_recliq', 'QRfTAiEO73i7BBs4psBC');
    // await updateDoc(docRef, { [`${mes}`]: rl*(-1), atualizacao: Timestamp.now() });
    // console.log('SH RL atualizado no series temporais recliq e no sh_rl');

    if (this.mes > 0) {
      await this.rl.atualizarRecLiq(this.mes - 1);
      let rec = (await this.rl.recliquidamensal(this.mes - 1)) * -1;
      await this.rl.atualizarSH_RL(rec);
    }
  }

  //SUPERAVIT LIQUIDO

  async superliquido() {
    //------------------> mes atual
    let campoMes = `ano${this.ano}.${this.mesesCampos[this.mes]}`;
    let rec: number = await this.getNestedFieldValueClient(
      'sh_agregados',
      '7yLtE9Loqo2Q416w9ndK',
      campoMes,
    );
    // console.log(comp);
    let desp: number = await this.getNestedFieldValueClient(
      'sh_agregados',
      'BB9Wo3WLdeFanctk8fYH',
      campoMes,
    );

    let superliquido: number = this.ts.roundToTwoDecimals(-1 * rec - desp);

    this.atualizarValoresPorMes('WdtS8S1jtIhQ2aoUloA8', this.mes, superliquido);

    //------------------> mes total
    let campoMes12 = `ano${this.ano}.${this.mesesCampos[12]}`;
    let rect: number = await this.getNestedFieldValueClient(
      'sh_agregados',
      '7yLtE9Loqo2Q416w9ndK',
      campoMes12,
    );
    // console.log(comp);
    let despt: number = await this.getNestedFieldValueClient(
      'sh_agregados',
      'BB9Wo3WLdeFanctk8fYH',
      campoMes12,
    );

    let superliquidoT: number = this.ts.roundToTwoDecimals(-1 * rect - despt);

    this.atualizarValoresPorMes('WdtS8S1jtIhQ2aoUloA8', 12, superliquidoT);

    //------------------> mes anterior
    if (this.mes > 0) {
      let campoMes0 = `ano${this.ano}.${this.mesesCampos[this.mes - 1]}`;
      let comp0: number = await this.getNestedFieldValueClient(
        'sh_agregados',
        '7yLtE9Loqo2Q416w9ndK',
        campoMes0,
      );
      // console.log(comp);
      let ger0: number = await this.getNestedFieldValueClient(
        'sh_agregados',
        'v9cgg3wHHiVAgkuqlbvc',
        campoMes0,
      );

      let superliquido0: number = this.ts.roundToTwoDecimals(-1 * comp0 - ger0);
      this.atualizarValoresPorMes(
        'WdtS8S1jtIhQ2aoUloA8',
        this.mes - 1,
        superliquido0,
      );
    }
  }

  //DESPESAS ENQUADRAMENTO
  async calcularDespEnq() {
    await this.calcularDespReceita(
      'cod',
      'in',
      [910, 913, 914, 915, 918, 921, 922, 923, 928],
      'contadebitada.enquadramento',
      'contacreditada.enquadramento',
      this.ts.standardCalendarDespesaReceita,
    );

    await this.calcularDespReceitaTotalAno(
      'cod',
      'in',
      [910, 913, 914, 915, 918, 921, 922, 923, 928],
      'contadebitada.enquadramento',
      'contacreditada.enquadramento',
    );
  }

  //DFO

  async calcDFO() {
    await this.calcularDFOAgreg();
  }


  //PROJECOES

  async calcularProjecoes(id1: string,id2: string) {

    let res : number;
  
   res = (await this.getNestedFieldValueClient<number>("sh_agregados", id1, `ano${this.ano}.${this.mesesCampos[12]}`)) ?? 0;
    console.log("despesa total", res);

    if (res<0){

      res = res * -1; 
    }

    let dd = await this.ts.diasDecorridos();
    console.log("dias decorridos", dd);

    let range = res/dd;
    console.log("range", range);

    let proj = range * 365;
    console.log("projecao", proj);

    let proj2 = this.ts.roundToTwoDecimals(proj);

console.log("projecao arredondada", proj2);

await this.atualizarValoresPorMes(id2, this.mes, proj2);
await this.atualizarValoresPorMes(id2, 12, proj2);



  }




  //************************FUNCOES SUPORTE  ************************************

  async pegarShAgreg(a, b, c) {
    const colRef = collection(this.fs.db, 'sh_agregados');
    const qs0 = query(colRef, where(a, b, c), orderBy('cod', 'asc'));
    const qs = await getDocs(qs0);
    let contasData: any[] = [];
    contasData = qs.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return contasData; // Log the retrieved data
  }

  async calcularAtivPasRes(a, b, c, d, e, f) {
    let fonte = await this.pegarShAgreg(a, b, c);
    //console.log(fonte);

    for (let i = 0; i < fonte.length; i++) {
      let mes = this.mes;
      let id = fonte[i].id;
      let agreg = fonte[i].agregado;
      let resp = fonte[i].resp;
      let anoant = fonte[i][`fechamento${this.ano - 1}`];
      let inicio = f[mes].inicio;
      let fim = f[mes].fim;

      let saldo0 = await this.saldoporNatureza(d, e, resp, inicio, fim);
      let res = this.ts.roundToTwoDecimals(saldo0 + anoant);
      console.log(resp, anoant, saldo0, res);
      this.atualizarValoresPorMes(id, mes, res);
      console.log('atualizou', id, agreg, mes, res);

      if (mes > 0) {
        let inic = f[mes - 1].inicio;
        let fim = f[mes - 1].fim;
        let result9 = await this.saldoporNatureza(d, e, resp, inic, fim);
        let result10 = this.ts.roundToTwoDecimals(result9 + anoant);

        this.atualizarValoresPorMes(id, mes - 1, result10);
      }
    }
  }

  async calcularDespReceita(a, b, c, d, e, f) {
    let fonte = await this.pegarShAgreg(a, b, c);
    //console.log(fonte);

    for (let i = 0; i < fonte.length; i++) {
      let mes = this.mes;
      let id = fonte[i].id;

      let resp = fonte[i].resp;
      //let anoant = fonte[i][`fechamento${this.ano - 1}`];
      let inicio = f[mes].inicio;
      let fim = f[mes].fim;

      let saldo0 = await this.saldoporNatureza(d, e, resp, inicio, fim);
      let res = this.ts.roundToTwoDecimals(saldo0);
      //console.log(res);
      this.atualizarValoresPorMes(id, mes, res);

      if (mes > 0) {
        let inic = f[mes - 1].inicio;
        let fim = f[mes - 1].fim;
        let result9 = await this.saldoporNatureza(d, e, resp, inic, fim);
        let result10 = this.ts.roundToTwoDecimals(result9);

        this.atualizarValoresPorMes(id, mes - 1, result10);
      }
    }
  }

  async calcularDFOAgreg() {
    let fonte = [37, 32, 39, 40, 35];
    const dfo: number[] = [];

    for (let i = 0; i < fonte.length; i++) {
      let mes = this.mes;
      let cod = fonte[i];

      //  let resp = fonte[i].resp;
      //let anoant = fonte[i][`fechamento${this.ano - 1}`];
      let inicio = this.ts.standardCalendarDespesaReceita[mes].inicio;
      let fim = this.ts.standardCalendarDespesaReceita[mes].fim;

      let saldo0 = await this.saldoporNatureza(
        'contadebitada.cod',
        'contacreditada.cod',
        cod,
        inicio,
        fim,
      );
      let res = this.ts.roundToTwoDecimals(saldo0);

      dfo.push(res);
    }

    const total = dfo.length
      ? this.ts.roundToTwoDecimals(dfo.reduce((acc, n) => acc + n, 0))
      : 0;

    this.atualizarValoresPorMes('dBhgmT8mW1aPtj12tZQc', this.mes, total);

    if (this.mes > 0) {
      let fonte0 = [37, 32, 39, 40, 35];
      const dfo0: number[] = [];

      for (let i = 0; i < fonte0.length; i++) {
        let mes0 = this.mes - 1;
        let cod0 = fonte0[i];

        
        let inicio = this.ts.standardCalendarDespesaReceita[mes0].inicio;
        let fim = this.ts.standardCalendarDespesaReceita[mes0].fim;

        let saldo00 = await this.saldoporNatureza(
          'contadebitada.cod',
          'contacreditada.cod',
          cod0,
          inicio,
          fim,
        );
        let res0 = this.ts.roundToTwoDecimals(saldo00);

        dfo0.push(res0);
      }

      const total0 = dfo0.length
        ? this.ts.roundToTwoDecimals(dfo0.reduce((acc, n) => acc + n, 0))
        : 0;

      this.atualizarValoresPorMes('dBhgmT8mW1aPtj12tZQc', this.mes - 1, total0);
    }
  }

  async calcularDespReceitaTotalAno(a, b, c, d, e) {
    let fonte = await this.pegarShAgreg(a, b, c);
    //console.log(fonte);

    for (let i = 0; i < fonte.length; i++) {
      //let mes = this.mes;
      let id = fonte[i].id;

      let resp = fonte[i].resp;
      //let anoant = fonte[i][`fechamento${this.ano - 1}`];
      let inicio = new Date(this.ano, 0, 1);
      let fim = new Date(this.ano, 11, 1);

      let saldo0 = await this.saldoporNatureza(d, e, resp, inicio, fim);
      let res = this.ts.roundToTwoDecimals(saldo0);
      //console.log(res);
      this.atualizarValoresPorMes(id, 12, res);
    }
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
    console.log('montante', fonte2, fonte4, montante);
    return montante;
  }

  async totalizarporNatureza(fonte, nat, inicio, fim) {
    const colRef = collection(this.fs.db, 'lancamentos2025');
    const q = query(
      colRef,
      where(fonte, '==', nat),
      where('datalcto', '>=', inicio),
      where('datalcto', '<=', fim),
    );
    const qs = await getDocs(q);

    let contasData: any[] = [];
    contasData = qs.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    console.log('totalizarporNatureza', fonte, nat, contasData);
    return contasData; // Log the retrieved data
  }

  async atualizarValoresPorMes(
    documentId: string,
    mes: number,
    novoValor: number,
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
  async getNestedFieldValueClient<T = unknown>(
    collectionPath: string,
    documentId: string,
    fieldPath: string | FieldPath, // Aceita string com '.' ou um FieldPath
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
          `Documento não encontrado em ${collectionPath}/${documentId}`,
        );
        return undefined;
      }
    } catch (error) {
      console.error(
        `Erro ao buscar o campo '${String(
          fieldPath,
        )}' no documento ${collectionPath}/${documentId} (verifique regras de segurança):`,
        error,
      );
      throw error;
    }
  }

  async atualizarPAL() {
    let i = new Date().getMonth();
    let palfinal = await this.calcularPAL();

    this.atualizarValoresPorMes('wacee4kv8ZhBCPLZQ00R', 12, palfinal);
    this.atualizarValoresPorMes('wacee4kv8ZhBCPLZQ00R', i, palfinal);
  }

  async calcularPAL() {
    let pal = await this.cs.pegarContasModDespesa(
      'enquadramento',
      '==',
      'pal',
      true,
    );

    let paltotal = pal.reduce(function (a, b) {
      return a + b.saldo;
    }, 0);

    let coop = await this.cs.getFieldValue(
      'contas2025',
      '68r9EG7FnksvWICxXEiT',
      `saldo`,
    );

    let palfinal = this.ts.roundToTwoDecimals(paltotal - coop) * -1;

    console.log('PAL total:', palfinal);
    return palfinal;
  }
}
