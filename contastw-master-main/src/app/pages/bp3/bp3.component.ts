import { CommonModule } from '@angular/common';
import {
  Component,
  inject,
  LOCALE_ID,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { SpinnerComponent } from '../../shared/spinner/spinner.component';
import { Contas2Service } from '../../services/contas2.service';
import { TimestampService } from '../../services/timestamp.service';
import { AumService } from '../../services/aum.service';
import { Agreg2Service } from '../../services/agreg2.service';
import { BmarkService } from '../../services/bmark.service';
import { LoadingService } from '../../services/loading.service';
import { FirestoreService } from '../../services/firestore.service';
import { collection, doc, getDocs, limit, orderBy, query, Timestamp, updateDoc, where } from 'firebase/firestore';
import { GaugeComponent } from '../../shared/gauge/gauge.component';
import { Agreg3Service } from '../../services/agreg3.service';

@Component({
  selector: 'app-bp3',
  imports: [CommonModule, SpinnerComponent, GaugeComponent],
  templateUrl: './bp3.component.html',
  styleUrl: './bp3.component.css',
  providers: [{ provide: LOCALE_ID, useValue: 'pt' }],
})
export class Bp3Component implements OnInit {

  constructor(private router: Router) {}
  cs = inject(Contas2Service);
  ts = inject(TimestampService);
  as = inject(AumService);
  ag2 = inject(Agreg2Service);
   ag3 = inject(Agreg3Service);
  bm = inject(BmarkService);
  cd = inject(ChangeDetectorRef);
  loading = inject(LoadingService);
  fs = inject(FirestoreService);


  ctasAtivo: any[] = [];
  saldoAtivo: number;
  ctasPassivo: any[] = [];
  saldoPassivo: number;
  ctasDespesa: any[] = [];
  saldoDespesa: number;
  ctasReceita: any[] = [];
  saldoReceita: number;
  ctasResultado: any[] = [];
  saldoResultado: number;
  superavit: number;
  superavitliq: number;
  passativo: number;
  aum: number;
  passaum: number;
  despliq: number;
  recliq: number;
  compromissada: number;
  gerenciavel: number;
  
  projaum: number;

  bp: any;
  isLoading = true;
  alvo: any;
  hoje = new Date();
  mes = this.hoje.getMonth();
  ano = this.hoje.getFullYear();
  saldoDFO: number = 0;
  perc_comp: number;
  perc_ger: number;
  bm_passativo: any;
  bm_passaum: any;
  bm_recdespliq: any;
  falta0: number;
  falta1: number;
  objmespassivo: any;
  pagonomespassivo: any;
  objmesaum: any;
  pagonomesaum: any;
  bm_anualdl: any;
  bm_anualrl: any;
  difativo: any;
  difpassivo: number;
  badge: number;
  meta_sl: number;
  per_sl: number;
  //separar as funcoes de (i) calcular, (ii) atualizar no bd e (iii) pegar o dado



  async ngOnInit() {
    // use LoadingService to show global spinner while all data is fetched
    this.loading.show('Carregando dados...');

    try {
      let contas = await this.pegarContas('natureza', '==', 'ativo', true); //Called after the constructor, initializing properties
      this.ctasAtivo = contas.sig;
      this.saldoAtivo = contas.sig2;

      let contas2 = await this.pegarContas('natureza', '==', 'passivo', true); //Called after the constructor, initializing properties
      this.ctasPassivo = contas2.sig;
      this.saldoPassivo = contas2.sig2;
     

      let contas3 = await this.pegarContas('natureza', '==', 'resultado', true); //Called after the constructor, initializing properties
      this.ctasResultado = contas3.sig;
      this.saldoResultado = contas3.sig2;

      let contas4 = await this.pegarContas('natureza', '==', 'despesa', true); //Called after the constructor, initializing properties
      this.ctasDespesa = contas4.sig;
      this.saldoDespesa = contas4.sig2;

      let contas5 = await this.pegarContas('natureza', '==', 'receita', true); //Called after the constructor, initializing properties
      this.ctasReceita = contas5.sig;
      this.saldoReceita = contas5.sig2;

      this.superavit = this.saldoReceita - this.saldoDespesa;

       this.superavitliq= await this.ag3.getNestedFieldValueClient(
        'sh_agregados',
        'WdtS8S1jtIhQ2aoUloA8',
        'ano2026.total' 
        ) ?? 0;

        console.log("superavit", this.superavitliq);


      this.bp = this.saldoPassivo + this.saldoResultado + this.superavit;

      const ratio = this.saldoAtivo ? this.saldoPassivo / this.saldoAtivo : 0;
      this.passativo = this.ts.roundToNDecimals(ratio, 3);

      this.aum = await this.as.pegarAUM();

      const ratio2 = this.aum ? this.saldoPassivo / this.aum : 0;
      this.passaum = this.ts.roundToNDecimals(ratio2, 3);

      let contas6 = await this.pegarContas(
        'mod_despesa',
        'in',
        ['compromissada', 'gerenciável'],
        true,
      );
      this.despliq = contas6.sig2;

      let contas7 = await this.pegarContas(
        'mod_despesa',
        '==',
        'compromissada',
        true,
      );
      this.compromissada = contas7.sig2;
      
      let contas8 = await this.pegarContas(
        'mod_despesa',
        '==',
        'gerenciável',
        true,
      );
      this.gerenciavel = contas8.sig2;

      this.perc_comp = this.compromissada / this.despliq;
      this.perc_ger = this.gerenciavel / this.despliq;

      let contas9 = await this.pegarContas(
        'cod',
        'in',
        [37, 32, 39, 40, 35],
        true,
      );
      this.saldoDFO = contas9.sig2;

      let recliq0: number = await this.ag2.getNestedFieldValueClient(
        'sh_agregados',
        '7yLtE9Loqo2Q416w9ndK',
        'ano2026.total',
      );
      this.recliq = recliq0 * -1;

      // this.andamento = this.ts.diasDecorridos() / 365;

      this.alvo = await this.bm.getBmark('Mlb5v3nyBxYFS3xdWlQU');
      await this.obterBM();
      this.falta0 = this.saldoPassivo - this.saldoAtivo * this.bm_passativo;
      this.falta1 = this.saldoPassivo - this.aum * this.bm_passaum;

      this.objmespassivo = await this.ag2.pegarObj();

      this.pagonomespassivo = await this.ag2.pegarRealizado();



      const dataApenas = new Date(this.hoje.getFullYear(), this.hoje.getMonth(), this.hoje.getDate());

      let agenda = await this.pegarAgenda(dataApenas);
      this.badge = agenda.length;
      console.log('Contas agendadas para hoje:', agenda);
      
     

      let teste = await this.as.pegarQualquerMesSHAPOSENTporData(
        new Date(this.ano, this.mes, 1),
      );

      this.objmesaum = teste[0].objetivo_mes;
      this.pagonomesaum = teste[0].realizado_mes;

      let testeX = `fechamento${this.ano - 1}`;

      let teste2: number = await this.ag2.getNestedFieldValueClient(
        'sh_agregados',
        'AmWuqcCmRZ3ZzgH7kEbO',
        testeX,
      );
  
      let teste3: number = await this.ag2.getNestedFieldValueClient(
        'sh_agregados',
        '0AVwFNrr2L0iAhm5vkSp',
        testeX,
      );
     

      let dif0 = ((this.saldoAtivo - teste2) / teste2) * 100;
      this.difativo = this.ts.roundToNDecimals(dif0, 1);
      
      let dif1 = ((this.saldoPassivo - teste3 * -1) / (teste3 * -1)) * 100;
      this.difpassivo = this.ts.roundToNDecimals(dif1, 1);
     

this.projaum = (await this.cs.getFieldValue("seriestemporais_aposent", "Oa1abFVd9dK8mGNreGsy", "aum_mes")) ?? 0;

console.log("aum projetado", this.projaum);

let meta_rl = await this.bm.getBmark('lwYN9YznidkOMs86uFOg'); 
let meda_dl = await this.bm.getBmark('iag4Lq2bq73m4lWsY8QR');
this.meta_sl = meta_rl - meda_dl;
      
    } catch (error) {
      console.error('Erro no ngOnInit BP3:', error);
    } finally {
      // aguarda um frame duplo para garantir que o Angular já tenha atualizado o DOM
      await this.waitForRender();
      this.cd.detectChanges();
      this.loading.hide();
      this.isLoading = false;
    }
    await this.atualizarNoBanco();

    if (this.passativo < this.bm_passativo) {
      this.atualizarbmarks('KG4GAhPVrgCu5BG24Hng', this.passativo);
      console.log('atualizou bmark pass/ativo');
    } else {
      console.log('pass/ativo acima do becnhmark');
    }

    if (this.passaum < this.bm_passaum) {
      this.atualizarbmarks('W7zolR6QYzgVpUtagzXc', this.passaum);
      console.log('atualizou bmark pass/aum');
    } else {
      console.log('pass/aum acima do becnhmark');
    }
    
  }

  // Aguarda dois frames para garantir que o DOM foi atualizado/renderizado
  async waitForRender() {
    return new Promise<void>((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => resolve());
      });
    });
  }

  //******************* funcoes de suporte ************************************

  getProgress(numerador, denominador) {
    const progress = (numerador / denominador) * 100;
    return progress.toFixed(2) + '%'; // Formata como porcentagem com 2 casas decimais
  }

  async obterDados(
    param: string,
    equal: string,
    param2: string,
    bool: boolean,
  ) {
    try {
      // sig começa como array vazio e depois recebe o resultado do serviço
      let sig: any[] = [];

      sig = await this.cs.pegarContasNatureza(param, equal, param2, bool);

      // totalizar(sig) deve retornar um número; arredondamos em seguida
      const saldoTotal = this.totalizar(sig);
      const saldo = this.ts.roundToTwoDecimals(saldoTotal);

      // sig2 é o valor absoluto do saldo (negativos viram positivos)
      const sig2: number = saldo < 0 ? saldo * -1 : saldo;

      // Retorne ambos
      return { sig, sig2 };
    } catch (error) {
      alert('erro na obtencao dos dados');
      console.error(error);

      // Retorno seguro em caso de erro (ajuste conforme sua necessidade)
      return { sig: [], sig2: 0 };
    }
  }

  // totalizar deve somar os saldos e retornar um número
  totalizar(fonte): number {
    const total = fonte.reduce((acc, item) => acc + (item.saldo ?? 0), 0);
    return total; // não chame total() aqui
  }

  async pegarContas(param1, param2, param3, bool) {
    let bp = await this.obterDados(param1, param2, param3, bool);
    return bp;
  }

  async atualizarTotais(id, valor) {
    await this.ag2.atualizarValoresPorMes(id, 12, valor);
  }

  async pegarAgenda(data){

    
        const colRef = collection(this.fs.db, 'agenda');
        const q = query(colRef, where('agendado_para', '==', data), where('ativa','==', true));
        const qs = await getDocs(q);
        let contasData: any[] = [];
        contasData = qs.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
    
       
        return contasData;
      

  }

  async obterBM() {
    this.bm_passativo = await this.bm.getBmark('KG4GAhPVrgCu5BG24Hng');
    this.bm_passaum = await this.bm.getBmark('W7zolR6QYzgVpUtagzXc');
    this.bm_recdespliq = await this.bm.getBmark('pmD2mv7EYLgYOFnbpFIS');
    this.bm_anualdl = await this.bm.getBmark('iag4Lq2bq73m4lWsY8QR');
    this.bm_anualrl = await this.bm.getBmark('lwYN9YznidkOMs86uFOg');
    //console.log(this.pass_aum());
  }

  irParaOutraTela(event: Event) {
  event.stopPropagation(); // Para de subir para o <a>
  event.preventDefault();  // Cancela o comportamento de link do <a>

  this.router.navigate(['/agenda2']);
}

  //**********************ATUALIZAÇÕES NO BANCO DE DADOS********************************

  async atualizarNoBanco() {
    await this.atualizarTotais('9r9xraRfB4VJNr46WYji', this.passativo);
    await this.ag2.atualizarValoresPorMes(
      '9r9xraRfB4VJNr46WYji',
      this.mes,
      this.passativo,
    );
    await this.atualizarTotais('nP9lXcU9fAUgdQWaLmIJ', this.passaum);
    await this.ag2.atualizarValoresPorMes(
      'nP9lXcU9fAUgdQWaLmIJ',
      this.mes,
      this.passaum,
    );
    await this.atualizarTotais('0AVwFNrr2L0iAhm5vkSp', this.saldoPassivo * -1);
    await this.atualizarTotais('AmWuqcCmRZ3ZzgH7kEbO', this.saldoAtivo);
    await this.atualizarTotais(
      'Zy0E3sWi0nIsYX3WHGTr',
      this.saldoResultado * -1,
    );
    await this.atualizarTotais('vDi7ftEXgHavCzngGik5', this.saldoDespesa);
    await this.atualizarTotais('TQxibYZpx7k7CbSz7DGg', this.saldoReceita * -1);
    await this.atualizarTotais('BB9Wo3WLdeFanctk8fYH', this.despliq);
    // await this.atualizarTotais('7yLtE9Loqo2Q416w9ndK', this.recliq * -1);
    await this.atualizarTotais(
      '3TDHxqu8M25B3DjtNVWs',
      this.saldoDespesa / this.saldoReceita,
    );
    await this.ag2.atualizarValoresPorMes(
      '3TDHxqu8M25B3DjtNVWs',
      this.mes,
      this.saldoDespesa / this.saldoReceita,
    );
    await this.atualizarTotais(
      'lkZLhYcIZPtXMp6JLcF3',
      this.despliq / this.recliq,
    );
    await this.ag2.atualizarValoresPorMes(
      'lkZLhYcIZPtXMp6JLcF3',
      this.mes,
      this.despliq / this.recliq,
    );
    await this.atualizarTotais('RON4QGNrj8ZykZrQJSuU', this.compromissada);
    await this.atualizarTotais('v9cgg3wHHiVAgkuqlbvc', this.gerenciavel);
    await this.atualizarTotais('dBhgmT8mW1aPtj12tZQc', this.saldoDFO);
    await this.atualizarTotais('K5eDh0H5pIiTc9s6W9zy', this.aum);
  }

  atualizarbmarks(id, valor) {
    const docRef = doc(this.fs.db, 'bmark', id);
    updateDoc(docRef, { alvo: valor, atualizacao: Timestamp.now() });
  }
}
