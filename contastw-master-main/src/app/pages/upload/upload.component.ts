import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  addDoc,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { FirestoreService } from '../../services/firestore.service';
import { LoadingService } from '../../services/loading.service';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AlertComponent } from '../../shared/alert/alert.component';
import { TimestampService } from '../../services/timestamp.service';
import { LctosService } from '../../services/lctos.service';
import { SpinnerComponent } from '../../shared/spinner/spinner.component';
import { BmarkService } from '../../services/bmark.service';
import { IndiceEconComponent } from '../../shared/modal/indice-econ/indice-econ.component';
import { DemaisIndicesComponent } from '../../shared/modal/demais-indices/demais-indices.component';
import { AumService } from '../../services/aum.service';
import { RecliquidaService } from '../../services/recliquida.service';
import { Agreg2Service } from '../../services/agreg2.service';
import { Contas2Service } from '../../services/contas2.service';
import { Agreg3Service } from '../../services/agreg3.service';
import { StService } from '../../services/st.service';

@Component({
  selector: 'app-upload',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    AlertComponent,
    SpinnerComponent,
    IndiceEconComponent,
    DemaisIndicesComponent,
  ],
  templateUrl: './upload.component.html',
  styleUrl: './upload.component.css',
})
export class UploadComponent implements OnInit {
  fs = inject(FirestoreService);
  ts = inject(TimestampService);
  ls = inject(LctosService);
  bm = inject(BmarkService);
  as = inject(AumService);
  rl = inject(RecliquidaService);
  ag2 = inject(Agreg2Service);
  ag3 = inject(Agreg3Service);
  loading = inject(LoadingService);
  cs = inject(Contas2Service);
  st = inject(StService);
  jsonForm!: FormGroup;
  parsedData: any[] = []; // Para armazenar os dados JSON parseados e iterar

  showAlert: boolean = false;
  alertTitle: string = '';
  alertMessage: string = '';
  alertType: 'success' | 'error' = 'success';
  isLoading = false;
  indices: any[] = []; // Para armazenar os índices econômicos
  indices2: any[] = []; // Para armazenar os índices econômicos
  showModal: boolean = false;
  selectedItem: any;
  selectedItem2: any;
  showModal2: boolean = false;

  aposent1: number = 0;
  teste: any [] = [];

  constructor(private fb: FormBuilder) {
    this.fs.conectar();
  }

  async ngOnInit() {
    this.jsonForm = this.fb.group({
      jsonData: ['', [Validators.required, this.jsonValidator]],
    });

    this.indices = await this.bm.bM();
    this.indices2 = await this.bm.bM2();
    // console.log(this.indices2);

    this.aposent1 = await this.bm.getBmark('Mlb5v3nyBxYFS3xdWlQU');

  // this.as.atualizarBDAUMAgregado()

   //this.invest();

    //this.listarDespesas();

    //this.pegarEnqFDA()

    //this.ag2.agregAtivoPassivoResultado2026();

    // this.pegarAtivPass()
    //this.gerarPAL()

    //this.conferir();

    //this.as.pegarInvestimento();

    // await this.as.pegarIndicesEconomicos();

    //await this.rl.atualizarRecLiq(9);
    //this.ag2.menosum3()
    // this.ag2.totalizador()
    // this.ag2.pegarPAL()

    //this.ag3.calcularAgregAtivoPassivoResultado()
   // this.teste = await this.ag3.totalizarporNatureza('contacreditada.natureza',
     ////  'ativo', this.ts.standardCalendarAtivoPassivoResultado[0].inicio, this.ts.standardCalendarAtivoPassivoResultado[0].fim);
      // console.log(this.teste);
    //this.salvar()
   //this.st.atualizarPasPrevi();

// let teste = await this.bm.evolucaoPassivo()
// console.log(teste)

 await this.ag3.calcularDespesaLiquida();
//this.bm.evolucaoPassivoMenos1()
  }

  // Validador personalizado para JSON
  jsonValidator(control: any) {
    try {
      JSON.parse(control.value);
      return null; // JSON válido
    } catch (e) {
      return { invalidJson: true }; // JSON inválido
    }
  }

  converterDataExcel(excelDate) {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30)); // 30 de dezembro de 1899
    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    const dateUTC = new Date(
      excelEpoch.getTime() + excelDate * millisecondsPerDay,
    );
    const localTimezoneOffset = 3 * 60 * 60 * 1000;
    const dateLocal = new Date(dateUTC.getTime() + localTimezoneOffset);

    //const date = new Date(excelEpoch.getTime() + excelDate * millisecondsPerDay);
    return Timestamp.fromDate(dateLocal);
  }

  async gerarLctos() {
    const total = this.parsedData.length;
    this.loading.show(`Iniciando processamento de ${total} lançamentos...`);

    for (let i = 0; i < total; i++) {
      const percentual = Math.round(((i + 1) / total) * 100);
      this.loading.setMessage(
        `Processando lançamento ${i + 1} de ${total} (${percentual}%)`,
      );

      let data0 = this.parsedData[i].data;
      let data = this.ts.convertIsoStringToFirebaseTimestamp(data0);
      let descricao = this.parsedData[i].descricao;

      let contaDeb = this.parsedData[i].conta_deb;
      let codDeb: number = this.parsedData[i].cod_deb;
      let idContaDeb = this.parsedData[i]['id conta_deb'];
      let naturezaDeb = this.parsedData[i].natureza_deb;
      let enquadramentoDeb = this.parsedData[i].enquadramento_deb;
      let modDespesaDeb = this.parsedData[i].mod_despesa_deb;

      let contaCred = this.parsedData[i].conta_cred;
      let codCred: number = this.parsedData[i].cod_cred;
      let idContaCred = this.parsedData[i]['id conta_cred'];
      let naturezaCred = this.parsedData[i].natureza_cred;
      let enquadramentoCred = this.parsedData[i].enquadramento_cred;
      let modDespesaCred = this.parsedData[i].mod_despesa_cred;

      let valor: number = this.parsedData[i].valor;

      const lctogravar = {
        datalcto: data,
        descricao: descricao,
        reg: `${Date.now()}`,

        contadebitada: {
          id: idContaDeb,
          cod: codDeb,
          conta: contaDeb,
          natureza: naturezaDeb,
          enquadramento: enquadramentoDeb,
          mod_despesa: modDespesaDeb,
        },

        contacreditada: {
          id: idContaCred,
          cod: codCred,
          conta: contaCred,
          natureza: naturezaCred,
          enquadramento: enquadramentoCred,
          mod_despesa: modDespesaCred,
        },

        valor: valor,
        criado_em: Timestamp.now(),
      };

      console.log(lctogravar);
      this.gravarLcto(lctogravar);
      this.ls.debitar(idContaDeb, valor);
      this.ls.creditar(idContaCred, valor);

      await this.delay(1300);

      console.log(`Lançamento ${
        i + 1
      } , referente a  ${descricao} , com valor de  ${valor}, debitando
         ${lctogravar.contadebitada.conta} ,  e creditando ${
           lctogravar.contacreditada.conta
         } gravado com sucesso!`);
    }
    this.loading.hide();
    // this.isLoading = false;
    this.alertTitle = 'Sucesso';
    this.alertMessage = 'Arquivo Processado com Sucesso!';
    this.alertType = 'success';
    this.showAlert = true;
  }

  gravarLcto(lcto) {
    const colRef = collection(this.fs.db, 'lancamentos2025');
    addDoc(colRef, lcto).then((docRef) => {
      console.log('Lançamento criado com o ID:', docRef.id);
    });
  }

  closeAlert() {
    this.showAlert = false;
  }

  closeModal() {
    this.showModal = false;
    // this.gerarTab()
  }

  saveData() {
    this.showModal = false;
  }

  incrementar(item) {
    console.log('adicionando');
    this.showModal = true;
    this.selectedItem = item;
  }

  incrementar2(item) {
    console.log('adicionando');
    this.showModal2 = true;
    this.selectedItem2 = item;
  }

  onSubmit(): void {
    if (this.jsonForm.valid) {
      try {
        this.parsedData = JSON.parse(this.jsonForm.get('jsonData')?.value);
        console.log('Dados JSON parseados para iteração:', this.parsedData);
        // Aqui você pode fazer o que quiser com os dados, como enviá-los para um serviço, etc.
      } catch (e) {
        console.error(
          'Erro ao fazer parse do JSON. Isso não deveria acontecer com o validador, mas por segurança:',
          e,
        );
      }
    } else {
      console.log('Formulário inválido. Verifique os erros.');
      // Opcional: Marcar todos os campos como "touched" para exibir mensagens de erro
      this.jsonForm.markAllAsTouched();
    }

    this.gerarLctos();
  }

  // Exemplo de iteração (você pode personalizar isso no HTML)
  trackByIndex(index: number, item: any): number {
    return index;
  }

  delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // async conferir(){

  //   let contas: any []=[]
  //   contas = await this.cs.pegarContasNatureza('natureza','==','passivo', true);

  //   for (let i=0; i<contas.length; i++){

  //     let id = contas[i].id;
  //     let conta = contas[i].conta;
  //    // let saldo24 = (await this.cs.getFieldValue('contas2025', id, 'fechamento2024'));

  //      let saldomes = (await this.saldoporNatureza('contadebitada.conta', 'contacreditada.conta', conta, this.ag2.cal2025[8].inicio, this.ag2.cal2025[8].fim))
  //      console.log(contas[i].conta,  'Saldo Set/25:', saldomes);

  //   }

  //   // for(let i=0; i<12; i++){

  //   // let ativo = (await this.saldoporNatureza('contadebitada.natureza', 'contacreditada.natureza', 'ativo', this.ag2.cal2025[i].inicio, this.ag2.cal2025[i].fim))+2771097.13;

  //   //   console.log(this.ag2.cal2025[i].label, ativo);

  //   // }
  // }

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

    return contasData; // Log the retrieved data
  }

  async gerarPAL() {
    for (let i = 0; i < 12; i++) {
      let ano = 2025;

      const campo = `ano${ano}.${this.ag2.mesesCampos[i]}`;
      let docPAL: number = await this.ag2.getNestedFieldValueClient(
        'sh_agregados',
        'wacee4kv8ZhBCPLZQ00R',
        campo,
      );

      let docAUM: number = await this.ag2.getNestedFieldValueClient(
        'sh_agregados',
        'K5eDh0H5pIiTc9s6W9zy',
        campo,
      );

      let percPAL = parseFloat((docPAL / docAUM).toFixed(3));

      const docRef = doc(this.fs.db, 'sh_agregados', 'wDcXTGLoTkcVCCYohOGt');
      updateDoc(docRef, {
        [campo]: percPAL,
        atualizacao: Timestamp.now(),
      });

      console.log(`PAL de ${[campo]} atualizado para ${percPAL}%`);
    }

    console.log('PAL atualizado');
  }

  async pegarAtivPass() {
    let contas0: any[] = [];
    let anoAtual = 2025;

    contas0 = await this.cs.pegarDados(
      'contas2025',
      'em_uso',
      '==',
      true,
      'natureza',
      'in',
      ['ativo', 'passivo', 'resultado'],
      'cod',
      'asc',
    );

    console.log(contas0);

    for (let i = 0; i < contas0.length; i++) {
      let id = contas0[i].id;
      let conta = contas0[i].conta;
      let saldo0 = contas0[i].saldo;
      let saldo = this.ts.roundToTwoDecimals(saldo0);
      const docRef = doc(this.fs.db, 'contas2025', id);
      await updateDoc(docRef, {
        [`fechamento${anoAtual}`]: saldo,
        atualizacao: Timestamp.now(),
      });
    }
    console.log(
      'Contas de Ativo, Passivo e Resultado atualizadas com sucesso!',
    );

    let contas: any[] = [];
    contas = await this.cs.pegarContasNatureza('natureza', '==', 'ativo', true);

    let soma = contas.reduce(function (a, b) {
      return a + b.saldo;
    }, 0);

    const docRef2 = doc(this.fs.db, 'sh_agregados', 'AmWuqcCmRZ3ZzgH7kEbO');
    await updateDoc(docRef2, {
      [`fechamento${anoAtual}`]: soma,
      atualizacao: Timestamp.now(),
    });

    let contas2: any[] = [];
    contas2 = await this.cs.pegarContasNatureza(
      'natureza',
      '==',
      'passivo',
      true,
    );

    let soma2 = contas2.reduce(function (a, b) {
      return a + b.saldo;
    }, 0);

    const docRef9 = doc(this.fs.db, 'sh_agregados', '0AVwFNrr2L0iAhm5vkSp');
    await updateDoc(docRef9, {
      [`fechamento${anoAtual}`]: soma2,
      atualizacao: Timestamp.now(),
    });

    let contas3: any[] = [];
    contas3 = await this.cs.pegarContasNatureza(
      'natureza',
      '==',
      'despesa',
      true,
    );

    let soma3 = contas3.reduce(function (a, b) {
      return a + b.saldo;
    }, 0);

    const docRef91 = doc(this.fs.db, 'sh_agregados', 'vDi7ftEXgHavCzngGik5');
    await updateDoc(docRef91, {
      [`fechamento${anoAtual}`]: soma3,
      atualizacao: Timestamp.now(),
    });

    let contas4: any[] = [];
    contas4 = await this.cs.pegarContasNatureza(
      'natureza',
      '==',
      'receita',
      true,
    );

    let soma4 = contas4.reduce(function (a, b) {
      return a + b.saldo;
    }, 0);

    const docRef92 = doc(this.fs.db, 'sh_agregados', 'TQxibYZpx7k7CbSz7DGg');
    await updateDoc(docRef92, {
      [`fechamento${anoAtual}`]: soma4,
      atualizacao: Timestamp.now(),
    });

    let contas5: any[] = [];
    contas5 = await this.cs.pegarContasNatureza(
      'natureza',
      '==',
      'resultado',
      true,
    );

    let soma5 = contas5.reduce(function (a, b) {
      return a + b.saldo;
    }, 0);

    const docRef93 = doc(this.fs.db, 'sh_agregados', 'Zy0E3sWi0nIsYX3WHGTr');
    await updateDoc(docRef93, {
      [`fechamento${anoAtual}`]: soma5,
      atualizacao: Timestamp.now(),
    });
  }

  async listarDespesas() {
    let despesas: any[] = [];

    despesas = await this.cs.pegarContasNatureza(
      'natureza',
      '==',
      'despesa',
      true,
    );

    for (let i = 0; i < despesas.length; i++) {
      let id = despesas[i].id;
      let conta = despesas[i].conta;
      let total2025 = despesas[i].total2025;

      const docRef = doc(this.fs.db, 'contas2025', id);
      await updateDoc(docRef, {
        saldo: total2025,
      });
    }
    console.log('finalizado');
  }

  salvar() {
    let dadosano2022 = {
      jan: 5700.62,
      fev: 1649.15,
      mar: 2099.78,
      abr: 1349.65,
      mai: 1472.72,
      jun: 1985.38,
      jul: 5768,
      ago: 3696.49,
      set: 4822.52,
      out: 5747.16,
      nov: 3781,
      dez: 4716.48,
    };

    let dadosano2023 = {
      jan: 2814.48,
      fev: 2083.43,
      mar: 2523.63,
      abr: 3977.94,
      mai: 5815.85,
      jun: 3246.75,
      jul: 5704.22,
      ago: 8892.41,
      set: 5737.45,
      out: 6590.09,
      nov: 5939.45,
      dez: 2446.99,
    };

    let dadosano2024 = {
      jan: 4807.91,
      fev: 8268.85,
      mar: 7108.39,
      abr: 4371.15,
      mai: 6913.95,
      jun: 3675.65,
      jul: 2334.25,
      ago: 391.14,
      set: 7223.05,
      out: 500.92,
      nov: 1232.71,
      dez: 578.73,
    };

    const docRef = doc(this.fs.db, 'sh_agregados', 'dBhgmT8mW1aPtj12tZQc');
    updateDoc(docRef, { ano2023: dadosano2023, ano2024: dadosano2024 });
  }


  
}
