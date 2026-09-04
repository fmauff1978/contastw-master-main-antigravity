import {
  Component,
  computed,
  inject,
  LOCALE_ID,
  signal,
  effect,
  OnInit,
} from '@angular/core';
import { Contas2Service } from '../../services/contas2.service';
import { CommonModule } from '@angular/common';
import { TimestampService } from '../../services/timestamp.service';
import { doc, getDoc, Timestamp, updateDoc } from 'firebase/firestore';
import { FirestoreService } from '../../services/firestore.service';
import { LoadingService } from '../../services/loading.service';
import { SpinnerComponent } from '../../shared/spinner/spinner.component';
import { BmarkService } from '../../services/bmark.service';
import { Agreg2Service } from '../../services/agreg2.service';
import { RecliquidaService } from '../../services/recliquida.service';
import { AumService } from '../../services/aum.service';
import { TickerComponent } from '../../shared/ticker/ticker.component';

// Tipo para rastrear o status de carregamento
interface LoadingStatus {
  ativo: boolean;
  passivo: boolean;
  despesa: boolean;
  receita: boolean;
  resultado: boolean;
}

@Component({
  selector: 'app-bp2',
  imports: [CommonModule, SpinnerComponent],
  templateUrl: './bp2.component.html',
  styleUrl: './bp2.component.css',
  standalone: true,
  providers: [{ provide: LOCALE_ID, useValue: 'pt' }],
  styles: [
    `
      .ticker-wrapper {
        width: 100%;
        overflow: hidden;
        white-space: nowrap;
      }

      .ticker-track {
        display: inline-block;
        white-space: nowrap;
        animation: ticker 30s linear infinite;
        padding-left: 100%;
      }

      .ticker-item {
        display: inline-block;
        padding: 0 2rem;
        color: #fff;
        font-size: 0.875rem;
      }

      @keyframes ticker {
        0% {
          transform: translate3d(0, 0, 0);
        }
        100% {
          transform: translate3d(-100%, 0, 0);
        }
      }

      .ticker-track:hover {
        animation-play-state: paused;
      }
    `,
  ],
})
export class Bp2Component implements OnInit {
  cs = inject(Contas2Service);
  ts = inject(TimestampService);
  fs = inject(FirestoreService);

  bm = inject(BmarkService);
  ag2 = inject(Agreg2Service);
  rl = inject(RecliquidaService);
  as = inject(AumService);
  loading = inject(LoadingService);

  ctasAtivo = signal<any[]>([]);
  saldoAtivo = signal<number | null>(null);
  ctasPassivo = signal<any[]>([]);
  saldoPassivo = signal<number | null>(null);
  ctasDespesa = signal<any[]>([]);
  saldoDespesa = signal<number | null>(null);
  ctasReceita = signal<any[]>([]);
  saldoReceita = signal<number | null>(null);
  ctasResultado = signal<any[]>([]);
  saldoResultado = signal<number | null>(null);
  aum = signal<number | null>(null);
  superavit = signal<number | null>(null);
  ctasDespLiq = signal<any[]>([]);
  saldoDespLiq = signal<number | null>(null);
  ctasDespComp = signal<any[]>([]);
  saldoDespComp = signal<number | null>(null);
  ctasDespGer = signal<any[]>([]);
  saldoDespGer = signal<number | null>(null);
  ctasDFO = signal<any[]>([]);
  saldoDFO = signal<number | null>(null);
  pass_ativo = signal<number | null>(null);
  pass_aum = signal<number | null>(null);
  bm_passativo = signal<number | null>(null);
  bm_passaum = signal<number | null>(null);
  bm_recdespliq = signal<number | null>(null);
  isLoading = signal<boolean>(true);
  falta0 = signal<number | null>(null);
  falta1 = signal<number | null>(null);
  hoje = new Date();
  andamento = signal<number | null>(null);
  ctasfopag = signal<any[]>([]);
  saldofopag = signal<number | null>(null);
  ctasprevifgts = signal<any[]>([]);
  saldoprevifgts = signal<number | null>(null);
  saldoReceitaLiquida: number;
  rem = signal<number | null>(null);
  mes = new Date().getMonth();
  ano = new Date().getFullYear();

  faltaaum = signal<number | null>(null);
  faltapassivo = signal<number | null>(null);
  pagonomesaum = signal<number | null>(null);
  pagonomespassivo = signal<number | null>(null);
  alvo = signal<number | null>(null);
  meta: number;
  bp: number;

  constructor() {}
  
  

  async ngOnInit() {
  
      try {
        this.loading.show('Carregando dados do balanço...');

        // Executar carregamentos em paralelo
        await Promise.all([
          this
            .rlbp()
            .then((val:number) => (this.saldoReceitaLiquida = val * -1)),
          this.pegarAUM(),
          this.pegarSuperavit(),
          this.obterBM(),
          this.benchmarks(),
        ]);

        // Após carregar dados principais
        this.bm.getBmark('Mlb5v3nyBxYFS3xdWlQU').then((value) => {
          this.alvo.set(value);
        });

        this.loading.hide();
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        this.loading.hide();
      }

       this.obterDados(
      'natureza',
      '==',
      'ativo',
      true,
      this.ctasAtivo,
      this.saldoAtivo
    );
    this.obterDados(
      'natureza',
      '==',
      'passivo',
      true,
      this.ctasPassivo,
      this.saldoPassivo
    );
    this.obterDados(
      'natureza',
      '==',
      'despesa',
      true,
      this.ctasDespesa,
      this.saldoDespesa
    );
    this.obterDados(
      'natureza',
      '==',
      'receita',
      true,
      this.ctasReceita,
      this.saldoReceita
    );
    this.obterDados(
      'natureza',
      '==',
      'resultado',
      true,
      this.ctasResultado,
      this.saldoResultado
    );

     this.obterDados(
      'mod_despesa',
      'in',
      ['compromissada', 'gerenciável'],
      true,
      this.ctasDespLiq,
      this.saldoDespLiq
    );

    this.obterDados(
      'mod_despesa',
      '==',
      'compromissada',
      true,
      this.ctasDespComp,
      this.saldoDespComp
    );
    this.obterDados(
      'mod_despesa',
      '==',
      'gerenciável',
      true,
      this.ctasDespGer,
      this.saldoDespGer
    );
    this.obterDados(
      'cod',
      'in',
      [32, 35, 37, 39, 40],
      true,
      this.ctasDFO,
      this.saldoDFO
    );
      this.pegarSuperavit();
   

    this.andamento.set(this.ts.diasDecorridos() / 365);
    console.log(this.andamento());

    //this.pegarReceitaLiquida();
    this.obterBM();

    this.benchmarks();

    this.ts.difAposentadoria();
    this.bm.falta2034();
    this.obterDivAUM();

    this.bm.getBmark('Mlb5v3nyBxYFS3xdWlQU').then((value) => {
      this.alvo.set(value);
      console.log(this.alvo());
    });
    
  }

  async rlbp(){

    let rl = await this.ag2.getNestedFieldValueClient('sh_agregados', '7yLtE9Loqo2Q416w9ndK', 'ano2026.total');
    return rl

  }

  // Efeito para atualizar os benchmarks quando os valores relevantes mudarem
  private benchmarkUpdaterEffect = effect(
    () => {
      const passAum = this.pass_aum();
      const bmPassAum = this.bm_passaum();
      const passAtivo = this.pass_ativo(); // Precisa ler estes também para a segunda parte
      const bmPassAtivo = this.bm_passativo();
      this.faltaaum.set(this.bm.faltaatgAUM());
      this.faltapassivo.set(this.bm.faltazerarPassivo());
      this.falta1.set(
        computed(() => this.saldoPassivo() - this.aum() * this.bm_passaum())()
      );
      console.log(this.saldoPassivo(), this.saldoResultado(), this.superavit());
      (this.bp =
        this.saldoPassivo() + this.saldoResultado() + this.superavit()),
        console.log('BP calculado:', this.bp);
      console.log(
        this.aum(),
        this.bm_passaum(),
        this.saldoPassivo(),
        this.falta1()
      );
      console.log(this.saldoDespLiq());
      console.log(this.saldoDespComp(), this.saldoDespGer());
      console.log('Effect triggered. Checking benchmark conditions...');
      console.log(`pass_aum: ${passAum}, bm_passaum: ${bmPassAum}`);
      console.log(`pass_ativo: ${passAtivo}, bm_passativo: ${bmPassAtivo}`);

      // Verifica se os valores são números válidos antes de comparar e atualizar
      // Atualização para pass_aum
      if (typeof passAum === 'number' && typeof bmPassAum === 'number') {
        if (passAum < bmPassAum) {
          console.log(
            'Condição pass_aum < bm_passaum ATENDIDA. Atualizando Firestore...'
          );
          this.atualizarDocumentoBmark('W7zolR6QYzgVpUtagzXc', passAum)
            .then(() => console.log('Atualização BMark pass_aum concluída.'))
            .catch((err) =>
              console.error('Erro ao atualizar BMark pass_aum:', err)
            );
        } else {
          console.log('Benchmark pass_aum não alcançado.');
        }
      } else {
        console.log(
          'Valores para pass_aum ainda não estão prontos (não são números).'
        );
      }

      // Atualização para pass_ativo
      if (typeof passAtivo === 'number' && typeof bmPassAtivo === 'number') {
        if (passAtivo < bmPassAtivo) {
          console.log(
            'Condição pass_ativo < bm_passativo ATENDIDA. Atualizando Firestore...'
          );
          this.atualizarDocumentoBmark('KG4GAhPVrgCu5BG24Hng', passAtivo)
            .then(() => console.log('Atualização BMark pass_ativo concluída.'))
            .catch((err) =>
              console.error('Erro ao atualizar BMark pass_ativo:', err)
            );
        } else {
          console.log('Benchmark pass_ativo não alcançado.');
        }
      } else {
        console.log(
          'Valores para pass_ativo ainda não estão prontos (não são números).'
        );
      }
    },
    { allowSignalWrites: true }
  ); // Necessário se o effect causa escritas (como chamar updateDoc indiretamente)

  // Função auxiliar para evitar repetição no update
  private async atualizarDocumentoBmark(docId: string, novoAlvo: number) {
    const docRef = doc(this.fs.db, 'bmark', docId);
    try {
      await updateDoc(docRef, {
        alvo: novoAlvo,
        atualizacao: Timestamp.now(),
      });
    } catch (error) {
      console.error(`Erro ao atualizar documento ${docId}:`, error);
      // Você pode querer relançar o erro ou tratar de outra forma
      throw error;
    }
  }

  async obterBM() {
    this.bm_passativo.set(await this.bm.getBmark('KG4GAhPVrgCu5BG24Hng'));
    this.bm_passaum.set(await this.bm.getBmark('W7zolR6QYzgVpUtagzXc'));
    this.bm_recdespliq.set(await this.bm.getBmark('pmD2mv7EYLgYOFnbpFIS'));
    //console.log(this.pass_aum());
  }

  async obterDivAUM() {
    this.pagonomesaum.set(await this.bm.evolucaoAUM());
    console.log(this.pagonomesaum())
    this.pagonomespassivo.set(await this.bm.evolucaoPassivo());
  }

  async obterDados(param, equal, param2, bool, sig, sig2) {
    try {
      const fonte = await this.cs.pegarContasNatureza(
        param,
        equal,
        param2,
        bool
      );
      sig.set(fonte);
      const saldo = this.ts.roundToTwoDecimals(await this.totalizar(sig()));
      if (saldo < 0) {
        sig2.set(saldo * -1);
      } else {
        sig2.set(saldo);
      }
    } catch (error) {
      alert('erro na obtencao dos dados');
      console.error(error);
    }
  }

  totalizar(fonte) {
    const total = computed(() => fonte.reduce((a, b) => a + b.saldo, 0));
    return total();
  }

  async pegarAUM() {
    this.aum.set(await this.as.pegarAUM());
  }

  async pegarSuperavit() {
    await this.obterDados(
      'natureza',
      '==',
      'despesa',
      true,
      this.ctasDespesa,
      this.saldoDespesa
    );
    await this.obterDados(
      'natureza',
      '==',
      'receita',
      true,
      this.ctasReceita,
      this.saldoReceita
    );
    console.log(this.saldoDespesa(), this.saldoReceita());
    let fim = computed(() => this.saldoReceita() - this.saldoDespesa());
    this.superavit.set(fim());
  }

  async benchmarks() {
    await this.obterDados(
      'natureza',
      '==',
      'ativo',
      true,
      this.ctasAtivo,
      this.saldoAtivo
    );
    await this.obterDados(
      'natureza',
      '==',
      'passivo',
      true,
      this.ctasPassivo,
      this.saldoPassivo
    );
    await this.pegarAUM();

    this.pass_ativo.set(
      computed(() => {
        const pass = this.saldoPassivo();
        const ativo = this.saldoAtivo();
        if (
          typeof pass !== 'number' ||
          typeof ativo !== 'number' ||
          ativo === 0
        )
          return null;
        return Number((pass / ativo).toFixed(3));
      })()
    );
    this.falta0.set(
      computed(
        () => this.saldoPassivo() - this.saldoAtivo() * this.bm_passativo()
      )()
    );
    //this.pass_aum.set(computed(() => this.saldoPassivo() / this.aum())());

    this.pass_aum.set(
      computed(() => {
        const pass = this.saldoPassivo();
        const aum = this.aum();
        if (typeof pass !== 'number' || typeof aum !== 'number' || aum === 0)
          return null;
        return Number((pass / aum).toFixed(3));
      })()
    );
    this.falta0.set(
      computed(
        () => this.saldoPassivo() - this.saldoAtivo() * this.bm_passativo()
      )()
    );

    //console.log(this.pass_aum())
    //this.falta1.set(computed(() => this.saldoPassivo() - (this.aum() * this.bm_passaum()))());
    //console.log(this.falta1())

    await this.ag2.atualizarValoresPorMes(
      '9r9xraRfB4VJNr46WYji',
      this.mes,
      this.pass_ativo()
    );
    await this.ag2.atualizarValoresPorMes(
      'nP9lXcU9fAUgdQWaLmIJ',
      this.mes,
      this.pass_aum()
    );
    await this.ag2.atualizarValoresPorMes(
      'nP9lXcU9fAUgdQWaLmIJ',
      12,
      this.pass_aum()
    );
    await this.ag2.atualizarValoresPorMes(
      '0AVwFNrr2L0iAhm5vkSp',
      this.mes,
      this.saldoPassivo() * -1
    );
    await this.ag2.atualizarValoresPorMes(
      'AmWuqcCmRZ3ZzgH7kEbO',
      this.mes,
      this.saldoAtivo()
    );
    await this.ag2.atualizarValoresPorMes(
      'Zy0E3sWi0nIsYX3WHGTr',
      this.mes,
      this.saldoResultado()
    );
    await this.ag2.atualizarValoresPorMes(
      'Zy0E3sWi0nIsYX3WHGTr',
      12,
      this.saldoResultado()
    );

    await this.ag2.atualizarValoresPorMes(
      'vDi7ftEXgHavCzngGik5',
      12,
      this.saldoDespesa()
    ); //despesatotal
    await this.ag2.atualizarValoresPorMes(
      'TQxibYZpx7k7CbSz7DGg',
      12,
      this.saldoReceita() * -1
    ); //receitatotal
    await this.ag2.atualizarValoresPorMes(
      'BB9Wo3WLdeFanctk8fYH',
      12,
      this.saldoDespLiq()
    ); //despesaliquidatotal
    // await this.ag2.atualizarValoresPorMes(
    //   '7yLtE9Loqo2Q416w9ndK',
    //   12,
    //   this.saldoReceitaLiquida * -1
    // ); //receitaliquidatotal
    await this.ag2.atualizarValoresPorMes(
      'RON4QGNrj8ZykZrQJSuU',
      12,
      this.saldoDespComp()
    ); //despesacomptotal
    await this.ag2.atualizarValoresPorMes(
      'v9cgg3wHHiVAgkuqlbvc',
      12,
      this.saldoDespGer()
    ); //despesagertotal
    await this.ag2.atualizarValoresPorMes(
      'lkZLhYcIZPtXMp6JLcF3',
      12,
      this.saldoDespLiq() / this.saldoReceitaLiquida
    );
    await this.ag2.atualizarValoresPorMes(
      '3TDHxqu8M25B3DjtNVWs',
      12,
      this.saldoDespesa() / this.saldoReceita()
    );
    await this.ag2.atualizarValoresPorMes(
      'dBhgmT8mW1aPtj12tZQc',
      12,
      this.saldoDFO()
    ); //saldoDFO
  }
  getProgress(numerador, denominador) {
    const progress = (numerador / denominador) * 100;
    return progress.toFixed(2) + '%'; // Formata como porcentagem com 2 casas decimais
  }
}
