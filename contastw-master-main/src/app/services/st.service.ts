import { inject, Injectable } from '@angular/core';
import {
  collection,
  where,
  orderBy,
  getDocs,
  query,
  Timestamp,
  addDoc,
  doc,
  limit,
  updateDoc,
} from 'firebase/firestore';
import { FirestoreService } from './firestore.service';
import { Agreg2Service } from './agreg2.service';
import { TimestampService } from './timestamp.service';
import { BmarkService } from './bmark.service';
import { AumService } from './aum.service';
import { Agreg3Service } from './agreg3.service';
import { Contas2Service } from './contas2.service';

@Injectable({
  providedIn: 'root',
})
export class StService {
  fs = inject(FirestoreService);
  ag2 = inject(Agreg2Service);
  ag3 = inject(Agreg3Service);
  ts = inject(TimestampService);
  bm = inject(BmarkService);
  as = inject(AumService);
  cs = inject(Contas2Service);
  ano = new Date().getFullYear();
  mes = new Date().getMonth();
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

  async pegaST(bd, ano) {
    const colRef = collection(this.fs.db, bd);
    const qs0 = query(colRef, where('ano', '>', ano), orderBy('ano', 'asc'));
    const qs = await getDocs(qs0);
    let contasData: any[] = [];
    contasData = qs.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return contasData; // Log the retrieved data
  }

  async pegarDespLiq() {
    let data: any[] = [];
    data = await this.pegaST('seriestemporais_despliq', this.ano - 5);
    return data;
  }

  async pegarRecLiq() {
    let data: any[] = [];
    data = await this.pegaST('seriestemporais_recliq', this.ano - 5);
    return data;
  }

  async consulta(id) {
    let data: any[] = [];
    let data1: any[] = [];

    let campoMes = `ano${this.ano - 1}`;
    let campoMes1 = `ano${this.ano}`;

    data = await this.ag2.getNestedFieldValueClient(
      'sh_agregados',
      id,
      campoMes,
    );

    data1 = await this.ag2.getNestedFieldValueClient(
      'sh_agregados',
      id,
      campoMes1,
    );

    const valoresOrdenados = this.ag2.mesesCampos.map((chaveMes) => {
      return data[chaveMes] ?? null; // Retorna o valor ou 0 se for null/undefined
    });

    const valoresOrdenados1 = this.ag2.mesesCampos.map((chaveMes) => {
      return data1[chaveMes] ?? null; // Retorna o valor ou 0 se for null/undefined
    });

    const valoresCombinados = valoresOrdenados.concat(valoresOrdenados1);
    const valoresFinais = valoresCombinados.map((valor) =>
      valor === 0 ? null : valor,
    );

    //this.valoresordenados.set(valoresOrdenados)
    return valoresFinais;
  }

  async consultaNegativos(id) {
    let data: any[] = [];
    let data1: any[] = [];

    let campoMes = `ano${this.ano - 1}`;
    let campoMes1 = `ano${this.ano}`;

    data = await this.ag2.getNestedFieldValueClient(
      'sh_agregados',
      id,
      campoMes,
    );

    data1 = await this.ag2.getNestedFieldValueClient(
      'sh_agregados',
      id,
      campoMes1,
    );

    const valoresOrdenados = this.ag2.mesesCampos.map((chaveMes) => {
      return data[chaveMes] ?? null; // Retorna o valor ou 0 se for null/undefined
    });

    const valoresOrdenados1 = this.ag2.mesesCampos.map((chaveMes) => {
      return data1[chaveMes] ?? null; // Retorna o valor ou 0 se for null/undefined
    });

    const valoresCombinados = valoresOrdenados.concat(valoresOrdenados1);

    const numerosMultiplicados = valoresCombinados.map((numero) => {
      if (numero === 0 || numero === null) {
        return null; // Garante que 0 e null se tornem null
      }
      return numero * -1;
    });

    return numerosMultiplicados;
  }

  extrairTotaisAnuais(obj: any): any[] {
    const anoInicio = 2022;
    //const anoFim = 2026;
    const totaisAnuais: any[] = [];

    // Percorrer cada ano em ordem
    for (let ano = anoInicio; ano <= this.ano; ano++) {
      const anoKey = `ano${ano}`;

      // Verificar se o ano existe no objeto
      if (
        obj[anoKey] &&
        obj[anoKey].total !== undefined &&
        obj[anoKey].total !== null
      ) {
        totaisAnuais.push({
          ano: ano,
          total: obj[anoKey].total,
        });
      }
    }

    // Retornar apenas os valores (totais), já ordenados por ano
    return totaisAnuais.map((item) => item.total);
  }

  extrairEOrdenarPorAno(obj: any): any[] {
    const anoInicio = 2022;
    // const anoFim = 2026;
    const dados: any[] = [];

    // Percorrer cada ano no objeto
    for (let ano = anoInicio; ano <= this.ano; ano++) {
      const anoKey = `ano${ano}`;

      // Verificar se o ano existe no objeto
      if (obj[anoKey]) {
        const anoData = obj[anoKey];

        // Percorrer cada mês do ano
        for (
          let mesIndex = 0;
          mesIndex < this.mesesCampos.length - 1;
          mesIndex++
        ) {
          // -1 para excluir 'total'
          const mesAbr = this.mesesCampos[mesIndex];

          if (anoData[mesAbr] !== undefined && anoData[mesAbr] !== null) {
            dados.push({
              ano: ano,
              mes: mesIndex + 1,
              mesAbr: mesAbr,
              data: new Date(ano, mesIndex, 1),
              valor: anoData[mesAbr],
            });
          }
        }
      }
    }

    // Ordenar por data (mais antigo para mais recente)
    const dadosOrdenados = dados.sort(
      (a, b) => a.data.getTime() - b.data.getTime(),
    );

    // Retornar apenas os valores
    return dadosOrdenados.map((item) => item.valor);
  }

  async consulta2(id) {
    let start = 2023;
    let campoMes0 = `ano${start + 1}`;
    let campoMes = `ano${start + 2}`;
    let campoMes2026 = `ano${start + 3}`;

    const data0 = await this.ag2.getNestedFieldValueClient(
      'sh_agregados',
      id,
      campoMes0,
    );

    const data1 = await this.ag2.getNestedFieldValueClient(
      'sh_agregados',
      id,
      campoMes,
    );

    const data2 = await this.ag2.getNestedFieldValueClient(
      'sh_agregados',
      id,
      campoMes2026,
    );

    if (!data0 || !data1) {
      console.error(
        'Não foi possível buscar os dados para um ou ambos os anos.',
      );
      return [];
    }

    // Cria um array de valores para 2024
    const valores2024 = this.ag2.mesesCampos.map((chaveMes) =>
      (data0[chaveMes] ?? null) ? Math.abs(data0[chaveMes]) : null,
    );
    // Cria um array de valores para 2025
    const valores2025 = this.ag2.mesesCampos.map((chaveMes) =>
      (data1[chaveMes] ?? null) ? Math.abs(data1[chaveMes]) : null,
    );

    const valores2026 = this.ag2.mesesCampos.map((chaveMes) =>
      (data2[chaveMes] ?? null) ? Math.abs(data2[chaveMes]) : null,
    );

    // Concatena os dois arrays para ter 24 meses de dados
    const valoresCombinados0 = valores2024.concat(valores2025);
    const valoresCombinados = valoresCombinados0.concat(valores2026);

    // Substitui 0 por null, como em outras partes do seu código
    const valoresFinais = valoresCombinados.map((valor) =>
      valor === 0 ? null : valor,
    );

    return valoresFinais;
  }

  async atualizarPasPrevi() {
    let parcelas_restantes = this.ts.difAposentadoria();

    console.log('passo 1:', parcelas_restantes);

    let dif =
      this.ts.calcularDiferencaMeses(Timestamp.fromMillis(1654052400 * 1000)) *
      -1;
    console.log('passo 2:', dif);

    let indice = dif + 1;

    console.log('passo 3:', indice);

    const colRef1 = collection(this.fs.db, 'seriestemporais_pass_previ');
    const q = query(colRef1, orderBy('reg', 'desc'), limit(1));
    const qs = await getDocs(q);
    let contasData: any[] = [];
    contasData = qs.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log('passo 4:', contasData);

    let indBD = contasData[0].reg;
    let id_ref = contasData[0].id;
    let passivo_pago0 = await this.bm.evolucaoPassivo();
    let passivo_pago = this.ts.roundToTwoDecimals(passivo_pago0 * -1);
    console.log('passo 5:', indBD, id_ref, passivo_pago);

    let indBD1 = indBD - 1;

    const colRef2 = collection(this.fs.db, 'seriestemporais_pass_previ');
    const q2 = query(colRef2, where('reg', '==', indBD1));
    const qs2 = await getDocs(q2);
    let contasData2: any[] = [];
    contasData2 = qs2.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log('passo 4:', contasData2);
    let id_ref1 = contasData2[0].id;
    let passivo_pagomenos1 = await this.bm.evolucaoPassivoMenos1();
    let passivo_pago_menos1 = this.ts.roundToTwoDecimals(passivo_pagomenos1);
    console.log('passo 6:', indBD, id_ref1, passivo_pago_menos1);
    //calcular PAL

    this.ag2.atualizarPAL();

    let campoMe = `ano${this.ano}.${this.mesesCampos[this.mes]}`;
    let pal = await this.ag2.calcularPAL();
    // const docRef0 = doc(this.fs.db, 'sh_agregados', 'wacee4kv8ZhBCPLZQ00R');
    // updateDoc(docRef0, {
    //   [campoMe]: pal,
    //   atualizacao: Timestamp.now(),
    // });

    // let previap = await this.cs.getFieldValue(
    //   'contas2025',
    //   'N2Owfj9S7NcgFZtwrr5F',
    //   'saldo'
    // );
    // console.log(previap);
    // let previ13 = await this.cs.getFieldValue(
    //   'contas2025',
    //   'vJC2pmKST51ZHGXvaKRt',
    //   'saldo'
    // );
    // console.log(previ13);

    // let previtotal: number = previap + previ13;
    // console.log(previtotal);
    // console.log('atualizar o mes');

    let campoMes = `ano${this.ano}.${this.mesesCampos[12]}`;

    let passivo: number = await this.ag2.getNestedFieldValueClient(
      'sh_agregados',
      '0AVwFNrr2L0iAhm5vkSp',
      campoMes,
    );

    let aum = await this.as.pegarAUM();

    let pass_previ = this.ts.roundToTwoDecimals(passivo + pal) * -1;

    let pal_passivo = parseFloat(((pal / passivo) * -1).toFixed(3));
    let pal_aum = parseFloat((pal / aum).toFixed(3));
    const docRef9 = doc(this.fs.db, 'sh_agregados', 'vWXbLDnshOpaij7Z30SE');
    updateDoc(docRef9, {
      [campoMe]: pal_passivo,
      [campoMes]: pal_passivo,
      atualizacao: Timestamp.now(),
    });

    const docRefP = doc(this.fs.db, 'sh_agregados', 'wDcXTGLoTkcVCCYohOGt');
    updateDoc(docRefP, {
      [campoMe]: pal_aum,
      [campoMes]: pal_aum,
      atualizacao: Timestamp.now(),
    });

    let obj = this.ts.roundToTwoDecimals(pass_previ / parcelas_restantes);

    if (indice > indBD) {
      console.log('precisa criar novo registro no BD');

      let reg = indBD + 1;
      const ano = new Date().getFullYear();
      const mesnovo = new Date().getMonth();
      let mes: Date = new Date(ano, mesnovo, 1);

      let st = {
        mes: Timestamp.fromDate(mes),
        passivo_sem_previ: pass_previ,
        objetivo_mes: obj,
        realizado_mes: passivo_pago,
        reg: reg,
        atualizacao: Timestamp.now(),
      };

      const coll = collection(this.fs.db, 'seriestemporais_pass_previ');
      addDoc(coll, st).then((docRef) => {
        console.log('Lançamento criado com o ID:', docRef.id);
      });
    } else {
      const docRef = doc(this.fs.db, 'seriestemporais_pass_previ', id_ref);
      await updateDoc(docRef, {
        passivo_sem_previ: pass_previ,
        objetivo_mes: obj,
        realizado_mes: passivo_pago,
        atualizacao: Timestamp.now(),
      });

      const docRefY = doc(this.fs.db, 'seriestemporais_pass_previ', id_ref1);
      await updateDoc(docRefY, {
        //passivo_sem_previ: pass_previ,
        //objetivo_mes: obj,
        realizado_mes: passivo_pago_menos1,
        atualizacao: Timestamp.now(),
      });
    }
  }

  async pegaPassivosemPrevi() {
    const colRef = collection(this.fs.db, 'seriestemporais_pass_previ');
    const qs0 = query(colRef, orderBy('mes', 'asc'));
    const qs = await getDocs(qs0);
    let contasData: any[] = [];
    contasData = qs.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return contasData; // Log the retrieved data
  }

  async extrairEixoX(fonte) {
    let retorno: any[] = [];

    for (let i = 0; i < fonte.length; i++) {
      let x = fonte[i].mes.toDate();
      const ano = x.getFullYear();
      const mes = x.getMonth() + 1;
      const mesFormatado = String(mes).padStart(2, '0');
      //console.log(x);

      retorno.push(`${mesFormatado}/${ano}`);
    }

    return retorno;
  }

  async extrairEixoY() {
    let fonte1 = await this.pegaPassivosemPrevi();

    let fonte: any[] = [];

    for (let i = 0; i < fonte1.length; i++) {
      let x = fonte1[i].passivo_sem_previ;

      fonte.push(x);
    }

    return fonte;
  }

  async extrairObj() {
    let fonte4 = await this.pegaPassivosemPrevi();

    let fonte: any[] = [];

    for (let i = 0; i < fonte4.length; i++) {
      let x = fonte4[i].objetivo_mes;

      fonte.push(x);
    }

    return fonte;
  }

  async extrairReal() {
    let fonte5 = await this.pegaPassivosemPrevi();

    let fonte: any[] = [];

    for (let i = 0; i < fonte5.length; i++) {
      let x = fonte5[i].realizado_mes;

      fonte.push(x);
    }

    return fonte;
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

  async extrairDados(dados) {
    let fonte5 = await this.pegarAposent();
    // console.log(fonte5);

    let fonte: any[] = [];

    for (let i = 0; i < fonte5.length; i++) {
      let x = fonte5[i][dados];

      fonte.push(x);
    }
    //  console.log(fonte);
    return fonte;
  }

  async consultaPALXPASSIVO(id) {
    let campoMes = `ano2025`;
    let campoMes0 = `ano2026`;

    const data0 = await this.ag2.getNestedFieldValueClient(
      'sh_agregados',
      id,
      campoMes,
    );

    const data1 = await this.ag2.getNestedFieldValueClient(
      'sh_agregados',
      id,
      campoMes0,
    );

    if (!data0 || !data1) {
      console.error(
        'Não foi possível buscar os dados para um ou ambos os anos.',
      );
      return [];
    }

    // Cria um array de valores para 2024
    const valores2024 = this.ag2.mesesCampos.map((chaveMes) =>
      (data0[chaveMes] ?? null) ? Math.abs(data0[chaveMes]) : null,
    );
    // Cria um array de valores para 2025
    const valores2025 = this.ag2.mesesCampos.map((chaveMes) =>
      (data1[chaveMes] ?? null) ? Math.abs(data1[chaveMes]) : null,
    );

    // Concatena os dois arrays para ter 24 meses de dados
    const valoresCombinados = valores2024.concat(valores2025);

    // Substitui 0 por null, como em outras partes do seu código
    const valoresFinais = valoresCombinados.map((valor) =>
      valor === 0 ? null : valor,
    );

    return valoresFinais;
  }

  async pegarIDdoano(colecao, ano) {
    const colRef = collection(this.fs.db, colecao);
    const q = query(colRef, where('ano', '==', ano));
    const qs = await getDocs(q);
    let contasData: any[] = [];
    contasData = qs.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    if (!contasData || contasData.length === 0) {
      console.log(
        `Nenhum documento encontrado para ${colecao} com ano ${ano}. Criando novo...`,
      );

      const novoDoc = {
        ano: ano,

        atualizacao: Timestamp.now(),
      };

      const docRef = await addDoc(colRef, novoDoc);
      console.log(`Novo documento criado com ID: ${docRef.id}`);
      return docRef.id;
    }
    let id = contasData[0].id;

    return id;
  }
  async calcMes(id1, bd, id2, fonte1, mes) {
    for (let i = mes; i >= 0; i--) {
      let campoMes = `ano${this.ano}.${this.ag2.mesesCampos[i]}`;

      let res: number = await this.ag2.getNestedFieldValueClient(
        'sh_agregados',
        id1,
        campoMes,
      );

      let res0 = this.ts.roundToTwoDecimals(res);
      let res1 = Math.abs(res0);

      fonte1.push(res1);
      //console.log(fonte1);
    }

    let somaTotal0 = fonte1.reduce((acumulador, valorAtual) => {
      return acumulador + valorAtual;
    }, 0); // O '0' é o valor inicial do acumulador

    let somaTotal = this.ts.roundToTwoDecimals(somaTotal0);

    //  console.log('O array final é:', this.fonte);
    //console.log('A soma total dos valores é:', somaTotal);

    // Você pode agora retornar a soma ou fazer o que precisar com ela

    let campoMes = `${this.ag2.mesesCampos[mes]}`;

    const docRef = doc(this.fs.db, bd, id2);
    await updateDoc(docRef, {
      [campoMes]: somaTotal,
      atualizacao: Timestamp.now(),
    });
  }

  async pegarIndEcon() {
    const colRef = collection(this.fs.db, 'indecon');
    const q = query(colRef, orderBy('indice', 'asc'));
    const qs = await getDocs(q);
    let contasData: any[] = [];
    contasData = qs.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    console.log(contasData);
    return contasData;
  }

  async pegarPagtoDiv() {
    const colRef = collection(this.fs.db, 'seriestemporais_pagtopass');
    const q = query(colRef, orderBy('ano', 'asc'));
    const qs = await getDocs(q);
    let contasData: any[] = [];
    contasData = qs.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    console.log(contasData);
    return contasData;
  }

  async pegarProj() {
    const colRef = collection(this.fs.db, 'sh_agregados');
    const q = query(colRef, where('tipo', '==', 'projecao'));
    const qs = await getDocs(q);
    let contasData: any[] = [];
    contasData = qs.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    console.log(contasData);
    return contasData;
  }

  async atualizarPagtoPassivo() {
    let campoMes = `ano${this.ano - 1}.total`;
    
    let passivomenosum: number =
      (await this.ag3.getNestedFieldValueClient(
        'sh_agregados',
        '0AVwFNrr2L0iAhm5vkSp',
        campoMes,
      )) ?? 0;
   
    let campoMes1 = `ano${this.ano}.total`;
    let passivoatual: number =
      (await this.ag2.getNestedFieldValueClient(
        'sh_agregados',
        '0AVwFNrr2L0iAhm5vkSp',
        campoMes1,
      )) ?? 0;
    

    let jrsfinanc: number =
      (await this.ag3.getNestedFieldValueClient(
        'contas2025',
        'kYDgq0vIGZVjsX3TigCu',
        campoMes1,
      )) ?? 0;

   

    let pagto = this.ts.roundToTwoDecimals(
      passivoatual * -1 - jrsfinanc - passivomenosum * -1,
    );
   
    let campoMesX = `${this.ag2.mesesCampos[this.mes]}`;
   
    let campoMes0 = `ano${this.ano}.${campoMesX}`;
    

    let fonte = await this.pegarPagtoDiv2();
    

    let id = fonte[0].id;
   

    let ano = fonte[0].ano;
   

    if (ano < this.ano) {

      const colRef2 = collection(this.fs.db, 'seriestemporais_pagtopass');
      addDoc(colRef2, {
        ano: this.ano,
        [campoMesX]: pagto * -1,
        atualizacao: Timestamp.now(),
      });

      }
    else {


    const docRef = doc(this.fs.db, 'seriestemporais_pagtopass', id);
    await updateDoc(docRef, {
      [campoMesX]: pagto * -1,
      atualizacao: Timestamp.now(),
    });}
  }

  async pegarPagtoDiv2() {
    const colRef = collection(this.fs.db, 'seriestemporais_pagtopass');
    const q = query(colRef, orderBy('ano', 'desc'), limit(1));
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
