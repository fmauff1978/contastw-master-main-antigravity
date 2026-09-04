import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Component,
  computed,
  effect,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import {
  addDoc,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { FirestoreService } from '../../services/firestore.service';
import { TimestampService } from '../../services/timestamp.service';
import { CadComponent } from '../../shared/modal/agenda/cad/cad.component';
import { EditComponent } from '../../shared/modal/agenda/edit/edit.component';
import { Contas2Service } from '../../services/contas2.service';

@Component({
  selector: 'app-agenda2',
  imports: [CommonModule, FormsModule, CadComponent, EditComponent],
  templateUrl: './agenda2.component.html',
  styleUrl: './agenda2.component.css',
})
export class Agenda2Component {
  fs = inject(FirestoreService);
  ts = inject(TimestampService);
  cs = inject(Contas2Service);
  atrasado = signal<number | null>(null);
  agenda = signal<any[]>([]);
  agendaatrasada = signal<any[]>([]);
  extrapolados: any;

  // Filtros e busca
  termoBusca = signal<string>('');
  filtroStatus = signal<'todos' | 'atrasados' | 'em_dia'>('todos');

  // Totais computados
  totalAgendado = computed(() => {
    return this.agenda().reduce(
      (acc, item) => acc + (Number(item.valor) || 0),
      0,
    );
  });

  totalAtrasadosCount = computed(() => {
    return this.agenda().filter(
      (item) =>
        item.agendado_para &&
        this.isOlderThanThreshold(item.agendado_para.toDate()),
    ).length;
  });

  itensEmDiaCount = computed(() => {
    return this.agenda().length - this.totalAtrasadosCount();
  });

  // Lista filtrada
  agendaFiltrada = computed(() => {
    let items = this.agenda();
    const status = this.filtroStatus();
    const termo = this.termoBusca().toLowerCase().trim();

    if (status === 'atrasados') {
      items = items.filter(
        (i) =>
          i.agendado_para &&
          this.isOlderThanThreshold(i.agendado_para.toDate()),
      );
    } else if (status === 'em_dia') {
      items = items.filter(
        (i) =>
          i.agendado_para &&
          !this.isOlderThanThreshold(i.agendado_para.toDate()),
      );
    }

    if (termo) {
      items = items.filter(
        (i) =>
          (i.descricao && i.descricao.toLowerCase().includes(termo)) ||
          (i.origem && i.origem.toLowerCase().includes(termo)) ||
          (i.recor && i.recor.toLowerCase().includes(termo)),
      );
    }

    return items;
  });

  total = signal<number[]>([]);
  showModal3: boolean;
  selectedItem: any;
  showModal4: any;
  update: any;

  confere: number;

  constructor() {
    this.fs.conectar();
    this.pegarAgenda();
    //this.atrasados();

    this.cs.pegarUpdate('sh_agenda').then((result) => {
      this.confere = result;
    });

    effect(async () => {
      console.log('Valor de confere:', this.confere);

      const valorAtrasado = this.atrasado(); // Capture o valor atual
      console.log('Valor de atrasado:', valorAtrasado);

      // Verifique se valorAtrasado não é nulo E é diferente de confere.
      if (valorAtrasado !== null && valorAtrasado !== this.confere) {
        // Verifique se não é nulo antes de salvar
        this.cs.salvarHistoricoAtrasado(valorAtrasado, 'sh_agenda');
      } else {
        console.log('Condição não atendida, não salvando o histórico.');
      }
    });
  }

  async pegarAgenda() {
    await this.atualizarCartoes();
    const colRef = collection(this.fs.db, 'agenda');
    const q = query(
      colRef,
      where('ativa', '==', true),
      orderBy('agendado_para', 'asc'),
    );

    const qs = await getDocs(q);
    const items: any[] = [];
    qs.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() });
    });
    this.agenda.set(items);
    console.log(this.agenda());
    //console.log('Array de objetos do Firestore:', this.agenda());

    await this.atrasados();
  }

  async atrasados() {
    const hoje = new Date();

    const colRef = collection(this.fs.db, 'agenda');
    const q = query(
      colRef,
      where('ativa', '==', true),
      where('agendado_para', '<', hoje),
    );

    const qs = await getDocs(q);
    const items: any[] = [];
    qs.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() });
    });
    this.agendaatrasada.set(items);
    console.log(this.agendaatrasada());

    this.calcularTotalAtrasado();
  }

  async calcularTotalAtrasado() {
    const hoje = new Date();
    const novoTotal: number[] = []; // Criar um novo array para armazenar os valores calculados

    for (let i = 0; i < this.agendaatrasada().length; i++) {
      let data = this.agendaatrasada()[i].agendado_para.toDate();
      let diff = this.ts.differenceinDays(data, hoje) / 30 - 1;
      let diff0 = Math.trunc(diff);
      let montante = this.agendaatrasada()[i].valor * (diff0 * -1);

      novoTotal.push(montante); // Adicionar o valor calculado ao novo array
    }

    this.total.set(novoTotal); // Definir o signal total com o novo array

    // Recalcular o valor de atrasado após atualizar o array total
    this.atrasado.set(novoTotal.reduce((a, b) => a + b, 0));
  }

  isOlderThanThreshold(date: Date): boolean {
    if (!date) return false;
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d < hoje;
  }

  isDueToday(date: Date): boolean {
    if (!date) return false;
    const hoje = new Date();
    const d = new Date(date);
    return (
      d.getDate() === hoje.getDate() &&
      d.getMonth() === hoje.getMonth() &&
      d.getFullYear() === hoje.getFullYear()
    );
  }

  incluir() {
    this.showModal3 = true;
  }

  closeModal() {
    this.showModal3 = false;
  }

  async concluir(item) {
    console.log(item);

    let id = item.id;
    let recor = item.recor;
    let dia = item.agendado_para;
    switch (recor) {
      case 'mensal':
        let proxdata = await this.ts.addMonths(dia, 1);

        console.log(proxdata);

        this.changeParams(proxdata, id);

        this.pegarAgenda();

        break;
      case 'semanal':
        let prox0 = this.ts.timestampToDate(dia);

        let proxdata0 = this.ts.addDays(prox0, 7);

        console.log(proxdata0);

        this.changeParams(proxdata0, id);

        this.pegarAgenda();

        break;
      case 'quinzenal':
        let prox = this.ts.timestampToDate(dia);
        let proxdata15 = this.ts.addDays(prox, 14);

        console.log(proxdata15);

        this.changeParams(proxdata15, id);

        this.pegarAgenda();

        break;
      case 'anual':
        let proxdata365 = this.ts.addDays(dia, 365);

        console.log(proxdata365);

        this.changeParams(proxdata365, id);
        this.pegarAgenda();

        break;
      case 'sem repeticao':
        const docRef = doc(this.fs.db, 'agenda', id);
        await updateDoc(docRef, {
          ativa: false,
          atualizado_em: Timestamp.now(),
        });

        this.pegarAgenda();

        break;

      default:
        console.error('Mês inválido:');
        return; // Encerra a função se o mês for inválido
    }
  }

  async changeParams(param, id) {
    const docRef = doc(this.fs.db, 'agenda', id);
    await updateDoc(docRef, {
      agendado_para: param,
      atualizado_em: Timestamp.now(),
    });
  }

  editar(item) {
    console.log(item);
    this.selectedItem = item;
    this.showModal4 = true;
    // this.atrasados();
  }

  saveData() {
    this.showModal3 = false;

    this.pegarAgenda(); // Atualiza a lista após salvar
  }

  async excluir(item) {
    console.log(item);
    let id = item.id;

    const docRef = doc(this.fs.db, 'agenda', id);
    await updateDoc(docRef, { ativa: false });

    await this.pegarAgenda();
  }

  async atualizarCartoes() {
    let recargapay =
      (await this.cs.getFieldValue(
        'contas2025',
        'TPdAy0N5dEVsmIqQR7so',
        'saldo',
      )) * -1;
    let mercadopago =
      (await this.cs.getFieldValue(
        'contas2025',
        'oFYxxhtsskWjIAgGkHCC',
        'saldo',
      )) * -1;
    let c6 =
      (await this.cs.getFieldValue(
        'contas2025',
        'eWsogm3EviaWI5rqGA0P',
        'saldo',
      )) * -1;
    let neon =
      (await this.cs.getFieldValue(
        'contas2025',
        'hMvc1QoKKzIQ58wXjemz',
        'saldo',
      )) * -1;
    const docRef = doc(this.fs.db, 'agenda', 'EGxs3uigUMvWmLqSvZTG');
    await updateDoc(docRef, {
      valor: recargapay,
      atualizado_em: Timestamp.now(),
    });
    const docRef2 = doc(this.fs.db, 'agenda', 'F25iNGD5Xn2PDKeMqzYi');
    await updateDoc(docRef2, {
      valor: mercadopago,
      atualizado_em: Timestamp.now(),
    });
    const docRef3 = doc(this.fs.db, 'agenda', 'kyfCXh19UbHisccT7FPy');
    await updateDoc(docRef3, { valor: c6, atualizado_em: Timestamp.now() });
    const docRef4 = doc(this.fs.db, 'agenda', 'zk9PcbIJFlAHbjFV44c2');
    await updateDoc(docRef4, { valor: neon, atualizado_em: Timestamp.now() });
  }
}
