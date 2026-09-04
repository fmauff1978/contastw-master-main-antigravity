import { Component, computed, inject, Inject, signal } from '@angular/core';
import { Contas2Service } from '../../../services/contas2.service';

@Component({
  selector: 'app-agregadas',
  imports: [],
  templateUrl: './agregadas.component.html',
  styleUrl: './agregadas.component.css',
})
export class AgregadasComponent {
  agregDespesa = signal<any[]>([]);
  agregadas = signal<any[]>([]);
  agreg: number;
  cs = inject(Contas2Service);

  enquadramento = [
    'alimentação fora de casa',
    'educação',
    'familiares',
    'financeiras',
    'fopag',
    'imobiliárias',
    'lazer',
    'mobilidade',
    'ordinárias',
    'streaming',
  ];

  constructor() {
    this.pegarBD();
  }

  async pegarBD() {
   
    for (let i = 0; i < this.enquadramento.length; i++) {
      let fonte2 = await this.cs.pegarDados(
        'contas2025',
        'enquadramento',
        '==',
        this.enquadramento[i],
        'em_uso',
        '==',
        true,
        'saldo',
        'desc'
      );
      let saldo = await this.cs.totalizar(fonte2);
      this.agreg = saldo;
      console.log(this.agreg);

      this.agregadas.set([
        ...this.agregadas(),
        { enquadramento: this.enquadramento[i], saldo: this.agreg },
      ]);
    }

    console.log(this.agregadas());
  }
}
