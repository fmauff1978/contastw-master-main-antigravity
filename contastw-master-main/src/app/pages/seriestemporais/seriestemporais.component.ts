import { MessageService } from 'primeng/api';
import {
  ChangeDetectorRef,
  Component,
  effect,
  inject,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { FirestoreService } from '../../services/firestore.service';
import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  Timestamp,
  increment,
  limit,
  doc,
  updateDoc,
  where,
  getDoc,
} from 'firebase/firestore';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { Agreg2Service } from '../../services/agreg2.service';
import { SpinnerComponent } from '../../shared/spinner/spinner.component';
import { TimestampService } from '../../services/timestamp.service';
import { Contas2Service } from '../../services/contas2.service';
import { BmarkService } from '../../services/bmark.service';
import { AumService } from '../../services/aum.service';
import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-seriestemporais',
  imports: [
    ChartModule,
    ReactiveFormsModule,
    FormsModule,
    TableModule,
    ToastModule,
    ButtonModule,
    CommonModule,
    SpinnerComponent,
  ],
  templateUrl: './seriestemporais.component.html',
  styleUrl: './seriestemporais.component.css',
})
export class SeriestemporaisComponent {
  fs = inject(FirestoreService);
  ag2 = inject(Agreg2Service);
  ts = inject(TimestampService);
  as = inject(AumService);
  loading = inject(LoadingService);
  products: any;
  expandedRows: any;
  basicData: any;
  basicData2: any;
  basicData0: any;
  basicData33: any;
  dataX: any;
  data: any;
  data2: any;
  data3: any;
  data5: any;
  options: any;
  optionsX: any;
  platformId = inject(PLATFORM_ID);
  despliq0 = signal<any[]>([]);
  recliq0 = signal<any[]>([]);
  somaTotal: number = 0;
  valoresAcumulados: any[] = [];
  fonte: any[] = [];
  fonte0: any[] = [];
  fonte1: any[] = [];
  fonte2: any[] = [];
  fonte3: any[] = [];
  agreg950 = signal<any[]>([]);
  valoresordenados = signal<any[]>([]);
  customers = ['Natureza', 'Enquadramentos', 'Modalidade Despesa', 'Derivados'];
  despliq1 = signal<any[]>([]);
  basicOptions: any;
  isLoading = false;
  ano = new Date().getFullYear();
  //ano = 2026;
  mes = new Date().getMonth();
  posicao: Timestamp;
  cs = inject(Contas2Service);
  bm = inject(BmarkService);

  agreg = signal<any[]>([]);
  anobd: string;
  anobd2: string;
  basicData10: any;
  basicData11: any;
  agregadosordenados = signal<any[]>([]);
  rp: number;
  rendapassivamensal: any;
  basicData100: { labels: string[]; datasets: any[] };
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

  basicData1000: any;
  dataAgrupado: any;

  constructor(private cd: ChangeDetectorRef) {
    this.fs.conectar();
    //  this.gravarST()
    //this.initChart2()
    // this.atualizarPasPrevi();
    // this.aposent();
    //this.as.codContasInvestimento()
    //this.as.atualizarBDAUMAgregado()
  }

  roundToTwoDecimals(num: number): number {
    return Math.round((num + Number.EPSILON) * 100) / 100;
  }

  themeEffect = effect(() => {});

  async ngOnInit() {
    this.loading.show('Iniciando carregamento...');
    try {
      // keep the original loading flag for compatibility
      this.isLoading = true;

      this.loading.setMessage('Carregando agregados...');
      const data = await this.ag2.pegarDespEnq();
      this.agregadosordenados.set(data);

      this.anobd = await this.pegarIDdoano('seriestemporais_despliq', this.ano);

      this.anobd2 = await this.pegarIDdoano('seriestemporais_recliq', this.ano);

      this.loading.setMessage('Buscando despesas líquidas...');
      await this.pegarDespLiq();

      this.loading.setMessage('Buscando receitas líquidas...');
      await this.pegarRecLiq();

      this.loading.setMessage('Calculando valores por mês (mês atual)...');
      await this.calcMes(
        'BB9Wo3WLdeFanctk8fYH',
        'seriestemporais_despliq',
        this.anobd,
        this.fonte,
        this.mes,
      );
      await this.calcMes(
        '7yLtE9Loqo2Q416w9ndK',
        'seriestemporais_recliq',
        this.anobd2,
        this.fonte0,
        this.mes,
      );

      this.loading.setMessage('Calculando valores por mês (mês anterior)...');
      // await this.calcMes(
      //   'BB9Wo3WLdeFanctk8fYH',
      //   'seriestemporais_despliq',
      //   'Jmvkn3wWtQMGxcqr35D9',
      //   this.fonte1,
      //   this.mes - 1
      // );
      // await this.calcMes(
      //   '7yLtE9Loqo2Q416w9ndK',
      //   'seriestemporais_recliq',
      //   '9R3pOtfNtJarhoW4qrV1',
      //   this.fonte2,
      //   this.mes - 1
      // );

      this.loading.setMessage('Inicializando gráficos...');
      this.initChartDespLiqAnuais();
      this.initChartRecLiquidasAnuais(this.recliq0, 0, 1, 2, 3, 4);
      this.initChartPassivosemPrevi();

      this.loading.setMessage('Obtendo posição...');
      this.posicao = await this.ts.log();

      this.loading.setMessage('Carregando passivos e atualizando...');
      this.fonte3 = await this.pegaPassivosemPrevi();

      this.atualizarPasPrevi();
      this.initChartAUM();

      //grafico de despesa líquida vs receita líquida
      this.initChartDespxRecLiquidasAnual(
        'BB9Wo3WLdeFanctk8fYH',
        'Despesa Líquida',
        '7yLtE9Loqo2Q416w9ndK',
        'Receita Líquida',
      );

      //grafico de ativo total vs passivo total vs aum
      this.initChart1AtivoXPassivoXAUM(
        'AmWuqcCmRZ3ZzgH7kEbO',
        'Ativo Total',
        '0AVwFNrr2L0iAhm5vkSp',
        'Passivo Total',
        'K5eDh0H5pIiTc9s6W9zy',
        'AUM',
      );

      this.initChartPALvsPassivo();
      this.initChartDespEnq();
      this.initChartDespEnq2();
      this.initChartAgrupado();

      this.isLoading = false;
    } catch (err) {
      console.error('Erro em ngOnInit:', err);
    } finally {
      this.loading.hide();
    }
  }

  async pegarDespLiq() {
    let data: any[] = [];
    data = await this.pegaST('seriestemporais_despliq', this.ano - 5);
    this.despliq0.set(data);
  }

  async pegarRecLiq() {
    let data: any[] = [];
    data = await this.pegaST('seriestemporais_recliq', this.ano - 5);
    this.recliq0.set(data);
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

  async initChartDespLiqAnuais() {
    await this.pegarDespLiq();

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
        labels: [
          'Jan',
          'Fev',
          'Mar',
          'Abr',
          'Mai',
          'Jun',
          'Jul',
          'Ago',
          'Set',
          'Out',
          'Nov',
          'Dez',
        ],
        datasets: [
          {
            label: this.ano - 4,
            data: [
              this.despliq0()[0].jan,
              this.despliq0()[0].fev,
              this.despliq0()[0].mar,
              this.despliq0()[0].abr,
              this.despliq0()[0].mai,
              this.despliq0()[0].jun,
              this.despliq0()[0].jul,
              this.despliq0()[0].ago,
              this.despliq0()[0].set,
              this.despliq0()[0].out,
              this.despliq0()[0].nov,
              this.despliq0()[0].dez,
            ],
            borderDash: [4, 4],

            fill: false,
            tension: 0.4,
            borderColor: documentStyle.getPropertyValue('--p-red-100'),
          },
          {
            label: this.ano - 3,
            data: [
              this.despliq0()[1].jan,
              this.despliq0()[1].fev,
              this.despliq0()[1].mar,
              this.despliq0()[1].abr,
              this.despliq0()[1].mai,
              this.despliq0()[1].jun,
              this.despliq0()[1].jul,
              this.despliq0()[1].ago,
              this.despliq0()[1].set,
              this.despliq0()[1].out,
              this.despliq0()[1].nov,
              this.despliq0()[1].dez,
            ],
            fill: false,
            borderDash: [5, 5],
            tension: 0.4,
            borderColor: documentStyle.getPropertyValue('--p-red-200'),
          },
          {
            label: this.ano - 2,
            data: [
              this.despliq0()[2].jan,
              this.despliq0()[2].fev,
              this.despliq0()[2].mar,
              this.despliq0()[2].abr,
              this.despliq0()[2].mai,
              this.despliq0()[2].jun,
              this.despliq0()[2].jul,
              this.despliq0()[2].ago,
              this.despliq0()[2].set,
              this.despliq0()[2].out,
              this.despliq0()[2].nov,
              this.despliq0()[2].dez,
            ],
            fill: false,
            borderDash: [6, 6],
            borderColor: documentStyle.getPropertyValue('--p-red-500'),
            tension: 0.4,
            //backgroundColor: 'rgba(107, 114, 128, 0.2)'
          },
          {
            label: this.ano - 1,
            data: [
              this.despliq0()[3].jan,
              this.despliq0()[3].fev,
              this.despliq0()[3].mar,
              this.despliq0()[3].abr,
              this.despliq0()[3].mai,
              this.despliq0()[3].jun,
              this.despliq0()[3].jul,
              this.despliq0()[3].ago,
              this.despliq0()[3].set,
              this.despliq0()[3].out,
              this.despliq0()[3].nov,
              this.despliq0()[3].dez,
            ],
            fill: false,
            borderDash: [7, 7],

            borderColor: documentStyle.getPropertyValue('--p-red-700'),
            tension: 0.4,
            //backgroundColor: 'rgba(107, 114, 128, 0.2)'
          },
          {
            label: this.ano,
            data: [
              this.despliq0()[4].jan,
              this.despliq0()[4].fev,
              this.despliq0()[4].mar,
              this.despliq0()[4].abr,
              this.despliq0()[4].mai,
              this.despliq0()[4].jun,
              this.despliq0()[4].jul,
              this.despliq0()[4].ago,
              this.despliq0()[4].set,
              this.despliq0()[4].out,
              this.despliq0()[4].nov,
              this.despliq0()[4].dez,
            ],
            fill: true,
            spanGaps: false,
            borderColor: documentStyle.getPropertyValue('--p-red-900'),
            tension: 0.2,
            backgroundColor: 'rgba(250, 197, 198, 0.2)',
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
            },
          },
          y: {
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

  async calc() {
    let mes = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

    for (let i = 0; i < mes.length; i++) {
      let campoMes = `ano${this.ano}.${this.ag2.mesesCampos[i]}`;
      let res: number = await this.ag2.getNestedFieldValueClient(
        'sh_agregados',
        '7yLtE9Loqo2Q416w9ndK',
        campoMes,
      );
      let res1 = this.roundToTwoDecimals(res) * -1;
      this.fonte.push(res1);
    }

    let somaAcumulada: number = 0;

    // 3. Use o método .map() para criar o novo array
    this.valoresAcumulados = this.fonte.map((valor) => {
      // Adiciona o valor atual à soma acumulada
      somaAcumulada += valor;
      // Retorna a soma atualizada, que se torna o novo elemento do array
      return somaAcumulada;
    });

    // 4. Exibe o resultado

    for (let j = 0; j < this.valoresAcumulados.length; j++) {
      let valormes = this.valoresAcumulados[j];
      let campoMes = `${this.ag2.mesesCampos[j]}`;
      const docRef = doc(
        this.fs.db,
        'seriestemporais_recliq',
        'QRfTAiEO73i7BBs4psBC',
      );
      await updateDoc(docRef, {
        [campoMes]: valormes,
        atualizacao: Timestamp.now(),
      });
    }
  }

  async initChartRecLiquidasAnuais(fonte, ano1, ano2, ano3, ano4, ano5) {
    await this.pegarRecLiq();

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
        labels: [
          'Jan',
          'Fev',
          'Mar',
          'Abr',
          'Mai',
          'Jun',
          'Jul',
          'Ago',
          'Set',
          'Out',
          'Nov',
          'Dez',
        ],
        datasets: [
          {
            label: this.ano - 4,
            data: [
              fonte()[ano1].jan,
              fonte()[ano1].fev,
              fonte()[ano1].mar,
              fonte()[ano1].abr,
              fonte()[ano1].mai,
              fonte()[ano1].jun,
              fonte()[ano1].jul,
              fonte()[ano1].ago,
              fonte()[ano1].set,
              fonte()[ano1].out,
              fonte()[ano1].nov,
              fonte()[ano1].dez,
            ],
            borderDash: [4, 4],

            fill: false,
            tension: 0.4,
            borderColor: documentStyle.getPropertyValue('--p-blue-100'),
          },
          {
            label: this.ano - 3,
            data: [
              fonte()[ano2].jan,
              fonte()[ano2].fev,
              fonte()[ano2].mar,
              fonte()[ano2].abr,
              fonte()[ano2].mai,
              fonte()[ano2].jun,
              fonte()[ano2].jul,
              fonte()[ano2].ago,
              fonte()[ano2].set,
              fonte()[ano2].out,
              fonte()[ano2].nov,
              fonte()[ano2].dez,
            ],
            fill: false,
            borderDash: [5, 5],
            tension: 0.4,
            borderColor: documentStyle.getPropertyValue('--p-blue-200'),
          },
          {
            label: this.ano - 2,
            data: [
              fonte()[ano3].jan,
              fonte()[ano3].fev,
              fonte()[ano3].mar,
              fonte()[ano3].abr,
              fonte()[ano3].mai,
              fonte()[ano3].jun,
              fonte()[ano3].jul,
              fonte()[ano3].ago,
              fonte()[ano3].set,
              fonte()[ano3].out,
              fonte()[ano3].nov,
              fonte()[ano3].dez,
            ],
            fill: false,
            borderDash: [6, 6],
            borderColor: documentStyle.getPropertyValue('--p-blue-500'),
            tension: 0.4,
            //backgroundColor: 'rgba(107, 114, 128, 0.2)'
          },
          {
            label: this.ano - 1,
            data: [
              fonte()[ano4].jan,
              fonte()[ano4].fev,
              fonte()[ano4].mar,
              fonte()[ano4].abr,
              fonte()[ano4].mai,
              fonte()[ano4].jun,
              fonte()[ano4].jul,
              fonte()[ano4].ago,
              fonte()[ano4].set,
              fonte()[ano4].out,
              fonte()[ano4].nov,
              fonte()[ano4].dez,
            ],
            fill: false,
            borderDash: [7, 7],

            borderColor: documentStyle.getPropertyValue('--p-blue-700'),
            tension: 0.4,
            //backgroundColor: 'rgba(107, 114, 128, 0.2)'
          },
          {
            label: this.ano,
            data: [
              fonte()[ano5].jan,
              fonte()[ano5].fev,
              fonte()[ano5].mar,
              fonte()[ano5].abr,
              fonte()[ano5].mai,
              fonte()[ano5].jun,
              fonte()[ano5].jul,
              fonte()[ano5].ago,
              fonte()[ano5].set,
              fonte()[ano5].out,
              fonte()[ano5].nov,
              fonte()[ano5].dez,
            ],
            fill: true,
            borderColor: documentStyle.getPropertyValue('--p-blue-900'),
            tension: 0.2,
            backgroundColor: 'rgba(169, 193, 243, 0.2)',
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
            },
          },
          y: {
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

  // await this.calcMes(
  //     '7yLtE9Loqo2Q416w9ndK',
  //     'seriestemporais_recliq',
  //     '9R3pOtfNtJarhoW4qrV1',
  //     this.fonte0,
  //     this.mes
  //   );

  async calcMes(id1, bd, id2, fonte1, mes) {
    for (let i = mes; i >= 0; i--) {
      let campoMes = `ano${this.ano}.${this.ag2.mesesCampos[i]}`;

      let res: number = await this.ag2.getNestedFieldValueClient(
        'sh_agregados',
        id1,
        campoMes,
      );

      let res0 = this.roundToTwoDecimals(res);
      let res1 = Math.abs(res0);

      fonte1.push(res1);
      //console.log(fonte1);
    }

    let somaTotal0 = fonte1.reduce((acumulador, valorAtual) => {
      return acumulador + valorAtual;
    }, 0); // O '0' é o valor inicial do acumulador

    let somaTotal = this.roundToTwoDecimals(somaTotal0);

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

  async initChartPassivosemPrevi() {
    const eixox = await this.extrairEixoX();
    const eixoy = await this.extrairEixoY();
    const obj = await this.extrairObj();
    const real = await this.extrairReal();

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
            label: 'Passivo sem PAL',
            fill: false,
            borderColor: documentStyle.getPropertyValue('--p-orange-900'),
            yAxisID: 'y1',
            tension: 0.4,
            data: eixoy,
            borderDash: [7, 7],
          },
          {
            label: 'Objetivo Mes',
            fill: false,
            borderColor: documentStyle.getPropertyValue('--p-red-900'),
            yAxisID: 'y',
            tension: 0.4,
            data: obj,
          },
          {
            label: 'Realizado Mes',
            fill: true,
            backgroundColor: 'rgba(250, 197, 198, 0.2)',
            borderColor: documentStyle.getPropertyValue('--p-orange-500'),
            yAxisID: 'y',
            tension: 0.4,
            data: real,
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

  async extrairEixoX() {
    this.fonte3 = await this.pegaPassivosemPrevi();

    let fonte: any[] = [];

    for (let i = 0; i < this.fonte3.length; i++) {
      let x = this.fonte3[i].mes.toDate();
      const ano = x.getFullYear();
      const mes = x.getMonth() + 1;
      const mesFormatado = String(mes).padStart(2, '0');
      //console.log(x);

      fonte.push(`${mesFormatado}/${ano}`);
    }

    return fonte;
  }

  async extrairEixoY() {
    this.fonte3 = await this.pegaPassivosemPrevi();

    let fonte: any[] = [];

    for (let i = 0; i < this.fonte3.length; i++) {
      let x = this.fonte3[i].passivo_sem_previ;

      fonte.push(x);
    }

    return fonte;
  }

  async extrairObj() {
    this.fonte3 = await this.pegaPassivosemPrevi();

    let fonte: any[] = [];

    for (let i = 0; i < this.fonte3.length; i++) {
      let x = this.fonte3[i].objetivo_mes;

      fonte.push(x);
    }

    return fonte;
  }

  async extrairReal() {
    this.fonte3 = await this.pegaPassivosemPrevi();

    let fonte: any[] = [];

    for (let i = 0; i < this.fonte3.length; i++) {
      let x = this.fonte3[i].realizado_mes;

      fonte.push(x);
    }

    return fonte;
  }

  //calculo do passivo sem recursos autoliquidaveis

  async atualizarPasPrevi() {
    let parcelas_restantes = this.ts.difAposentadoria();

    let dif =
      this.ts.calcularDiferencaMeses(Timestamp.fromMillis(1654052400 * 1000)) *
      -1;

    let indice = dif + 1;

    const colRef1 = collection(this.fs.db, 'seriestemporais_pass_previ');
    const q = query(colRef1, orderBy('reg', 'desc'), limit(1));
    const qs = await getDocs(q);
    let contasData: any[] = [];
    contasData = qs.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    let indBD = contasData[0].reg;
    let id_ref = contasData[0].id;
    let passivo_pago0 = await this.bm.evolucaoPassivo();
    let passivo_pago = this.roundToTwoDecimals(passivo_pago0);

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

    let pass_previ = this.roundToTwoDecimals(passivo + pal) * -1;

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

    let obj = this.roundToTwoDecimals(pass_previ / parcelas_restantes);

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
    }
  }

  async corrigirMenosUm(i) {
    let cor = await this.bm.evolucaoAUMmenos2();

    let font = await this.pegarAposentporReg(i);
    let idfont = font[0].id;
    const docRef2 = doc(this.fs.db, 'seriestemporais_aposent', idfont);
    await updateDoc(docRef2, {
      atualizacao: Timestamp.now(),
      //aum_mes: aum,

      realizado_mes: Math.round(cor * 100) / 100,
    });
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

  async pegarAposentporReg(reg) {
    const colRef = collection(this.fs.db, 'seriestemporais_aposent');
    const q = query(colRef, where('reg', '==', reg), orderBy('reg', 'asc'));
    const qs = await getDocs(q);
    let aposentData: any[] = [];
    aposentData = qs.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return aposentData;
  }

  async initChartAUM() {
    const eixox = await this.extrairEixoX5();
    const eixoy = await this.extrairDados('alvo');
    const eixoy2 = await this.extrairDados('aum_mes');
    const obj = await this.extrairDados('objetivo_mes');
    const real = await this.extrairDados('realizado_mes');
    const rp = await this.extrairDados('rendapassivamensal');
    const rendamensalalvo = await this.extrairDados('renda_alvo');
    const rlmm = await this.extrairDados('rl_mm');

    if (isPlatformBrowser(this.platformId)) {
      const documentStyle = getComputedStyle(document.documentElement);
      const textColor = documentStyle.getPropertyValue('--p-text-color');
      const textColorSecondary = documentStyle.getPropertyValue(
        '--p-text-muted-color',
      );
      const surfaceBorder = documentStyle.getPropertyValue(
        '--p-content-border-color',
      );

      this.data5 = {
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

  async extrairEixoX5() {
    let fonte5 = await this.pegarAposent();

    let fonte: any[] = [];

    for (let i = 0; i < fonte5.length; i++) {
      let x = fonte5[i].mes.toDate();
      const ano = x.getFullYear();
      const mes = x.getMonth() + 1;
      const mesFormatado = String(mes).padStart(2, '0');
      //console.log(x);

      fonte.push(`${mesFormatado}/${ano}`);
    }
    //console.log(fonte);
    return fonte;
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

  async initChart1AtivoXPassivoXAUM(id1, label1, id2, label2, id3, label3) {
    if (isPlatformBrowser(this.platformId)) {
      const documentStyle = getComputedStyle(document.documentElement);
      const textColor = documentStyle.getPropertyValue('--p-text-color');
      const textColorSecondary = documentStyle.getPropertyValue(
        '--p-text-muted-color',
      );
      const surfaceBorder = documentStyle.getPropertyValue(
        '--p-content-border-color',
      );

      const dadosParaGrafico = await this.consulta2(id1); // Chame a função UMA VEZ

      const dadosParaGrafico2 = await this.consulta2(id2); // Chame a função UMA VEZ

      const dadosParaGrafico3 = await this.consulta2(id3); // Chame a função UMA VEZ

      this.basicData10 = {
        labels: [
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
        ],
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
            borderColor: ['rgb(205, 11, 7)'],
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
            borderColor: ['rgb(7, 55, 1)'],
            borderWidth: 3,
            tension: 0.4,
          },
        ],
      };

      this.basicOptions = {
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

  async initChartDespxRecLiquidasAnual(id1, label1, id2, label2) {
    if (isPlatformBrowser(this.platformId)) {
      const documentStyle = getComputedStyle(document.documentElement);
      const textColor = documentStyle.getPropertyValue('--p-text-color');
      const textColorSecondary = documentStyle.getPropertyValue(
        '--p-text-muted-color',
      );
      const surfaceBorder = documentStyle.getPropertyValue(
        '--p-content-border-color',
      );

      const dadosParaGrafico = await this.consulta(id1); // Chame a função UMA VEZ

      const dadosParaGrafico2 = await this.consultaNegativos(id2); // Chame a função UMA VEZ

      this.basicData11 = {
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

      this.basicOptions = {
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

      pal = await this.consultaPALXPASSIVO('wacee4kv8ZhBCPLZQ00R');
      passivo = await this.consultaPALXPASSIVO('0AVwFNrr2L0iAhm5vkSp');
      linha = await this.consultaPALXPASSIVO('vWXbLDnshOpaij7Z30SE');
      linha2 = await this.consultaPALXPASSIVO('wDcXTGLoTkcVCCYohOGt');

      this.basicData33 = {
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

      this.options = {
        maintainAspectRatio: false,
        aspectRatio: 0.8,
        plugins: {
          tooltip: {
            mode: 'index',
            intersect: false,
          },
          legend: {
            labels: {
              color: textColor,
            },
          },
        },
        scales: {
          x: {
            stacked: true,
            ticks: {
              color: textColorSecondary,
            },
            grid: {
              color: surfaceBorder,
              drawBorder: false,
            },
          },
          y: {
            stacked: true,
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

      const dadosParaGrafico = await this.extrairEOrdenarPorAno(despenq[1]);

      const dadosParaGrafico2 = await this.extrairEOrdenarPorAno(despenq[3]); // Chame a função UMA VEZ

      const dadosParaGrafico3 = await this.extrairEOrdenarPorAno(despenq[4]); // Chame a função UMA VEZ

      this.basicData100 = {
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
        ],
      };

      this.basicOptions = {
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

      const dadosParaGrafico = await this.extrairEOrdenarPorAno(despenq[5]);

      const dadosParaGrafico2 = await this.extrairEOrdenarPorAno(despenq[6]); // Chame a função UMA VEZ

      const dadosParaGrafico3 = await this.extrairEOrdenarPorAno(despenq[7]); // Chame a função UMA VEZ

      this.basicData1000 = {
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
            borderColor: ['rgb(202, 90, 90)'],
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
            borderColor: ['rgb(246, 250, 5)'],
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
            borderColor: ['rgb(250, 136, 6)'],
            borderWidth: 3,
            tension: 0.4,
            borderDash: [2, 2],
          },
        ],
      };

      this.basicOptions = {
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

  extrairEOrdenarPorAno(obj: any): any[] {
    const anoInicio = 2022;
    const anoFim = 2026;
    const dados: any[] = [];

    // Percorrer cada ano no objeto
    for (let ano = anoInicio; ano <= anoFim; ano++) {
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

  extrairTotaisAnuais(obj: any): any[] {
    const anoInicio = 2022;
    const anoFim = 2026;
    const totaisAnuais: any[] = [];

    // Percorrer cada ano em ordem
    for (let ano = anoInicio; ano <= anoFim; ano++) {
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

  async initChartAgrupado() {

    let despenq = await this.ag2.pegarDespEnq();
    console.log(despenq);
     let teste = await this.extrairTotaisAnuais(despenq[0]);
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

      this.dataAgrupado = {
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
          
        ],
        datasets: [
          {
            label: this.ano-4,
            backgroundColor: documentStyle.getPropertyValue('--p-red-900'),
            borderColor: documentStyle.getPropertyValue('--p-red-900'),
         
            data:  [despenq[0].ano2022.total,
          despenq[1].ano2022.total,
          despenq[2].ano2022.total,
          despenq[3].ano2022.total,
          despenq[4].ano2022.total,
          despenq[5].ano2022.total,
          despenq[6].ano2022.total,
          despenq[7].ano2022.total,  
          despenq[8].ano2022.total]
          },
          {
            label: this.ano -3,
            backgroundColor: documentStyle.getPropertyValue('--p-red-600'),
            borderColor: documentStyle.getPropertyValue('--p-red-600'),
          
            data:  [despenq[0].ano2023.total,
          despenq[1].ano2023.total,
          despenq[2].ano2023.total,
          despenq[3].ano2023.total,
          despenq[4].ano2023.total,
          despenq[5].ano2023.total,
          despenq[6].ano2023.total,
          despenq[7].ano2023.total,  
          despenq[8].ano2023.total]
            
          },
            {
            label: this.ano -2,
            backgroundColor: documentStyle.getPropertyValue('--p-red-400'),
            borderColor: documentStyle.getPropertyValue('--p-red-400'),
             data:  [despenq[0].ano2024.total,
          despenq[1].ano2024.total,
          despenq[2].ano2024.total,
          despenq[3].ano2024.total,
          despenq[4].ano2024.total,
          despenq[5].ano2024.total,
          despenq[6].ano2024.total,
          despenq[7].ano2024.total,  
          despenq[8].ano2024.total]
           
          },
            {
            label: this.ano -1,
            backgroundColor: documentStyle.getPropertyValue('--p-red-300'),
            borderColor: documentStyle.getPropertyValue('--p-red-300'),
           data:  [despenq[0].ano2025.total,
          despenq[1].ano2025.total,
          despenq[2].ano2025.total,
          despenq[3].ano2025.total,
          despenq[4].ano2025.total,
          despenq[5].ano2025.total,
          despenq[6].ano2025.total,
          despenq[7].ano2025.total,  
          despenq[8].ano2025.total]
          },
            {
            label: this.ano,
            backgroundColor: documentStyle.getPropertyValue('--p-orange-300'),
            borderColor: documentStyle.getPropertyValue('--p-orange-300'),
            data:  [despenq[0].ano2026.total,
          despenq[1].ano2026.total,
          despenq[2].ano2026.total,
          despenq[3].ano2026.total,
          despenq[4].ano2026.total,
          despenq[5].ano2026.total,
          despenq[6].ano2026.total,
          despenq[7].ano2026.total,  
          despenq[8].ano2026.total]
          },
        ],
      };

      this.options = {
        maintainAspectRatio: false,
        aspectRatio: 0.8,
        layout: {
    padding: {
      left: 10, // Adiciona um pequeno respiro manual do lado esquerdo
      right: 10
    }},
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
}
