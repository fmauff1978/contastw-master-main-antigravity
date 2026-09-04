import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Contas2Service } from '../../services/contas2.service';
import { TimestampService } from '../../services/timestamp.service';
import { RecliquidaService } from '../../services/recliquida.service';
import { AumService } from '../../services/aum.service';
import { Agreg2Service } from '../../services/agreg2.service';

interface TickerItem {
  label: string;
  value: number;
  type?: 'currency' | 'percent' | 'number';
  color?: string;
}

@Component({
  selector: 'app-ticker',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full overflow-hidden border-t border-b border-gray-700 my-8">
      <div class="ticker-wrapper">
        <div class="ticker-track">
          <ng-container
            *ngFor="let _ of [].constructor(duplicates); let i = index"
          >
            <ng-container *ngFor="let item of items">
              <div class="ticker-item text-base">
                {{ item.label }}:
                <span [class]="item.color || 'text-white'" class="font-medium">
                  {{
                    item.type === 'currency'
                      ? (item.value | currency : 'BRL')
                      : item.type === 'percent'
                      ? (item.value | percent : '1.2-2' : 'pt-BR')
                      : (item.value | number)
                  }}
                </span>
              </div>
            </ng-container>
          </ng-container>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .ticker-wrapper {
        width: 100%;
        overflow: hidden;
        white-space: nowrap;
        background-color: rgba(17, 24, 39, 0.95);
        padding: 0.75rem 0;
      }

      .ticker-track {
        display: inline-block;
        white-space: nowrap;
        animation: ticker 50s linear infinite;
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
export class TickerComponent {
  cs = inject(Contas2Service);
  ts = inject(TimestampService);
  rl = inject(RecliquidaService);
  as = inject(AumService);
  ag2 = inject(Agreg2Service);

  @Input() items: TickerItem[] = [];
  @Input() duplicates: number = 1; // Quantas vezes duplicar os itens para melhor animação

  private calcularSaldo(contas: any[]): number {
    return contas.reduce((acc, conta) => acc + (conta.saldo || 0), 0);
  }

  ngOnInit() {
    // Carrega os dados iniciais
    this.loadData();
    // Atualiza os dados a cada 30 segundos
    setInterval(() => this.loadData(), 30000);
  }

  private async loadData() {
    try {
      // DespLiquidas
      const despLiq = await this.cs.pegarContasNatureza(
        'mod_despesa',
        'in',
        ['compromissada', 'gerenciável'],
        true
      );
      const saldoDespLiq = this.calcularSaldo(despLiq);

      // Despesas Gerenciáveis
      const despGer = await this.cs.pegarContasNatureza(
        'mod_despesa',
        '==',
        'gerenciável',
        true
      );
      const saldoDespGer0 = this.calcularSaldo(despGer);
      const saldoDespGer = saldoDespGer0 / saldoDespLiq;

      // Despesas Compromissadas
      const despComp = await this.cs.pegarContasNatureza(
        'mod_despesa',
        '==',
        'compromissada',
        true
      );
      const saldoDespComp0 = this.calcularSaldo(despComp);
      const saldoDespComp = saldoDespComp0 / saldoDespLiq;

      //Media Movel

      const mm = await this.rl.mediamovel();

      //Renda Passiva

      const rp = await this.as.rendaPassiva();

      //Renda Alvo

      const ra = await this.as.pegarRendaAlvo();

      //Indices economicos

      const ie = await this.as.pegarIndicesEconomicos();
      const usd = this.ts.roundToTwoDecimals(ie[1].projecao);
      const euro = this.ts.roundToTwoDecimals(ie[2].projecao);
      const btc = this.ts.roundToTwoDecimals(ie[3].projecao);
      const ibov = this.ts.roundToTwoDecimals(ie[4].projecao);
      const bbas = this.ts.roundToTwoDecimals(ie[5].projecao);
      //AGREGADOS DESPESAS

      const agregados = await this.ag2.pegarTab3();

      console.log('Agregados Ticker:', agregados);

      const prim = agregados[0];
      const prim0 = prim.agregado;
      const prim1 = this.ts.roundToTwoDecimals(prim.ano2025.total);
      const seg = agregados[1];
      const seg0 = seg.agregado;
      const seg1 = this.ts.roundToTwoDecimals(seg.ano2025.total);
      const ter = agregados[2];
      const ter0 = ter.agregado;
      const ter1 = this.ts.roundToTwoDecimals(ter.ano2025.total);
      const quar = agregados[3];
      const quar0 = quar.agregado;
      const quar1 = this.ts.roundToTwoDecimals(quar.ano2025.total);
      const quin = agregados[4];
      const quin0 = quin.agregado;
      const quin1 = this.ts.roundToTwoDecimals(quin.ano2025.total);

      // Atualiza os itens do ticker
      this.items = [
        {
          label: 'Despesas Compromissadas',
          value: saldoDespComp,
          type: 'percent',
          color: 'text-red-400',
        },
        {
          label: 'Despesas Gerenciáveis',
          value: saldoDespGer,
          type: 'percent',
          color: 'text-red-400',
        },
        {
          label: prim0,
          value: prim1,
          type: 'currency',
          color: 'text-red-400',
        },

        {
          label: seg0,
          value: seg1,
          type: 'currency',
          color: 'text-red-400',
        },

        {
          label: ter0,
          value: ter1,
          type: 'currency',
          color: 'text-red-400',
        },

        {
          label: quar0,
          value: quar1,
          type: 'currency',
          color: 'text-red-400',
        },
        {
          label: quin0,
          value: quin1,
          type: 'currency',
          color: 'text-red-400',
        },

        {
          label: 'Alvo 2034 USD',
          value: usd,
          type: 'currency',
          color: 'text-white-400',
        },
        {
          label: 'Alvo 2034 EUR',
          value: euro,
          type: 'currency',
          color: 'text-white-400',
        },
        {
          label: 'Alvo 2034 BTC',
          value: btc,
          type: 'currency',
          color: 'text-white-400',
        },
        {
          label: 'Alvo 2034 IBOV',
          value: ibov,
          type: 'currency',
          color: 'text-white-400',
        },
        {
          label: 'Alvo 2034 BBAS3',
          value: bbas,
          type: 'currency',
          color: 'text-white-400',
        },

        {
          label: 'Renda Alvo 2034',
          value: ra,
          type: 'currency',
          color: 'text-white-400',
        },
        {
          label: 'Receita Liquida Média 12 meses',
          value: mm,
          type: 'currency',
          color: 'text-white-400',
        },
        {
          label: 'Renda Passiva HOJE',
          value: rp,
          type: 'currency',
          color: 'text-white-400',
        },
      ];
    } catch (error) {
      console.error('Erro ao carregar dados do ticker:', error);
    }
  }
}
