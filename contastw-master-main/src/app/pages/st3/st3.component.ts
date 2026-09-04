import { CommonModule, isPlatformBrowser } from '@angular/common';

import {
  ChangeDetectorRef,
  Component,
  inject,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { Timestamp } from 'firebase/firestore';
import { TimestampService } from '../../services/timestamp.service';
import { Chart } from 'chart.js';
import { ChartModule } from 'primeng/chart';
import { FirestoreService } from '../../services/firestore.service';
import { StService } from '../../services/st.service';
import { Agreg2Service } from '../../services/agreg2.service';
import { LoadingService } from '../../services/loading.service';
import { AumService } from '../../services/aum.service';

@Component({
  selector: 'app-st3',
  imports: [CommonModule, ChartModule],
  templateUrl: './st3.component.html',
  styleUrl: './st3.component.css',
})
export class St3Component implements OnInit {
  ts = inject(TimestampService);
  fs = inject(FirestoreService);
  st = inject(StService);
  as = inject(AumService);

  ag3 = inject(Agreg2Service);
  platformId = inject(PLATFORM_ID);
  data: any;
  options: any;
  data2: any;
  options2: any;
  data3: any;
  options3: any;
  data4: any;
  options4: any;
  periodo = [
    'Jan24',
    'Fev24',
    'Mar24',
    'Abr24',
    'Mai24',
    'Jun24',
    'Jul24',
    'Ago24',
    'Set24',
    'Out24',
    'Nov24',
    'Dez24',
    'Jan25',
    'Fev25',
    'Mar25',
    'Abr25',
    'Mai25',
    'Jun25',
    'Jul25',
    'Ago25',
    'Set25',
    'Out25',
    'Nov25',
    'Dez25',
    'Jan26',
    'Fev26',
    'Mar26',
    'Abr26',
    'Mai26',
    'Jun26',
    'Jul26',
    'Ago26',
    'Set26',
    'Out26',
    'Nov26',
    'Dez26',
  ];

  periodo2 = [
    2001,
    2002,
    2003,
    2004,
    2005,
    2006,
    2007,
    2008,
    2009,
    2010,
    2011,
    2012,
    2013,
    2014,
    2015,
    2016,
    2017,
    2018,
    2019,
    2020,
    2021,
    2022,
    2023,
    2024,
    2025,
    'acum',
  ];

  posicao: Timestamp;
  palvspassivo: any;
  ativpassaum: any;
  data5: any;
  options5: any;
  options6: any;
  pagtopass: any;
  options15: any;

  constructor(
    private cd: ChangeDetectorRef,
    private loading: LoadingService,
  ) {
    this.fs.conectar();
  }

  async ngOnInit() {
    this.loading.show('Carregando gráficos...');
    try {
      this.posicao = await this.ts.log();
      this.st.atualizarPasPrevi();

      await Promise.all([
        this.initChart1AtivoXPassivoXAUM(
          'AmWuqcCmRZ3ZzgH7kEbO',
          'Ativo Total',
          '0AVwFNrr2L0iAhm5vkSp',
          'Passivo Total',
          'K5eDh0H5pIiTc9s6W9zy',
          'AUM',
        ),
        this.initChartPassivosemPrevi(),
        this.initChartAUM(),
        this.initChartPALvsPassivo(),
        this.initChartIndEcon(),
        this.initChartPagtoDiv(),
        this.st.atualizarPagtoPassivo(),
      ]);
    } finally {
      this.loading.hide();
    }
  }

  async initChart1AtivoXPassivoXAUM(id1, label1, id2, label2, id3, label3) {
    const dadosParaGrafico = await this.st.consulta2(id1); // Chame a função UMA VEZ

    const dadosParaGrafico2 = await this.st.consulta2(id2); // Chame a função UMA VEZ

    const dadosParaGrafico3 = await this.st.consulta2(id3); // Chame a função UMA VEZ
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
            borderColor: ['rgb(80, 10, 242)'],
            borderWidth: 3,
            tension: 0.4,
          },
          {
            label: label2,
            data: dadosParaGrafico2,
            backgroundColor: [
              'rgba(249, 115, 22, 0.2)',
              'rgba(6, 182, 212, 0.2)',
              'rgb(107, 114, 128, 0.2)',
              'rgba(139, 92, 246, 0.2)',
            ],
            borderColor: ['rgb(250, 124, 6)'],
            borderWidth: 3,
            tension: 0.4,
          },
          {
            label: label3,
            data: dadosParaGrafico3,
            backgroundColor: [
              'rgba(249, 115, 22, 0.2)',
              'rgba(6, 182, 212, 0.2)',
              'rgb(107, 114, 128, 0.2)',
              'rgba(139, 92, 246, 0.2)',
            ],
            borderColor: ['rgb(39, 3, 80)'],
            borderWidth: 3,
            tension: 0.4,
          },
        ],
      };

      this.ativpassaum = {
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

  async initChartPassivosemPrevi() {
    let fonte0 = await this.st.pegaPassivosemPrevi();
    const eixox = await this.st.extrairEixoX(fonte0);
    const eixoy = await this.st.extrairEixoY();
    const obj = await this.st.extrairObj();
    const real = await this.st.extrairReal();
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
        labels: eixox,
        datasets: [
          {
            label: 'Passivo sem PAL',
            fill: false,
            borderColor: documentStyle.getPropertyValue('--p-orange-900'),
            yAxisID: 'y',
            tension: 0.4,
            data: eixoy,
          },
          {
            label: 'Objetivo Mes',
            fill: false,
            borderColor: documentStyle.getPropertyValue('--p-orange-500'),
            yAxisID: 'y1',
            tension: 0.4,
            borderDash: [5, 5],
            data: obj,
          },
          {
            label: 'Realizado Mes',
            fill: true,
            backgroundColor: 'rgba(250, 197, 198, 0.2)',
            borderColor: documentStyle.getPropertyValue('--p-orange-300'),
            yAxisID: 'y1',
            tension: 0.4,
            borderDash: [2, 2],
            data: real,
          },
        ],
      };

      this.options2 = {
        stacked: false,
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
            },
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            ticks: {
              color: textColorSecondary,
            },
            grid: {
              color: surfaceBorder,
            },
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            ticks: {
              color: textColorSecondary,
            },
            grid: {
              drawOnChartArea: false,
              color: surfaceBorder,
            },
          },
        },
      };
      this.cd.markForCheck();
    }
  }

  async initChartAUM() {
    let fonte5 = await this.st.pegarAposent();
    const eixox = await this.st.extrairEixoX(fonte5);
    const eixoy = await this.st.extrairDados('alvo');
    const eixoy2 = await this.st.extrairDados('aum_mes');
    const obj = await this.st.extrairDados('objetivo_mes');
    const real = await this.st.extrairDados('realizado_mes');
    const rp = await this.st.extrairDados('rendapassivamensal');
    const rendamensalalvo = await this.st.extrairDados('renda_alvo');
    const pensao_previ = await this.st.extrairDados('pensao_previ');
    const rlmm = await this.st.extrairDados('rl_mm');

    if (isPlatformBrowser(this.platformId)) {
      const documentStyle = getComputedStyle(document.documentElement);
      const textColor = documentStyle.getPropertyValue('--p-text-color');
      const textColorSecondary = documentStyle.getPropertyValue(
        '--p-text-muted-color',
      );
      const surfaceBorder = documentStyle.getPropertyValue(
        '--p-content-border-color',
      );

      this.data3 = {
        labels: eixox,
        datasets: [
          {
            label: 'Alvo2034',
            fill: false,
            borderColor: documentStyle.getPropertyValue('--p-black-900'),
            yAxisID: 'y1',
            tension: 0.4,
            data: eixoy,
            borderDash: [7, 7],
          },
          {
            label: 'Objetivo Mes',
            fill: false,
            borderColor: documentStyle.getPropertyValue('--p-green-600'),
            yAxisID: 'y',
            tension: 0.4,
            data: obj,
          },
          {
            label: 'AUM Realizado Mês',
            fill: true,
            backgroundColor: 'rgba(111, 84, 233, 0.2)',
            borderColor: documentStyle.getPropertyValue('--p-purple-300'),
            yAxisID: 'y1',
            tension: 0.4,
            data: eixoy2,
            borderDash: [7, 7],
          },

          {
            label: 'Realizado Mes',
            fill: false,

            borderColor: documentStyle.getPropertyValue('--p-yellow-300'),
            yAxisID: 'y',
            tension: 0.4,
            data: real,
          },
          {
            label: 'Renda Passiva Mes',
            fill: false,

            borderColor: documentStyle.getPropertyValue('--p-blue-300'),
            yAxisID: 'y',
            tension: 0.6,
            borderDash: [3, 3],
            data: rp,
          },
          {
            label: 'Renda Alvo Mes',
            fill: false,

            borderColor: documentStyle.getPropertyValue('--p-blue-500'),
            yAxisID: 'y',
            tension: 0.8,
            borderDash: [5, 5],
            data: rendamensalalvo,
          },
          {
            label: 'Pensão Previ 50/55 anos',
            fill: false,

            borderColor: documentStyle.getPropertyValue('--p-orange-500'),
            yAxisID: 'y',
            tension: 0.2,
            borderDash: [9, 9],
            data: pensao_previ,
          },
          {
            label: 'Média da Renda Liquida ultimos 12 meses',
            fill: false,

            borderColor: documentStyle.getPropertyValue('--p-blue-900'),
            yAxisID: 'y',
            tension: 0.2,
            data: rlmm,
          },
        ],
      };

      this.options = {
        stacked: false,
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
            },
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            ticks: {
              color: textColorSecondary,
            },
            grid: {
              color: surfaceBorder,
            },
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            ticks: {
              color: textColorSecondary,
            },
            grid: {
              drawOnChartArea: false,
              color: surfaceBorder,
            },
          },
        },
      };
      this.cd.markForCheck();
    }
  }

  async initChartPALvsPassivo() {
    if (isPlatformBrowser(this.platformId)) {
      const documentStyle = getComputedStyle(document.documentElement);
      const textColor = documentStyle.getPropertyValue('--p-text-color');
      const textColorSecondary = documentStyle.getPropertyValue(
        '--p-text-muted-color',
      );
      const surfaceBorder = documentStyle.getPropertyValue(
        '--p-content-border-color',
      );
      let pal: any[];
      let passivo: any[];
      let linha: any[];
      let linha2: any[];

      pal = await this.st.consultaPALXPASSIVO('wacee4kv8ZhBCPLZQ00R');
      passivo = await this.st.consultaPALXPASSIVO('0AVwFNrr2L0iAhm5vkSp');
      linha = await this.st.consultaPALXPASSIVO('vWXbLDnshOpaij7Z30SE');
      linha2 = await this.st.consultaPALXPASSIVO('wDcXTGLoTkcVCCYohOGt');

      this.data4 = {
        labels: this.periodo,

        datasets: [
          {
            type: 'line',
            label: 'PAL/PT',
            borderColor: documentStyle.getPropertyValue('--p-orange-900'),
            borderWidth: 2,
            fill: false,
            tension: 0.4,
            data: linha,
            yAxisID: 'y1',
          },
          {
            type: 'line',
            label: 'PAL/AUM',
            borderColor: documentStyle.getPropertyValue('--p-purple-900'),
            borderWidth: 2,
            fill: false,
            tension: 0.6,
            data: linha2,
            yAxisID: 'y1',
          },
          {
            type: 'bar',
            label: 'PAL',
            backgroundColor: documentStyle.getPropertyValue('--p-gray-500'),
            data: pal,
            stack: 'Stack 0',
            // borderColor: 'white',
            // borderWidth: 2
            yAxisID: 'y',
          },
          {
            type: 'bar',
            label: 'PassivoTotal',
            backgroundColor: documentStyle.getPropertyValue('--p-orange-200'),
            data: passivo,
            stack: 'Stack 0',
            yAxisID: 'y',
          },
        ],
      };
      this.palvspassivo = {
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
            },
          },
          // Eixo Y Principal (para as barras)
          y: {
            type: 'linear',
            display: true,
            position: 'left', // Lado Esquerdo
            ticks: {
              color: textColorSecondary,
            },
            grid: {
              color: surfaceBorder,
            },
          },
          // Eixo Y Secundário (para as linhas)
          y1: {
            type: 'linear',
            display: true,
            position: 'right', // Lado Direito
            ticks: {
              color: textColorSecondary,
            },
            grid: {
              drawOnChartArea: false, // Evita que as linhas de grade se sobreponham às do eixo principal
              color: surfaceBorder,
            },
          },
        },
      };

      this.cd.markForCheck();
    }
  }
  async initChartIndEcon() {
    if (isPlatformBrowser(this.platformId)) {
      const documentStyle = getComputedStyle(document.documentElement);
      const textColor = documentStyle.getPropertyValue('--p-text-color');
      const textColorSecondary = documentStyle.getPropertyValue(
        '--p-text-muted-color',
      );
      const surfaceBorder = documentStyle.getPropertyValue(
        '--p-content-border-color',
      );
      let indecon: any[];
      indecon = await this.st.pegarIndEcon();

      this.data5 = {
        labels: this.periodo2,

        datasets: [
          {
            type: 'line',
            label: indecon[0].indice,
            borderColor: documentStyle.getPropertyValue('--p-orange-900'),
            borderWidth: 2,
            fill: false,
            tension: 0.4,
            data: [
              indecon[0].ano2001,
              indecon[0].ano2002,
              indecon[0].ano2003,
              indecon[0].ano2004,
              indecon[0].ano2005,
              indecon[0].ano2006,
              indecon[0].ano2007,
              indecon[0].ano2008,
              indecon[0].ano2009,
              indecon[0].ano2010,
              indecon[0].ano2011,
              indecon[0].ano2012,
              indecon[0].ano2013,
              indecon[0].ano2014,
              indecon[0].ano2015,
              indecon[0].ano2016,
              indecon[0].ano2017,
              indecon[0].ano2018,
              indecon[0].ano2019,
              indecon[0].ano2020,
              indecon[0].ano2021,
              indecon[0].ano2022,
              indecon[0].ano2023,
              indecon[0].ano2024,
              indecon[0].ano2025,
            ],

            yAxisID: 'y',
          },

          {
            type: 'line',
            label: indecon[1].indice,
            borderColor: documentStyle.getPropertyValue('--p-red-500'),
            borderWidth: 2,
            borderDash: [5, 5],
            fill: false,
            tension: 0.4,
            data: [
              indecon[1].ano2001,
              indecon[1].ano2002,
              indecon[1].ano2003,
              indecon[1].ano2004,
              indecon[1].ano2005,
              indecon[1].ano2006,
              indecon[1].ano2007,
              indecon[1].ano2008,
              indecon[1].ano2009,
              indecon[1].ano2010,
              indecon[1].ano2011,
              indecon[1].ano2012,
              indecon[1].ano2013,
              indecon[1].ano2014,
              indecon[1].ano2015,
              indecon[1].ano2016,
              indecon[1].ano2017,
              indecon[1].ano2018,
              indecon[1].ano2019,
              indecon[1].ano2020,
              indecon[1].ano2021,
              indecon[1].ano2022,
              indecon[1].ano2023,
              indecon[1].ano2024,
              indecon[1].ano2025,
            ],

            yAxisID: 'y',
          },

          {
            type: 'line',
            label: indecon[2].indice,
            borderColor: documentStyle.getPropertyValue('--p-red-300'),
            borderWidth: 2,
            fill: false,
            tension: 0.4,
            data: [
              indecon[2].ano2001,
              indecon[2].ano2002,
              indecon[2].ano2003,
              indecon[2].ano2004,
              indecon[2].ano2005,
              indecon[2].ano2006,
              indecon[2].ano2007,
              indecon[2].ano2008,
              indecon[2].ano2009,
              indecon[2].ano2010,
              indecon[2].ano2011,
              indecon[2].ano2012,
              indecon[2].ano2013,
              indecon[2].ano2014,
              indecon[2].ano2015,
              indecon[2].ano2016,
              indecon[2].ano2017,
              indecon[2].ano2018,
              indecon[2].ano2019,
              indecon[2].ano2020,
              indecon[2].ano2021,
              indecon[2].ano2022,
              indecon[2].ano2023,
              indecon[2].ano2024,
              indecon[2].ano2025,
            ],

            yAxisID: 'y',
          },

          {
            type: 'line',
            label: indecon[3].indice,
            borderColor: documentStyle.getPropertyValue('--p-green-500'),
            borderDash: [9, 9],
            borderWidth: 5,
            fill: true,
            backgroundColor: 'rgba(177, 245, 202, 0.2)',
            tension: 0.7,
            data: [
              indecon[3].ano2001,
              indecon[3].ano2002,
              indecon[3].ano2003,
              indecon[3].ano2004,
              indecon[3].ano2005,
              indecon[3].ano2006,
              indecon[3].ano2007,
              indecon[3].ano2008,
              indecon[3].ano2009,
              indecon[3].ano2010,
              indecon[3].ano2011,
              indecon[3].ano2012,
              indecon[3].ano2013,
              indecon[3].ano2014,
              indecon[3].ano2015,
              indecon[3].ano2016,
              indecon[3].ano2017,
              indecon[3].ano2018,
              indecon[3].ano2019,
              indecon[3].ano2020,
              indecon[3].ano2021,
              indecon[3].ano2022,
              indecon[3].ano2023,
              indecon[3].ano2024,
              indecon[3].ano2025,
            ],

            yAxisID: 'y',
          },

          {
            type: 'line',
            label: indecon[4].indice,
            borderColor: documentStyle.getPropertyValue('--p-purple-500'),
            borderWidth: 2,
            fill: false,
            tension: 0.6,
            data: [
              indecon[4].ano2001,
              indecon[4].ano2002,
              indecon[4].ano2003,
              indecon[4].ano2004,
              indecon[4].ano2005,
              indecon[4].ano2006,
              indecon[4].ano2007,
              indecon[4].ano2008,
              indecon[4].ano2009,
              indecon[4].ano2010,
              indecon[4].ano2011,
              indecon[4].ano2012,
              indecon[4].ano2013,
              indecon[4].ano2014,
              indecon[4].ano2015,
              indecon[4].ano2016,
              indecon[4].ano2017,
              indecon[4].ano2018,
              indecon[4].ano2019,
              indecon[4].ano2020,
              indecon[4].ano2021,
              indecon[4].ano2022,
              indecon[4].ano2023,
              indecon[4].ano2024,
              indecon[4].ano2025,
            ],

            yAxisID: 'y',
            borderDash: [7, 7],
          },
          // {
          //   type: 'line',
          //   label: 'PAL/AUM',
          //   borderColor: documentStyle.getPropertyValue('--p-purple-900'),
          //   borderWidth: 2,
          //   fill: false,
          //   tension: 0.6,
          //   data: linha2,
          //   yAxisID: 'y1',
          // },
          {
            type: 'bar',
            label: indecon[0].indice + ' acumulado',
            backgroundColor: documentStyle.getPropertyValue('--p-orange-500'),
            data: [
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              indecon[0].acumulado,
            ],
            stack: 'Stack 0',
            // borderColor: 'white',
            // borderWidth: 2
            yAxisID: 'y1',
          },
          {
            type: 'bar',
            label: indecon[1].indice + ' acumulado',
            backgroundColor: documentStyle.getPropertyValue('--p-red-500'),
            data: [
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              indecon[1].acumulado,
            ],
            stack: 'Stack 1',
            // borderColor: 'white',
            // borderWidth: 2
            yAxisID: 'y1',
          },

          {
            type: 'bar',
            label: indecon[2].indice + ' acumulado',
            backgroundColor: documentStyle.getPropertyValue('--p-red-300'),
            data: [
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              indecon[2].acumulado,
            ],
            stack: 'Stack 2',
            // borderColor: 'white',
            // borderWidth: 2
            yAxisID: 'y1',
          },

          {
            type: 'bar',
            label: indecon[3].indice + ' acumulado',
            backgroundColor: documentStyle.getPropertyValue('--p-green-500'),
            data: [
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              indecon[3].acumulado,
            ],
            stack: 'Stack 3',
            // borderColor: 'white',
            // borderWidth: 2
            yAxisID: 'y1',
          },

          {
            type: 'bar',
            label: indecon[4].indice + ' acumulado',
            backgroundColor: documentStyle.getPropertyValue('--p-purple-500'),
            data: [
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              indecon[4].acumulado,
            ],
            stack: 'Stack 4',

            // borderColor: 'white',
            // borderWidth: 2
            yAxisID: 'y1',
          },
          // {
          //   type: 'bar',
          //   label: 'PassivoTotal',
          //   backgroundColor: documentStyle.getPropertyValue('--p-orange-200'),
          //   data: passivo,
          //   stack: 'Stack 0',
          //   yAxisID: 'y',
          // },
        ],
      };
      this.options5 = {
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
            },
          },
          // Eixo Y Principal (para as barras)
          y: {
            type: 'linear',
            display: true,
            position: 'left', // Lado Esquerdo
            ticks: {
              color: textColorSecondary,
            },
            grid: {
              color: surfaceBorder,
            },
          },
          // Eixo Y Secundário (para as linhas)
          y1: {
            type: 'linear',
            display: true,
            position: 'right', // Lado Direito
            ticks: {
              color: textColorSecondary,
            },
            grid: {
              drawOnChartArea: false, // Evita que as linhas de grade se sobreponham às do eixo principal
              color: surfaceBorder,
            },
          },
        },
      };

      this.cd.markForCheck();
    }
  }

  async initChartPagtoDiv() {
    if (isPlatformBrowser(this.platformId)) {
      const documentStyle = getComputedStyle(document.documentElement);
      const textColor = documentStyle.getPropertyValue('--p-text-color');
      const textColorSecondary = documentStyle.getPropertyValue(
        '--p-text-muted-color',
      );
      const surfaceBorder = documentStyle.getPropertyValue(
        '--p-content-border-color',
      );
      let indecon: any[];
      indecon = await this.st.pegarPagtoDiv();

      let servdivida2021 = await this.ag3.getNestedFieldValueClient(
        'sh_agregados',
        'yw4JiCPLm6J1Fp5odgTQ',
        'ano2021.total',
      );
      let servdivida2023 = await this.ag3.getNestedFieldValueClient(
        'sh_agregados',
        'yw4JiCPLm6J1Fp5odgTQ',
        'ano2023.total',
      );
      let servdivida2024 = await this.ag3.getNestedFieldValueClient(
        'sh_agregados',
        'yw4JiCPLm6J1Fp5odgTQ',
        'ano2024.total',
      );
      let servdivida2025 = await this.ag3.getNestedFieldValueClient(
        'sh_agregados',
        'yw4JiCPLm6J1Fp5odgTQ',
        'ano2025.total',
      );
      let servdivida2026 = await this.ag3.getNestedFieldValueClient(
        'sh_agregados',
        'yw4JiCPLm6J1Fp5odgTQ',
        'ano2026.total',
      );
      // let labels : any[] = [];
      // for(let i = 0; i < indecon.length; i++){
      //   labels.push(indecon[i].ano)
      // }

      this.pagtopass = {
        labels: [
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
          'serv_dívida',
        ],

        datasets: [
          {
            type: 'line',
            label: indecon[0].ano,
            borderColor: documentStyle.getPropertyValue('--p-orange-100'),
            borderWidth: 2,
            fill: false,
            tension: 0.4,
            data: [
              indecon[0].jan,
              indecon[0].fev,
              indecon[0].mar,
              indecon[0].abr,
              indecon[0].mai,
              indecon[0].jun,
              indecon[0].jul,
              indecon[0].ago,
              indecon[0].set,
              indecon[0].out,
              indecon[0].nov,
              indecon[0].dez,
            ],
          },

          {
            type: 'line',
            label: indecon[1].ano,
            borderColor: documentStyle.getPropertyValue('--p-orange-300'),
            borderWidth: 2,
            borderDash: [5, 5],
            fill: false,
            tension: 0.4,
            data: [
              indecon[1].jan,
              indecon[1].fev,
              indecon[1].mar,
              indecon[1].abr,
              indecon[1].mai,
              indecon[1].jun,
              indecon[1].jul,
              indecon[1].ago,
              indecon[1].set,
              indecon[1].out,
              indecon[1].nov,
              indecon[1].dez,
            ],
          },

          {
            type: 'line',
            label: indecon[2].ano,
            borderColor: documentStyle.getPropertyValue('--p-orange-500'),
            borderWidth: 2,
            borderDash: [5, 5],

            tension: 0.4,
            data: [
              indecon[2].jan,
              indecon[2].fev,
              indecon[2].mar,
              indecon[2].abr,
              indecon[2].mai,
              indecon[2].jun,
              indecon[2].jul,
              indecon[2].ago,
              indecon[2].set,
              indecon[2].out,
              indecon[2].nov,
              indecon[2].dez,
            ],
          },

          {
            type: 'line',
            label: indecon[3].ano,
            borderColor: documentStyle.getPropertyValue('--p-orange-700'),
            borderDash: [5, 5],
            borderWidth: 2,

            tension: 0.4,
            data: [
              indecon[3].jan,
              indecon[3].fev,
              indecon[3].mar,
              indecon[3].abr,
              indecon[3].mai,
              indecon[3].jun,
              indecon[3].jul,
              indecon[3].ago,
              indecon[3].set,
              indecon[3].out,
              indecon[3].nov,
              indecon[3].dez,
            ],
          },

          {
            type: 'line',
            label: indecon[4].ano,
            borderColor: documentStyle.getPropertyValue('--p-orange-900'),
            borderWidth: 4,
            fill: false,
            tension: 0.4,
            data: [
              indecon[4].jan,
              indecon[4].fev,
              indecon[4].mar,
              indecon[4].abr,
              indecon[4].mai,
              indecon[4].jun,
              indecon[4].jul,
              indecon[4].ago,
              indecon[4].set,
              indecon[4].out,
              indecon[4].nov,
            ],
          },
          {
            type: 'bar',
            label: 'juros' + indecon[0].ano,
            backgroundColor: documentStyle.getPropertyValue('--p-orange-100'),
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, servdivida2021],
            stack: 'Stack 0',
            // borderColor: 'white',
            // borderWidth: 2
          },

          {
            type: 'bar',
            label: 'juros' + indecon[1].ano,
            backgroundColor: documentStyle.getPropertyValue('--p-orange-300'),
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, servdivida2023],
            stack: 'Stack 1',
            // borderColor: 'white',
            // borderWidth: 2
          },

          {
            type: 'bar',
            label: 'juros' + indecon[2].ano,
            backgroundColor: documentStyle.getPropertyValue('--p-orange-500'),
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, servdivida2024],
            stack: 'Stack 2',
            // borderColor: 'white',
            // borderWidth: 2
          },
          {
            type: 'bar',
            label: 'juros' + indecon[3].ano,
            backgroundColor: documentStyle.getPropertyValue('--p-orange-700'),
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, servdivida2025],
            stack: 'Stack 3',
            // borderColor: 'white',
            // borderWidth: 2
          },

          {
            type: 'bar',
            label: 'juros' + indecon[4].ano,
            backgroundColor: documentStyle.getPropertyValue('--p-orange-900'),
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, servdivida2026],
            stack: 'Stack 4',
            // borderColor: 'white',
            // borderWidth: 2
          },
        ],
      };

      this.options15 = {
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
}
