import { Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { NgxGaugeModule } from 'ngx-gauge';
import { Agreg3Service } from '../../services/agreg3.service';
import { TimestampService } from '../../services/timestamp.service';
import { AumService } from '../../services/aum.service';
import { RecliquidaService } from '../../services/recliquida.service';
import { CommonModule } from '@angular/common';
import { Contas2Service } from '../../services/contas2.service';

@Component({
  selector: 'app-gauge',
  imports: [NgxGaugeModule, CommonModule],
  templateUrl: './gauge.component.html',
  styleUrl: './gauge.component.css',
})
export class GaugeComponent implements OnInit {
  comp1: any;
  ger: any;
  alvo: any;
  aum: any;
  andamento: any;
  rl1: any;
  dl: any;
  rlanual: number;

  thresholdConfig = {
    '0': { color: 'green' },
    '40': { color: 'orange' },
    '75.5': { color: 'red' },
  };

  markerConfig = {
    '0': { color: '#f80808', size: 8, label: '0', type: 'line' },
    '15': { color: '#f80808', size: 4, type: 'line' },
    '30': { color: '#f80808', size: 8, label: '30', type: 'line' },
    '40': { color: '#f70808', size: 4, type: 'line' },
    '50': { color: '#f80808', size: 8, label: '50', type: 'line' },
    '60': { color: '#caf606', size: 4, type: 'line' },
    '70': { color: '#5f0afc', size: 8, label: '70', type: 'line' },
    '85': { color: '#5f0afc', size: 4, type: 'line' },
    '100': { color: '#5f0afc', size: 8, label: '100', type: 'line' },
  };

  negativeThresholdConfig = {
    '0': { color: '#5f0afc', bgOpacity: 0.2 },

    '60': { color: '#5f0afc', bgOpacity: 0.1 },
    '62': { color: '#ff0000', bgOpacity: 0.1 },

    '80': { color: '#ff0000', bgOpacity: 0.2 },
  };

  compromissadaConfig = {
    '0': { color: '#ff0000', bgOpacity: 0.2 },

    '75': { color: '#013511', bgOpacity: 0.1 },
  };

  gerenciavelConfig = {
    '0': { color: '#013511', bgOpacity: 0.1 },
    '26': { color: '#ff0000', bgOpacity: 0.2 },
  };

  ag3 = inject(Agreg3Service);
  ts = inject(TimestampService);
  as = inject(AumService);
  rl = inject(RecliquidaService);
  cs = inject(Contas2Service);
  dl1: number;
  dlanual: number;
  multanual: number;
  mult1: number;
  dfo: number;
  projrl: number;
  projdl: number;
  
  ano = new Date().getFullYear();

  constructor() {}

  async ngOnInit() {

    let test = `ano${this.ano}.total`;
    //console.log('test', test);

    let comp: number = await this.ag3.getNestedFieldValueClient(
      'sh_agregados',
      'RON4QGNrj8ZykZrQJSuU',
      test,
    );


    let ger: number = await this.ag3.getNestedFieldValueClient(
      'sh_agregados',
      'v9cgg3wHHiVAgkuqlbvc',
      test,
    );
  

    let total: number = comp + ger;
   

    let comp10 = (comp / total) * 100;
    this.comp1 = this.ts.roundToNDecimals(comp10, 1);

    this.ger = 100 - this.comp1;

    let alvo1: number = await this.ag3.getNestedFieldValueClient(
      'bmark',
      'Mlb5v3nyBxYFS3xdWlQU',
      'alvo',
    );
    this.alvo = this.ts.roundToNDecimals(alvo1, 2) / 1000000;

    let aum1: number = (await this.as.pegarAUM()) / 1000000;
    this.aum = this.ts.roundToNDecimals(aum1, 3);

    let andamento = (this.ts.diasDecorridos() / 365) * 100;
    this.andamento = this.ts.roundToNDecimals(andamento, 1);

    let rl1: number =
      -1 *
      ((await this.ag3.getNestedFieldValueClient(
        'sh_agregados',
        '7yLtE9Loqo2Q416w9ndK',
        test,
      )) as number);
   
    this.rl1 = this.ts.roundToTwoDecimals(rl1 / 1000);
   

    let rlanual: number = await this.ag3.getNestedFieldValueClient(
      'bmark',
      'lwYN9YznidkOMs86uFOg',
      'alvo',
    );
    this.rlanual = this.ts.roundToNDecimals(rlanual, 2) / 1000;

    let dl1: number = await this.ag3.getNestedFieldValueClient(
      'sh_agregados',
      'BB9Wo3WLdeFanctk8fYH',
      test,
    );

    this.dl1 = this.ts.roundToTwoDecimals(dl1 / 1000);

    let dllanual: number = await this.ag3.getNestedFieldValueClient(
      'bmark',
      'iag4Lq2bq73m4lWsY8QR',
      'alvo',
    );
    this.dlanual = this.ts.roundToNDecimals(dllanual, 2) / 1000;

    this.mult1 = this.ts.roundToNDecimals((this.dl1 / this.rl1) * 100, 1);

    //this.dl1 = this.ts.roundToTwoDecimals(dl1 / 1000);

    this.multanual =
      ((await this.ag3.getNestedFieldValueClient(
        'bmark',
        'pmD2mv7EYLgYOFnbpFIS',
        'alvo',
      )) as number) * 100;
   

    let dfo: number = await this.ag3.getNestedFieldValueClient(
      'sh_agregados',
      'dBhgmT8mW1aPtj12tZQc',
      test,
    );
    this.dfo = this.ts.roundToNDecimals(dfo, 0);

    
  
   this.projdl = (await this.ag3.getNestedFieldValueClient<number>("sh_agregados", "w9jfd3xBO3o12KycB8DZ", `ano${this.ano}.${this.ag3.mesesCampos[12]}`)) ?? 0;
    console.log("despesa liq projetada", this.projdl);

     this.projrl = (await this.ag3.getNestedFieldValueClient<number>("sh_agregados", "5J7bYFhDejZHDpYdcIv7", `ano${this.ano}.${this.ag3.mesesCampos[12]}`)) ?? 0;
    console.log("despesa liq projetada", this.projrl);


  }
}
