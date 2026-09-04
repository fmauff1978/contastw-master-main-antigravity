import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { Timestamp } from 'firebase/firestore';
import { TimestampService } from '../../services/timestamp.service';
import { ChartModule } from 'primeng/chart';
import { FirestoreService } from '../../services/firestore.service';
import { StService } from '../../services/st.service';
import { Agreg2Service } from '../../services/agreg2.service';
import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-st2',
  imports: [CommonModule, ChartModule],
  templateUrl: './st2.component.html',
  styleUrl: './st2.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class St2Component implements OnInit {
  ts = inject(TimestampService);
  fs = inject(FirestoreService);
  st = inject(StService);
  ag2 = inject(Agreg2Service);
  platformId = inject(PLATFORM_ID);

  posicao: Timestamp;
  data: any;
  options: any;
  data2: any;
  options2: any;
  data3: any;
  options3: any;
  data4: any;
  options4: any;
  data5: any;
  options5: any;
  data6: any;
  options6: any;
  ano = new Date().getFullYear();
  mes = new Date().getMonth() ;
  meses = [
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
  periodo = [
    'Jan/25',
    'Fev/25',
    'Mar/25',
    'Abr/25',
    'Mai/25',
    'Jun/25',
    'Jul/25',
    'Ago/25',
    'Set/25',
    'Out/25',
    'Nov/25',
    'Dez/25',
    'Jan/26',
    'Fev/26',
    'Mar/26',
    'Abr/26',
    'Mai/26',
    'Jun/26',
    'Jul/26',
    'Ago/26',
    'Set/26',
    'Out/26',
    'Nov/26',
    'Dez/26',
  ];
  periodo2: string[] = [
    'Jan/22',
    'Fev/22',
    'Mar/22',
    'Abr/22',
    'Mai/22',
    'Jun/22',
    'Jul/22',
    'Ago/22',
    'Set/22',
    'Out/22',
    'Nov/22',
    'Dez/22',
    'Jan/23',
    'Fev/23',
    'Mar/23',
    'Abr/23',
    'Mai/23',
    'Jun/23',
    'Jul/23',
    'Ago/23',
    'Set/23',
    'Out/23',
    'Nov/23',
    'Dez/23',
    'Jan/24',
    'Fev/24',
    'Mar/24',
    'Abr/24',
    'Mai/24',
    'Jun/24',
    'Jul/24',
    'Ago/24',
    'Set/24',
    'Out/24',
    'Nov/24',
    'Dez/24',
    'Jan/25',
    'Fev/25',
    'Mar/25',
    'Abr/25',
    'Mai/25',
    'Jun/25',
    'Jul/25',
    'Ago/25',
    'Set/25',
    'Out/25',
    'Nov/25',
    'Dez/25',
    'Jan/26',
    'Fev/26',
    'Mar/26',
    'Abr/26',
    'Mai/26',
    'Jun/26',
    'Jul/26',
    'Ago/26',
    'Set/26',
    'Out/26',
    'Nov/26',
    'Dez/26',
  ];
  anobd: string;
  anobd2: string;
  fonte: any[] = [];
  fonte0: any[] = [];
 
  

  constructor(private cd: ChangeDetectorRef, private loading: LoadingService) {
    this.fs.conectar();
  }

  async ngOnInit() {
    this.loading.show('Carregando gráficos...');
    try {
      this.posicao = await this.ts.log();

      await Promise.all([
        this.initChartDespLiquidasAnuais(),
        this.initChartRecLiquidasAnuais(),
        this.initChartDespxRecLiquidas(
          'BB9Wo3WLdeFanctk8fYH',
          'Despesa Líquida',
          '7yLtE9Loqo2Q416w9ndK',
          'Receita Líquida',
        ),
        this.initChartDespesasAgrupado(),
        this.initChartDespEnq(),
        this.initChartDespEnq2(),
        (async () => {
          this.anobd = await this.st.pegarIDdoano(
            'seriestemporais_despliq',
            this.ano,
          );
          this.anobd2 = await this.st.pegarIDdoano(
            'seriestemporais_recliq',
            this.ano,
          );
          await this.st.calcMes(
            'BB9Wo3WLdeFanctk8fYH',
            'seriestemporais_despliq',
            this.anobd,
            this.fonte,
            this.mes,
          );
          await this.st.calcMes(
            '7yLtE9Loqo2Q416w9ndK',
            'seriestemporais_recliq',
            this.anobd2,
            this.fonte0,
            this.mes,
          );
          await this.st.pegarProj();
        })(),
      ]);
    } finally {
      this.loading.hide();
    }
  }

  async initChartDespLiquidasAnuais() {
    let despliq: any[] = [];
    let proj: any[] = [];
    proj = await this.st.pegarProj();
    let proj1 = proj[1].ano2026;
    console.log(proj1);
    despliq = await this.st.pegarDespLiq();
    if (isPlatformBrowser(this.platformId)) {
      const documentStyle = getComputedStyle(document.documentElement);
      const textColor = documentStyle.getPropertyValue('--p-text-color');
      const textColorSecondary = documentStyle.getPropertyValue(
        '--p-text-muted-color',
      );
      const surfaceBorder = documentStyle.getPropertyValue(
        '--p-content-border-color',
      );

      this.data = {
        labels: this.meses,
        datasets: [
          {
            label: this.ano - 4,
            data: [
              despliq[0].jan,
              despliq[0].fev,
              despliq[0].mar,
              despliq[0].abr,
              despliq[0].mai,
              despliq[0].jun,
              despliq[0].jul,
              despliq[0].ago,
              despliq[0].set,
              despliq[0].out,
              despliq[0].nov,
              despliq[0].dez,
            ],
            fill: false,
            borderDash: [6, 3],
            borderColor: documentStyle.getPropertyValue('--p-red-100'),
            tension: 0.4,
          },
          {
            label: this.ano - 3,
            data: [
              despliq[1].jan,
              despliq[1].fev,
              despliq[1].mar,
              despliq[1].abr,
              despliq[1].mai,
              despliq[1].jun,
              despliq[1].jul,
              despliq[1].ago,
              despliq[1].set,
              despliq[1].out,
              despliq[1].nov,
              despliq[1].dez,
            ],
            fill: false,
            borderDash: [6, 3],
            borderColor: documentStyle.getPropertyValue('--p-red-300'),
            tension: 0.4,
          },
          {
            label: this.ano - 2,
            data: [
              despliq[2].jan,
              despliq[2].fev,
              despliq[2].mar,
              despliq[2].abr,
              despliq[2].mai,
              despliq[2].jun,
              despliq[2].jul,
              despliq[2].ago,
              despliq[2].set,
              despliq[2].out,
              despliq[2].nov,
              despliq[2].dez,
            ],
            fill: false,
            borderDash: [6, 3],
            borderColor: documentStyle.getPropertyValue('--p-red-500'),
            tension: 0.4,
          },

          {
            label: this.ano - 1,
            data: [
              despliq[3].jan,
              despliq[3].fev,
              despliq[3].mar,
              despliq[3].abr,
              despliq[3].mai,
              despliq[3].jun,
              despliq[3].jul,
              despliq[3].ago,
              despliq[3].set,
              despliq[3].out,
              despliq[3].nov,
              despliq[3].dez,
            ],
            fill: false,
            borderDash: [6, 3],
            borderColor: documentStyle.getPropertyValue('--p-red-700'),
            tension: 0.4,
          },

          {
            label: this.ano,
            data: [
              despliq[4].jan,
              despliq[4].fev,
              despliq[4].mar,
              despliq[4].abr,
              despliq[4].mai,
              despliq[4].jun,
              despliq[4].jul,
              despliq[4].ago,
              despliq[4].set,
              despliq[4].out,
              despliq[4].nov,
              despliq[4].dez,
            ],
            

            fill: true,
            backgroundColor: 'rgba(250, 96, 7, 0.2)',

            borderColor: documentStyle.getPropertyValue('--p-red-900'),
            tension: 0.4,
          },

           {
            label: "projeção para o ano",
            data: [
              proj1.jan,
              proj1.fev,
              proj1.mar,
              proj1.abr,
              proj1.mai,
              proj1.jun,
              proj1.jul,
              proj1.ago,
              proj1.set,
              proj1.out,
              proj1.nov,
              proj1.dez,
            ],
            

           
            borderWidth: 4,
            borderColor: "peachpuff",
            borderDash: [9, 1],
           
            tension: 0.2,
          },
        ],
      };

      this.options = {
        maintainAspectRatio: false,
        aspectRatio: 0.6,
        plugins: {
          legend: {
            labels: {
              color: textColor,
            },
          },
        },
        scales: {
          x: {
            ticks: {
              color: textColorSecondary,
            },
            grid: {
              color: surfaceBorder,
              drawBorder: false,
            },
          },
          y: {
            ticks: {
              color: textColorSecondary,
            },
            grid: {
              color: surfaceBorder,
              drawBorder: false,
            },
          },
        },
      };
      this.cd.markForCheck();
    }
  }
  async initChartRecLiquidasAnuais() {
    let recliq: any[] = [];
    let proj: any[] = [];
    proj = await this.st.pegarProj();
    let proj1 =  proj[0].ano2026;
    console.log(proj1);
    recliq = await this.st.pegarRecLiq();
    if (isPlatformBrowser(this.platformId)) {
      const documentStyle = getComputedStyle(document.documentElement);
      const textColor = documentStyle.getPropertyValue('--p-text-color');
      const textColorSecondary = documentStyle.getPropertyValue(
        '--p-text-muted-color',
      );
      const surfaceBorder = documentStyle.getPropertyValue(
        '--p-content-border-color',
      );

      this.data2 = {
        labels: this.meses,
        datasets: [
          {
            label: this.ano - 4,
            data: [
              recliq[0].jan,
              recliq[0].fev,
              recliq[0].mar,
              recliq[0].abr,
              recliq[0].mai,
              recliq[0].jun,
              recliq[0].jul,
              recliq[0].ago,
              recliq[0].set,
              recliq[0].out,
              recliq[0].nov,
              recliq[0].dez,
            ],
            fill: false,
            borderDash: [6, 3],
            borderColor: documentStyle.getPropertyValue('--p-blue-100'),
            tension: 0.4,
          },
          {
            label: this.ano - 3,
            data: [
              recliq[1].jan,
              recliq[1].fev,
              recliq[1].mar,
              recliq[1].abr,
              recliq[1].mai,
              recliq[1].jun,
              recliq[1].jul,
              recliq[1].ago,
              recliq[1].set,
              recliq[1].out,
              recliq[1].nov,
              recliq[1].dez,
            ],
            fill: false,
            borderDash: [6, 3],
            borderColor: documentStyle.getPropertyValue('--p-blue-300'),
            tension: 0.4,
          },
          {
            label: this.ano - 2,
            data: [
              recliq[2].jan,
              recliq[2].fev,
              recliq[2].mar,
              recliq[2].abr,
              recliq[2].mai,
              recliq[2].jun,
              recliq[2].jul,
              recliq[2].ago,
              recliq[2].set,
              recliq[2].out,
              recliq[2].nov,
              recliq[2].dez,
            ],
            fill: false,
            borderDash: [6, 3],
            borderColor: documentStyle.getPropertyValue('--p-blue-500'),
            tension: 0.4,
          },

          {
            label: this.ano - 1,
            data: [
              recliq[3].jan,
              recliq[3].fev,
              recliq[3].mar,
              recliq[3].abr,
              recliq[3].mai,
              recliq[3].jun,
              recliq[3].jul,
              recliq[3].ago,
              recliq[3].set,
              recliq[3].out,
              recliq[3].nov,
              recliq[3].dez,
            ],
            fill: false,
            borderDash: [6, 3],
            borderColor: documentStyle.getPropertyValue('--p-blue-700'),
            tension: 0.4,
          },

          {
            label: this.ano,
            data: [
              recliq[4].jan,
              recliq[4].fev,
              recliq[4].mar,
              recliq[4].abr,
              recliq[4].mai,
              recliq[4].jun,
              recliq[4].jul,
              recliq[4].ago,
              recliq[4].set,
              recliq[4].out,
              recliq[4].nov,
              recliq[4].dez,
            ],

            fill: true,
            backgroundColor: 'rgba(7, 141, 250, 0.2)',

            borderColor: documentStyle.getPropertyValue('--p-blue-900'),
            tension: 0.4,
          },
            {
            label: "projeção para o ano",
            data: [
              proj1.jan,
              proj1.fev,
              proj1.mar,
              proj1.abr,
              proj1.mai,
              proj1.jun,
              proj1.jul,
              proj1.ago,
              proj1.set,
              proj1.out,
              proj1.nov,
              proj1.dez,
            ],
            

           
           borderWidth: 4,
            borderDash: [9, 1],
            borderColor: "peachpuff",
            tension: 0.2,
          },
        ],
      };

      this.options = {
        maintainAspectRatio: false,
        aspectRatio: 0.6,
        plugins: {
          legend: {
            labels: {
              color: textColor,
            },
          },
        },
        scales: {
          x: {
            ticks: {
              color: textColorSecondary,
            },
            grid: {
              color: surfaceBorder,
              drawBorder: false,
            },
          },
          y: {
            ticks: {
              color: textColorSecondary,
            },
            grid: {
              color: surfaceBorder,
              drawBorder: false,
            },
          },
        },
      };
      this.cd.markForCheck();
    }
  }

  async initChartDespxRecLiquidas(id1, label1, id2, label2) {
    if (isPlatformBrowser(this.platformId)) {
      const documentStyle = getComputedStyle(document.documentElement);
      const textColor = documentStyle.getPropertyValue('--p-text-color');
      const textColorSecondary = documentStyle.getPropertyValue(
        '--p-text-muted-color',
      );
      const surfaceBorder = documentStyle.getPropertyValue(
        '--p-content-border-color',
      );

      const dadosParaGrafico = await this.st.consulta(id1); // Chame a função UMA VEZ

      const dadosParaGrafico2 = await this.st.consultaNegativos(id2); // Chame a função UMA VEZ

      this.data3 = {
        labels: this.periodo,

        datasets: [
          {
            label: label1,
            data: dadosParaGrafico,
            backgroundColor: [
              'rgba(249, 115, 22, 0.2)',
              'rgba(6, 182, 212, 0.2)',
              'rgb(107, 114, 128, 0.2)',
              'rgba(139, 92, 246, 0.2)',
            ],
            borderColor: ['rgb(181, 6, 6)'],
            borderWidth: 3,
            tension: 0.4,
          },
          {
            label: label2,
            data: dadosParaGrafico2,
            fill: true,
            backgroundColor: 'rgba(111, 84, 233, 0.2)',
            // backgroundColor: [
            //   'rgba(249, 115, 22, 0.2)',
            //   'rgba(6, 182, 212, 0.2)',
            //   'rgb(107, 114, 128, 0.2)',
            //   'rgba(139, 92, 246, 0.2)',
            // ],
            borderColor: ['rgb(59, 9, 176)'],
            borderWidth: 4,
            tension: 0.4,
          },
        ],
      };

      this.options3 = {
        plugins: {
          legend: {
            labels: {
              color: textColor,
            },
          },
        },
        scales: {
          x: {
            ticks: {
              color: textColorSecondary,
            },
            grid: {
              color: surfaceBorder,
            },
          },
          y: {
            beginAtZero: true,
            ticks: {
              color: textColorSecondary,
            },
            grid: {
              color: surfaceBorder,
            },
          },
        },
      };
      this.cd.markForCheck();
    }
  }

  async initChartDespesasAgrupado() {
    let despenq = await this.ag2.pegarDespEnq();
    console.log(despenq);
    let teste = await this.st.extrairTotaisAnuais(despenq[0]);
    console.log(teste);

    if (isPlatformBrowser(this.platformId)) {
      const documentStyle = getComputedStyle(document.documentElement);
      const textColor = documentStyle.getPropertyValue('--p-text-color');
      const textColorSecondary = documentStyle.getPropertyValue(
        '--p-text-muted-color',
      );
      const surfaceBorder = documentStyle.getPropertyValue(
        '--p-content-border-color',
      );

      this.data4 = {
        labels: [
          despenq[0].agregado,
          despenq[1].agregado,
          despenq[2].agregado,
          despenq[3].agregado,
          despenq[4].agregado,
          despenq[5].agregado,
          despenq[6].agregado,
          despenq[7].agregado,
          despenq[8].agregado,
          despenq[9].agregado,
        ],
        datasets: [
          {
            label: this.ano - 4,
            backgroundColor: documentStyle.getPropertyValue('--p-red-900'),
            borderColor: documentStyle.getPropertyValue('--p-red-900'),

            data: [
              despenq[0].ano2022.total,
              despenq[1].ano2022.total,
              despenq[2].ano2022.total,
              despenq[3].ano2022.total,
              despenq[4].ano2022.total,
              despenq[5].ano2022.total,
              despenq[6].ano2022.total,
              despenq[7].ano2022.total,
              despenq[8].ano2022.total,
              despenq[9].ano2022.total,
            ],
          },
          {
            label: this.ano - 3,
            backgroundColor: documentStyle.getPropertyValue('--p-red-600'),
            borderColor: documentStyle.getPropertyValue('--p-red-600'),

            data: [
              despenq[0].ano2023.total,
              despenq[1].ano2023.total,
              despenq[2].ano2023.total,
              despenq[3].ano2023.total,
              despenq[4].ano2023.total,
              despenq[5].ano2023.total,
              despenq[6].ano2023.total,
              despenq[7].ano2023.total,
              despenq[8].ano2023.total,
              despenq[9].ano2023.total,
            ],
          },
          {
            label: this.ano - 2,
            backgroundColor: documentStyle.getPropertyValue('--p-red-400'),
            borderColor: documentStyle.getPropertyValue('--p-red-400'),
            data: [
              despenq[0].ano2024.total,
              despenq[1].ano2024.total,
              despenq[2].ano2024.total,
              despenq[3].ano2024.total,
              despenq[4].ano2024.total,
              despenq[5].ano2024.total,
              despenq[6].ano2024.total,
              despenq[7].ano2024.total,
              despenq[8].ano2024.total,
              despenq[9].ano2024.total,
            ],
          },
          {
            label: this.ano - 1,
            backgroundColor: documentStyle.getPropertyValue('--p-red-300'),
            borderColor: documentStyle.getPropertyValue('--p-red-300'),
            data: [
              despenq[0].ano2025.total,
              despenq[1].ano2025.total,
              despenq[2].ano2025.total,
              despenq[3].ano2025.total,
              despenq[4].ano2025.total,
              despenq[5].ano2025.total,
              despenq[6].ano2025.total,
              despenq[7].ano2025.total,
              despenq[8].ano2025.total,
               despenq[9].ano2025.total,
            ],
          },
          {
            label: this.ano,
            backgroundColor: documentStyle.getPropertyValue('--p-orange-300'),
            borderColor: documentStyle.getPropertyValue('--p-orange-300'),
            data: [
              despenq[0].ano2026.total,
              despenq[1].ano2026.total,
              despenq[2].ano2026.total,
              despenq[3].ano2026.total,
              despenq[4].ano2026.total,
              despenq[5].ano2026.total,
              despenq[6].ano2026.total,
              despenq[7].ano2026.total,
              despenq[8].ano2026.total,
              despenq[9].ano2026.total,
            ],
          },
        ],
      };

      this.options4 = {
        maintainAspectRatio: false,
        aspectRatio: 0.8,

        plugins: {
          legend: {
            labels: {
              color: textColor,
            },
          },
        },
        scales: {
          x: {
            type: 'category',
            barPercentage: 0.7,
            categoryPercentage: 0.8,

            ticks: {
              color: textColorSecondary,
              font: {
                weight: 500,
              },
            },
            grid: {
              color: surfaceBorder,
              drawBorder: false,
            },
          },
          y: {
            beginAtZero: true, // Garante que o gráfico comece do zero
            ticks: {
              color: textColorSecondary,
            },
            grid: {
              color: surfaceBorder,
              drawBorder: false,
            },
          },
        },
      };
      this.cd.markForCheck();
    }
  }

  async initChartDespEnq() {
    let despenq = await this.ag2.pegarDespEnq();
    console.log(despenq);

    if (isPlatformBrowser(this.platformId)) {
      const documentStyle = getComputedStyle(document.documentElement);
      const textColor = documentStyle.getPropertyValue('--p-text-color');
      const textColorSecondary = documentStyle.getPropertyValue(
        '--p-text-muted-color',
      );
      const surfaceBorder = documentStyle.getPropertyValue(
        '--p-content-border-color',
      );

      const dadosParaGrafico = await this.st.extrairEOrdenarPorAno(despenq[1]);

      const dadosParaGrafico2 = await this.st.extrairEOrdenarPorAno(despenq[3]); // Chame a função UMA VEZ

      const dadosParaGrafico3 = await this.st.extrairEOrdenarPorAno(despenq[4]);
      
      const dadosParaGrafico4 = await this.st.extrairEOrdenarPorAno(despenq[8]);// Chame a função UMA VEZ

      this.data5 = {
        labels: this.periodo2,
        datasets: [
          {
            label: despenq[1].agregado,
            data: dadosParaGrafico,
            backgroundColor: [
              'rgba(249, 115, 22, 0.2)',
              'rgba(6, 182, 212, 0.2)',
              'rgb(107, 114, 128, 0.2)',
              'rgba(139, 92, 246, 0.2)',
            ],
            borderColor: ['rgb(202, 10, 68)'],
            borderWidth: 3,
            borderDash: [5, 5],
            tension: 0.4,
          },
          {
            label: despenq[3].agregado,
            data: dadosParaGrafico2,
            backgroundColor: [
              'rgba(249, 115, 22, 0.2)',
              'rgba(6, 182, 212, 0.2)',
              'rgb(107, 114, 128, 0.2)',
              'rgba(139, 92, 246, 0.2)',
            ],
            borderColor: ['rgb(247, 104, 8)'],
            borderWidth: 3,
            tension: 0.4,
            borderDash: [3, 3],
          },
          {
            label: despenq[4].agregado,
            data: dadosParaGrafico3,
            backgroundColor: [
              'rgba(249, 115, 22, 0.2)',
              'rgba(6, 182, 212, 0.2)',
              'rgb(107, 114, 128, 0.2)',
              'rgba(139, 92, 246, 0.2)',
            ],

            borderColor: ['rgb(210, 224, 7)'],
            borderWidth: 3,
            tension: 0.4,
            borderDash: [2, 2],
          },

          {
            label: despenq[8].agregado,
            data: dadosParaGrafico4,
            backgroundColor: [
              'rgba(249, 115, 22, 0.2)',
              'rgba(6, 182, 212, 0.2)',
              'rgb(107, 114, 128, 0.2)',
              'rgba(139, 92, 246, 0.2)',
            ],

            borderColor: ['rgb(12, 12, 12)'],
            borderWidth: 3,
            tension: 0.4,
            
          },
        ],
      };

      this.options5 = {
        plugins: {
          legend: {
            labels: {
              color: textColor,
            },
          },
        },
        scales: {
          x: {
            ticks: {
              color: textColorSecondary,
            },
            grid: {
              color: surfaceBorder,
            },
          },
          y: {
            beginAtZero: true,
            ticks: {
              color: textColorSecondary,
            },
            grid: {
              color: surfaceBorder,
            },
          },
        },
      };
      this.cd.markForCheck();
    }
  }

  async initChartDespEnq2() {
    let despenq = await this.ag2.pegarDespEnq();
    console.log(despenq);

    if (isPlatformBrowser(this.platformId)) {
      const documentStyle = getComputedStyle(document.documentElement);
      const textColor = documentStyle.getPropertyValue('--p-text-color');
      const textColorSecondary = documentStyle.getPropertyValue(
        '--p-text-muted-color',
      );
      const surfaceBorder = documentStyle.getPropertyValue(
        '--p-content-border-color',
      );

      const dadosParaGrafico = await this.st.extrairEOrdenarPorAno(despenq[5]);

      const dadosParaGrafico2 = await this.st.extrairEOrdenarPorAno(despenq[6]); // Chame a função UMA VEZ

      const dadosParaGrafico3 = await this.st.extrairEOrdenarPorAno(despenq[7]); // Chame a função UMA VEZ

      this.data6 = {
        labels: this.periodo2,
        datasets: [
          {
            label: despenq[5].agregado,
            data: dadosParaGrafico,
            backgroundColor: [
              'rgba(249, 115, 22, 0.2)',
              'rgba(6, 182, 212, 0.2)',
              'rgb(107, 114, 128, 0.2)',
              'rgba(139, 92, 246, 0.2)',
            ],
            borderColor: ['rgb(82, 5, 5)'],
            borderWidth: 3,
            tension: 0.4,
            borderDash: [5, 5],
          },
          {
            label: despenq[6].agregado,
            data: dadosParaGrafico2,
            backgroundColor: [
              'rgba(249, 115, 22, 0.2)',
              'rgba(6, 182, 212, 0.2)',
              'rgb(107, 114, 128, 0.2)',
              'rgba(139, 92, 246, 0.2)',
            ],
            borderColor: ['rgb(248, 212, 7)'],
            borderWidth: 3,
            tension: 0.4,
            borderDash: [3, 3],
          },
          {
            label: despenq[7].agregado,
            data: dadosParaGrafico3,
            backgroundColor: [
              'rgba(249, 115, 22, 0.2)',
              'rgba(6, 182, 212, 0.2)',
              'rgb(107, 114, 128, 0.2)',
              'rgba(139, 92, 246, 0.2)',
            ],
            borderColor: ['rgb(3, 114, 46)'],
            borderWidth: 3,
            tension: 0.4,
            borderDash: [2, 2],
          },
        ],
      };

      this.options6 = {
        plugins: {
          legend: {
            labels: {
              color: textColor,
            },
          },
        },
        scales: {
          x: {
            ticks: {
              color: textColorSecondary,
            },
            grid: {
              color: surfaceBorder,
            },
          },
          y: {
            beginAtZero: true,
            ticks: {
              color: textColorSecondary,
            },
            grid: {
              color: surfaceBorder,
            },
          },
        },
      };
      this.cd.markForCheck();
    }
  }
}
