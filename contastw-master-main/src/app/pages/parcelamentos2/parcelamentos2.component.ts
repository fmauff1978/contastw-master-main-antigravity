import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ParcelamentosService } from '../../services/parcelamentos.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { Router, RouterModule } from '@angular/router';
import { Contas2Service } from '../../services/contas2.service';
import { SpinnerComponent } from '../../shared/spinner/spinner.component';
import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-parcelamentos2',
  imports: [
    CommonModule,
    FormsModule,
    NgxPaginationModule,
    RouterModule,
    SpinnerComponent,
  ],
  templateUrl: './parcelamentos2.component.html',
  styleUrl: './parcelamentos2.component.css',
})
export class Parcelamentos2Component {
  parc = signal<any[]>([]);
  ps = inject(ParcelamentosService);
  cs = inject(Contas2Service);
  ls = inject(LoadingService);
  sr = signal<number | null>(null);
  hoje0 = new Date().getDate();
  currentSortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  isloading = false;

  p: number = 1; // Página atual
  itemsPerPage: number = 10; // Número de itens por página
  totalItems: number = 0; // Total de itens (para paginação)
  confere0 = signal<number | null>(null); // Use um sinal para confere0

  // Busca e métricas computadas
  termoBusca = signal<string>('');

  totalCompras = computed(() => {
    return this.parc().reduce(
      (acc, item) => acc + (Number(item.valorcompra) || 0),
      0,
    );
  });

  totalMensalParcelas = computed(() => {
    return this.parc().reduce(
      (acc, item) => acc + (Number(item.valorparcela) || 0),
      0,
    );
  });

  parcFiltrados = computed(() => {
    const termo = this.termoBusca().toLowerCase().trim();
    if (!termo) return this.parc();
    return this.parc().filter((item) => {
      const desc = (item.descricao || '').toLowerCase();
      const cartao = (
        item.cartaovinculado?.nome ||
        item.cartaovinculado ||
        ''
      ).toLowerCase();
      const cod = String(item.cod || '').toLowerCase();
      const origem = (item.origem || '').toLowerCase();
      return (
        desc.includes(termo) ||
        cartao.includes(termo) ||
        cod.includes(termo) ||
        origem.includes(termo)
      );
    });
  });

  constructor() {
    this.pegarParc();

    this.cs.pegarUpdate('sh_parcelamento').then((result) => {
      this.confere0.set(result); // Atualize confere0 usando .set()
      console.log(this.confere0());
    });

    effect(() => {
      // Garante que sr() e confere0() não sejam nulos antes de executar o código
      if (this.sr() !== null && this.confere0() !== null) {
        const valorAtrasado = this.sr();
        const confereValor = this.confere0();
        console.log('Valor de confere:', confereValor);
        console.log('Valor de atrasado:', valorAtrasado);

        if (valorAtrasado !== confereValor) {
          this.cs.salvarHistoricoAtrasado(valorAtrasado, 'sh_parcelamento');
        } else {
          console.log('Condição não atendida, não salvando o histórico.');
        }
      }
    });
  }

  async pegarParc() {
    let data: any[] = [];
    data = await this.ps.pegarParc();
    this.parc.set(data);
    this.totalItems = data.length; // Atualiza o total de itens

    console.log(this.parc());
    this.pegarTotal();
  }

  async pegarTotal() {
    this.sr.set(await this.ps.totalizar(this.parc()));
    console.log(this.sr());
  }

  async atualizar() {
    this.isloading = true;
    this.ls.show('Atualizando parcelamentos...');
    this.ls.setProgress(10);

    console.log('atualizando');
    await this.ps.atualizarparc();
    this.ls.setProgress(40);

    await this.pegarParc();
    this.ls.setProgress(70);

    await this.pegarTotal();
    this.ls.setProgress(85);

    await new Promise((resolve) => setTimeout(resolve, 6000));
    this.ls.setProgress(100);

    this.isloading = false;
    this.ls.hide();
  }

  sortTable(column: string) {
    if (this.currentSortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.currentSortColumn = column;
      this.sortDirection = 'asc'; // Reset para crescente quando nova coluna é selecionada
    }

    this.parc().sort((a, b) => {
      const valueA = this.getNestedValue(a, column);
      const valueB = this.getNestedValue(b, column);
      const comparison = this.compareValues(valueA, valueB);
      return this.sortDirection === 'asc' ? comparison : -comparison; // Aplica a direção da ordenação
    });
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, prop) => current?.[prop], obj);
  }

  private compareValues(a: any, b: any): number {
    if (a > b) {
      return 1;
    }
    if (a < b) {
      return -1;
    }
    return 0;
  }

  async excluir(item) {
    console.log('excluindo');
    console.log(item);
    let id = item.id;

    this.ps.desativarParcelamento(id);
    await this.pegarParc();
  }
}
