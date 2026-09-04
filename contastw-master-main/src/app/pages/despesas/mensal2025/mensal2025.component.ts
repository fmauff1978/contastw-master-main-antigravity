import { Agreg2Service } from './../../../services/agreg2.service';
import { Component, LOCALE_ID, signal, inject } from '@angular/core';
import { TimestampService } from '../../../services/timestamp.service';
import { ContasService } from '../../../services/contas.service';
import { CommonModule } from '@angular/common';
import { LctosService } from '../../../services/lctos.service';
import { collection, doc, Timestamp, updateDoc } from 'firebase/firestore';
import { FirestoreService } from '../../../services/firestore.service';
import { Router } from '@angular/router';
import { SpinnerComponent } from '../../../shared/spinner/spinner.component';
import { Contas2Service } from '../../../services/contas2.service';
import { RecliquidaService } from '../../../services/recliquida.service';
import { AumService } from '../../../services/aum.service';
import { LoadingService } from '../../../services/loading.service';
import { BmarkService } from '../../../services/bmark.service';

@Component({
  selector: 'app-mensal2025',
  standalone: true,
  imports: [CommonModule, SpinnerComponent],
  templateUrl: './mensal2025.component.html',
  styleUrl: './mensal2025.component.css',
  providers: [{ provide: LOCALE_ID, useValue: 'pt' }],
})
export class Mensal2025Component {
  fonte0: any[] = [];
  fonte1: any[] = [];
  fonte2: any[] = [];
  log1: Timestamp;
  atualiz: any[] = [];
  percent: any;
  extrapolados: any;
  length: any;
  hoje = new Date();
  mes: number;
  mes0 = this.hoje.getMonth();
  mes1 = 12;
  ano: number;
  isLoading = false;
  hoje0 = new Date().getDate();
  currentSortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  fonte: any[] = [];
  fonte12: any[] = [];
  agreg = signal<any[]>([]);
  agreg950 = signal<any[]>([]);
  valoresordenados = signal<any[]>([]);
  customers = ['Natureza', 'Enquadramentos', 'Modalidade Despesa', 'Derivados'];
  agregadosordenados = signal<any[]>([]);
  index = this.mes0 + 62;
  dd: number;
  indice = 1;
  teto: number;
  sdoDespesaLiq: number;
  totaisMensais: any = {};
  totaisOff: any = {};
  totaisCompromissada: any = {};
  totaisGerenciavel: any = {};
  totaisDespesaLiquida: any = {};

  constructor(
    private cs: ContasService,
    private ts: TimestampService,
    private ls: LctosService,
    private fs: FirestoreService,
    private router: Router,
    private cs2: Contas2Service,
    private ag2: Agreg2Service,
    private rl: RecliquidaService,
    private as: AumService,
    private bm: BmarkService
  ) {
    this.mes = this.hoje.getMonth();
    this.ano = this.hoje.getFullYear();
    console.log(this.mes, this.ano, this.hoje0);
  }

  // inject LoadingService for spinner/messages
  loading = inject(LoadingService);

  async ngOnInit() {
    this.loading.show('Carregando dados iniciais...');
    try {
      this.isLoading = true;

      this.loading.setMessage('Obtendo log de atualização...');
      this.log1 = await this.ts.log();
      console.log(this.log1);

      this.loading.setMessage('Carregando contas (despesa/receita)...');
      this.fonte0 = await this.cs.pegarContasParam(
        'natureza',
        '==',
        'despesa',
        'total2025',
        'desc'
      );
      this.fonte1 = await this.cs.pegarContasParam(
        'natureza',
        '==',
        'receita',
        'total2025',
        'desc'
      );
      console.log(this.fonte0, this.fonte1);

      this.loading.setMessage('Calculando teto e saldos...');
      this.dd = this.ts.diasDecorridos();
      let bm = await this.bm.getBmark('iag4Lq2bq73m4lWsY8QR');
      console.log(bm);
      this.teto = (this.dd / 365) * bm;
      this.sdoDespesaLiq = await this.ag2.getNestedFieldValueClient(
        'sh_agregados',
        'BB9Wo3WLdeFanctk8fYH',
        'ano2025.total'
      );

      this.calcularTotaisMensais();
      this.calcularTotaisPorModalidade();
    } finally {
      this.isLoading = false;
      this.loading.hide();
    }
  }

  calcularTotaisMensais() {
    const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    this.totaisMensais = {};
    meses.forEach(mes => {
      this.totaisMensais[mes] = this.fonte0.reduce((sum, item) => {
        return sum + (item.ano2025?.[mes] || 0);
      }, 0);
    });
  }

  calcularTotaisPorModalidade() {
    const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

    meses.forEach(mes => {
      this.totaisOff[mes] = this.fonte0.reduce((sum, item) => {
        return sum + (item.mod_despesa === 'off' ? (item.ano2025?.[mes] || 0) : 0);
      }, 0);
      this.totaisCompromissada[mes] = this.fonte0.reduce((sum, item) => {
        return sum + (item.mod_despesa === 'compromissada' ? (item.ano2025?.[mes] || 0) : 0);
      }, 0);
      this.totaisGerenciavel[mes] = this.fonte0.reduce((sum, item) => {
        return sum + (item.mod_despesa === 'gerenciável' ? (item.ano2025?.[mes] || 0) : 0);
      }, 0);
      this.totaisDespesaLiquida[mes] = this.totaisCompromissada[mes] + this.totaisGerenciavel[mes];
    });
  }

  calcularTotalHorizontal(objeto: any): number {
    const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    return meses.reduce((sum, mes) => {
      return sum + (objeto[mes] || 0);
    }, 0);
  }

  sortTable(column: string) {
    this.fonte0.sort((a, b) => {
      if (a[column] > b[column]) {
        return 1;
      }
      if (a[column] < b[column]) {
        return -1;
      }
      return 0;
    });
  }

  isOlderThanThreshold(number): boolean {
    return number > this.indice;
  }

  async atualizarMes() {
    if (this.ano > 2025) {
      console.log('ano maior que 2025, nada a atualizar');
    } else {
      this.loading.show('Calculando despesas mensais...');
      try {
        this.isLoading = true;
        console.log('calculando despesas mensais....');
        const juntos = this.fonte0.concat(this.fonte1);

        const total = juntos.length;
        const updateEvery = Math.max(1, Math.floor(total / 10)); // ~10 updates during loop

        for (let i = 0; i < total; i++) {
          let a = this.mes;
          // let id = juntos[i].id_sh;
          let idconta = juntos[i].id;

          let conta = juntos[i].conta;
          // log occasionally to avoid flooding console
          if (i % updateEvery === 0) {
            console.log(`processando ${i + 1}/${total}:`, idconta, conta);
          }

          let inic = this.ts.caldesp[a].inicio;
          let fim = this.ts.caldesp[a].fim;
          let inicano = new Date(this.ano, 0, 1);
          let fimano = new Date(this.ano, 11, 31);
          //let label = this.ts.cal2025[a].label

          let saldomes = await this.ls.gerarFecMes(conta, inic, fim);
          let saldoano = await this.ls.gerarFecMes(conta, inicano, fimano);

          this.cs.atualizarValoresPorMes(idconta, a, saldomes);

          if (a > 0 && this.hoje0 < 15) {
            console.log('calculando despesas mensais do mes anterior....');
            let inicPrev = this.ts.caldesp[a - 1].inicio;
            let fimPrev = this.ts.caldesp[a - 1].fim;
            let saldomesmenos1 = await this.ls.gerarFecMes(
              conta,
              inicPrev,
              fimPrev
            );
            this.cs.atualizarValoresPorMes(idconta, a - 1, saldomesmenos1);
          }

          const docRef = doc(this.fs.db, 'contas2025', idconta);
          await updateDoc(docRef, {
            [`ano${this.ano}.total`]: saldoano,
            atualizado_em: Timestamp.now(),
          });

          // Update spinner message periodically so user sees progress
          if (i % updateEvery === 0 || i === total - 1) {
            const pct = Math.round(((i + 1) / total) * 100);
            this.loading.setMessage(
              `Calculando despesas mensais: ${
                i + 1
              }/${total} (${pct}%) - ${conta}`
            );
          }
        }

        const docRef = doc(this.fs.db, 'update', 'mNdPjeV1ZfEBYen5gew1');
        await updateDoc(docRef, {
          log: Timestamp.now(),
        });

        console.log('agora calculando agregados....');
        await this.atualizar();

        this.isLoading = false;
        this.loading.hide();

        this.ngOnInit();
      } catch (err) {
        console.error('Erro em atualizarMes:', err);
        this.loading.hide();
        this.isLoading = false;
        throw err;
      }
    }
  }

  navigateToComponent() {
    this.router.navigate(['/anuais']);
  }

  async atualizar() {
    this.loading.show('Atualizando dados e agregados...');
    try {
      this.isLoading = true;

      // Agregações iniciais
      this.loading.setMessage('Processando agregações iniciais...');
      if (this.ano > 2025) {
        await this.ag2.agregAtivoPassivoResultado2026();
      } else {
        await this.ag2.menosum();
        await this.ag2.menosum2();
        await this.ag2.menosum3();
        await this.ag2.atualizarPAL();

        // Atualização da Receita Líquida
        this.loading.setMessage('Atualizando Receita Líquida...');
        await this.rl.atualizarRecLiq(12);

        if (this.mes != 0) {
          await this.rl.atualizarRecLiq(this.mes);
          await this.rl.atualizarRecLiq(this.mes - 1);
        } else {
          await this.rl.atualizarRecLiq(this.mes);
        }

        // Atualização SH_RL
        this.loading.setMessage('Atualizando SH_RL...');

        if (this.mes != 0) {
          let rec = (await this.rl.recliquidamensal(this.mes - 1)) * -1;
          await this.rl.atualizarSH_RL(rec);
        } else {
          const campoMes = `ano${this.ano - 1}.${this.rl.mesesCampos[11]}`;

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

          await this.rl.atualizarSH_RL(recliquida);
        }
      }

      // Capitalização AUM
      this.loading.setMessage('Capitalizando o AUM...');
      await this.as.atualizarBDAUMAgregado();

      // Cálculo de múltiplos
      this.loading.setMessage('Calculando múltiplos...');
      await this.ag2.menosum5();

      // Totalizações finais
      this.loading.setMessage('Totalizando agregados e calculando DFO...');
      await this.ag2.DFO(this.mes, this.fonte);
      await this.ag2.DFO(this.mes - 1, this.fonte12);
      await this.ag2.totalizador();
      await this.pegarAgreg();
      await this.pegar950();

      this.isLoading = false;
    } catch (error) {
      console.error('Erro durante atualização:', error);
      throw error;
    } finally {
      this.loading.hide();
    }
  }

  async pegarAgreg() {
    let data: any[] = [];
    data = await this.ag2.pegarTab();
    this.agreg.set(data);
    console.log(this.agreg());
  }

  async pegar950() {
    let data: any[] = [];
    data = await this.ag2.pegarTab2();
    this.agreg950.set(data);
    console.log(this.agreg());
  }

  sortTable2(column: string) {
    if (this.currentSortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.currentSortColumn = column;
      this.sortDirection = 'asc';
    }

    this.fonte0.sort((a, b) => {
      const valA = this.getNestedValue(a, column);
      const valB = this.getNestedValue(b, column);
      const comparison = this.compareValues(valA, valB);
      return this.sortDirection === 'asc' ? comparison : -comparison;
    });
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((acc, part) => acc?.[part], obj);
  }

  private compareValues(a: any, b: any): number {
    if (a > b) return 1;
    if (a < b) return -1;
    return 0;
  }
}
