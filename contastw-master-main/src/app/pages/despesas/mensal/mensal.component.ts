import { CommonModule } from '@angular/common';
import { Component, inject, LOCALE_ID, OnInit } from '@angular/core';
import { TimestampService } from '../../../services/timestamp.service';
import { ContasService } from '../../../services/contas.service';
import { doc, Timestamp, updateDoc } from 'firebase/firestore';
import { LctosService } from '../../../services/lctos.service';
import { LoadingService } from '../../../services/loading.service';
import { FirestoreService } from '../../../services/firestore.service';
import { Agreg3Service } from '../../../services/agreg3.service';
import { AumService } from '../../../services/aum.service';

@Component({
  selector: 'app-mensal',
  imports: [CommonModule],
  templateUrl: './mensal.component.html',
  styleUrl: './mensal.component.css',
  providers: [{ provide: LOCALE_ID, useValue: 'pt' }],
})
export class MensalComponent implements OnInit {
  ano = new Date().getFullYear();
  anoant = this.ano - 1;
  anoant2 = this.ano - 2;
  dd = 0;
  ddPercent = 0;
  mes = new Date().getMonth() + 1;
  log1: Timestamp;
  isLoading = false;
  fonte0: any[] = [];
  fonte1: any[] = [];
  meses: string[] = [
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
  contasAgrupadas: Array<{
    enquadramento: string;
    total: number;
    contas: any[];
  }> = [];
  contasAgrupadasReceitas: Array<{
    enquadramento: string;
    total: number;
    contas: any[];
  }> = [];

  cs = inject(ContasService);
  ts = inject(TimestampService);
  ls = inject(LctosService);
  loading = inject(LoadingService);
  fs = inject(FirestoreService);
  ag3 = inject(Agreg3Service);
  as = inject(AumService);

  async ngOnInit() {
    this.dd = this.ts.diasDecorridos();
    this.ddPercent = this.dd / 365;
    this.log1 = await this.ts.log();
    this.fonte0 = await this.cs.pegarContasParam(
      'natureza',
      '==',
      'despesa',
      'saldo',
      'desc',
    );
    this.fonte1 = await this.cs.pegarContasParam(
      'natureza',
      '==',
      'receita',
      'saldo',
      'asc',
    );

    this.contasAgrupadas = this.agruparPorEnquadramento(this.fonte0);
    this.contasAgrupadasReceitas = this.agruparPorEnquadramento(this.fonte1);
    console.log(this.fonte0, this.fonte1);
  }

  getTotalPorMes(
    grupo: { contas: Array<Record<string, any>> },
    mes: string,
  ): number {
    return grupo.contas.reduce(
      (sum, conta) => sum + Number(conta?.[mes] || 0),
      0,
    );
  }

  getTotalDaConta(conta: Record<string, any>): number {
    return this.meses.reduce((sum, mes) => sum + Number(conta?.[mes] || 0), 0);
  }

  getGd2025DaConta(conta: Record<string, any>): number {
    return Number(conta?.[`gd${this.anoant}`] || 0);
  }

  getGd2024DaConta(conta: Record<string, any>): number {
    return Number(conta?.[`gd${this.anoant2}`] || 0);
  }

  getGd2025PorGrupo(grupo: { contas: Array<Record<string, any>> }): number {
    return grupo.contas.reduce(
      (sum, conta) => sum + this.getGd2025DaConta(conta),
      0,
    );
  }

  getGd2024PorGrupo(grupo: { contas: Array<Record<string, any>> }): number {
    return grupo.contas.reduce(
      (sum, conta) => sum + this.getGd2024DaConta(conta),
      0,
    );
  }

  getTotalGeralPorMes(mes: string): number {
    return this.contasAgrupadas.reduce(
      (sum, grupo) => sum + this.getTotalPorMes(grupo, mes),
      0,
    );
  }

  getTotalGeral(): number {
    return this.contasAgrupadas.reduce((sum, grupo) => sum + grupo.total, 0);
  }

  getTotalGeralGd2025(): number {
    return this.contasAgrupadas.reduce(
      (sum, grupo) => sum + this.getGd2025PorGrupo(grupo),
      0,
    );
  }

  getTotalGeralGd2024(): number {
    return this.contasAgrupadas.reduce(
      (sum, grupo) => sum + this.getGd2024PorGrupo(grupo),
      0,
    );
  }

  private agruparPorEnquadramento(contas: Array<Record<string, any>>) {
    const grupos = new Map<
      string,
      {
        enquadramento: string;
        total: number;
        contas: Array<Record<string, any>>;
      }
    >();

    contas.forEach((conta) => {
      const enquadramento = conta?.enquadramento || 'Sem enquadramento';
      const grupo = grupos.get(enquadramento) || {
        enquadramento,
        total: 0,
        contas: [] as Array<Record<string, any>>,
      };

      const contaComMeses: Record<string, any> = { ...conta };
      this.meses.forEach((mes) => {
        contaComMeses[mes] = Number(conta?.[`ano${this.ano}`]?.[mes] || 0);
      });

      grupo.contas.push(contaComMeses);
      grupo.total += Number(conta?.saldo || 0);
      grupos.set(enquadramento, grupo);
    });

    return Array.from(grupos.values()).sort((a, b) => b.total - a.total);
  }

  async atualizarMes() {
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

        if (a > 0) {
          console.log('calculando despesas mensais do mes anterior....');
          let inicPrev = this.ts.caldesp[a - 1].inicio;
          let fimPrev = this.ts.caldesp[a - 1].fim;
          let saldomesmenos1 = await this.ls.gerarFecMes(
            conta,
            inicPrev,
            fimPrev,
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
            }/${total} (${pct}%) - ${conta}`,
          );
        }
      }

      const docRef = doc(this.fs.db, 'update', 'mNdPjeV1ZfEBYen5gew1');
      await updateDoc(docRef, {
        log: Timestamp.now(),
      });

      console.log('agora calculando agregados....');
      await this.atualizar2();

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

  async atualizar2() {
    console.log('Iniciando atualização de agregados com Agreg3Service...');
    this.loading.show('Atualizando dados e agregados...');

    this.isLoading = true;

    // Agregações iniciais
    this.loading.setMessage('Processando agregações iniciais...');

    await this.ag3.calcularAgregAtivoPassivoResultado();
    await this.ag3.calcularpal();
    await this.ag3.calcularDespReceitaTotais();
    await this.ag3.calcularDespesaLiquida();
    await this.ag3.Recliquida();
    await this.ag3.superliquido();
    await this.ag3.calcularDespEnq();
    await this.ag3.calcularDFOAgreg();
    this.loading.setMessage('Capitalizando o AUM...');
    await this.as.atualizarBDAUMAgregado();
    this.isLoading = false;

    this.loading.hide();
  }
}
