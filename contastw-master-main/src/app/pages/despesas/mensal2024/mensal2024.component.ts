import { CommonModule } from '@angular/common';
import { Component, LOCALE_ID } from '@angular/core';
import { TimestampService } from '../../../services/timestamp.service';
import { ContasService } from '../../../services/contas.service';

@Component({
  selector: 'app-mensal2024',
  imports: [CommonModule],
  templateUrl: './mensal2024.component.html',
  styleUrl: './mensal2024.component.css',
  providers: [{ provide: LOCALE_ID, useValue: 'pt' }],
})
export class Mensal2024Component {
  fonte0: any[]=[];
  fonte1: any[]=[];
  log1: any;
  atualiz: any[]=[];
    currentSortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  
  percent: any;
  extrapolados: any;
  length: any;
  indice = 1;
  totaisMensais: any = {};
  totaisOff: any = {};
  totaisCompromissada: any = {};
  totaisGerenciavel: any = {};
  totaisDespesaLiquida: any = {};

  constructor(private cs: ContasService, private ts: TimestampService) {
   

     
  }


  async ngOnInit(){

    this.fonte0 = await this.cs.pegarContasParam('natureza','==','despesa', "total2024", "desc");
    this.fonte1 = await this.cs.pegarContasParam('natureza','==','receita', "total2024", "desc");
    console.log(this.fonte0);
    
    this.calcularTotaisMensais();
    this.calcularTotaisPorModalidade();
    }

  isOlderThanThreshold(number): boolean {
    return number > this.indice;
  }

  calcularTotaisMensais() {
    const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    this.totaisMensais = {};
    meses.forEach(mes => {
      this.totaisMensais[mes] = this.fonte0.reduce((sum, item) => {
        return sum + (item.ano2024?.[mes] || 0);
      }, 0);
    });
  }

  calcularTotaisPorModalidade() {
    const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

    meses.forEach(mes => {
      this.totaisOff[mes] = this.fonte0.reduce((sum, item) => {
        return sum + (item.mod_despesa === 'off' ? (item.ano2024?.[mes] || 0) : 0);
      }, 0);
      this.totaisCompromissada[mes] = this.fonte0.reduce((sum, item) => {
        return sum + (item.mod_despesa === 'compromissada' ? (item.ano2024?.[mes] || 0) : 0);
      }, 0);
      this.totaisGerenciavel[mes] = this.fonte0.reduce((sum, item) => {
        return sum + (item.mod_despesa === 'gerenciável' ? (item.ano2024?.[mes] || 0) : 0);
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
