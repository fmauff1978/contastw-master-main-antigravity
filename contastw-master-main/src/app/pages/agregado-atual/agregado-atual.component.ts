import { CommonModule } from '@angular/common';
import { Component, inject, LOCALE_ID } from '@angular/core';
import { Agreg3Service } from '../../services/agreg3.service';
import { AumService } from '../../services/aum.service';
import { FirestoreService } from '../../services/firestore.service';
import { LoadingService } from '../../services/loading.service';
import { TimestampService } from '../../services/timestamp.service';

@Component({
  selector: 'app-agregado-atual',
  imports: [CommonModule],
  templateUrl: './agregado-atual.component.html',
  styleUrl: './agregado-atual.component.css',
  providers: [{ provide: LOCALE_ID, useValue: 'pt' }],
})
export class AgregadoAtualComponent {
  ano = new Date().getFullYear();
  anoant = this.ano - 1;
  isLoading = false;
  fonte0: any[] = [];
  fonte1: any[] = [];
  fonte2: any[] = [];
  dd: number;
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
    'total',
  ];
  loading = inject(LoadingService);
  fs = inject(FirestoreService);
  ag3 = inject(Agreg3Service);
  as = inject(AumService);
  ts = inject(TimestampService);

  async ngOnInit() {
    this.fonte0 = await this.ag3.pegarShAgreg('tabela', '==', true);
    console.log('fonte0', this.fonte0);

    this.dd = (await this.ts.diasDecorridos()) / 365;
    console.log('dd', this.dd);

    this.fonte1 = await this.ag3.pegarShAgreg(
      'cod',
      'in',
      [950.1, 950.2, 950.5, 950.51],
    );
    console.log('fonte1', this.fonte1);

    this.fonte2 = await this.ag3.pegarShAgreg(
      'cod',
      'in',
      [930, 931, 933, 910, 913, 914, 915, 918, 921, 922, 923, 928],
    );
    console.log('fonte2', this.fonte2);
  }
}
