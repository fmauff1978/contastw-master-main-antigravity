import { Injectable } from '@angular/core';
import {
  collection,
  getDocs,
  query,
  Timestamp,
  where,
} from 'firebase/firestore';
import { FirestoreService } from './firestore.service';
import { BehaviorSubject } from 'rxjs';
import { LctosService } from './lctos.service';

@Injectable({
  providedIn: 'root',
})
export class TimestampService {
  private selectedDateSource = new BehaviorSubject<Date | null>(null);
  selectedDate$ = this.selectedDateSource.asObservable();
  ano: number = new Date().getFullYear();


  calendar = [
    {
      inicio: new Date(this.ano, 0, 1),
      fim: new Date(this.ano, 0, 31),
      label: [`ano${this.ano}.jan`],
    },
    {
      inicio: new Date(this.ano, 0, 1),
      fim: new Date(this.ano, 1, 28),
       label: [`ano${this.ano}.fev`],

    },
    {
      inicio: new Date(this.ano, 0, 1),
      fim: new Date(this.ano, 2, 31),
     label: [`ano${this.ano}.mar`],
    },
    {
      inicio: new Date(this.ano, 0, 1),
      fim: new Date(this.ano, 3, 30),
       label: [`ano${this.ano}.abr`],
    },
    {
      inicio: new Date(this.ano, 0, 1),
      fim: new Date(this.ano, 4, 31),
    label: [`ano${this.ano}.mai`],
    },
    {
      inicio: new Date(this.ano,0, 1),
      fim: new Date(this.ano, 5, 30),
       label: [`ano${this.ano}.jun`]},
    {
      inicio: new Date(this.ano, 0, 1),
      fim: new Date(this.ano, 6, 31),
      label: [`ano${this.ano}.jul`],
    },
    {
      inicio: new Date(this.ano, 0, 1),
      fim: new Date(this.ano, 7, 31),
      label: [`ano${this.ano}.ago`],
    },
    {
      inicio: new Date(this.ano, 0, 1),
      fim: new Date(this.ano, 8, 30),
      label: [`ano${this.ano}set`],
    },
    {
      inicio: new Date(this.ano, 0, 1),
      fim: new Date(this.ano, 9, 31),
       label: [`ano${this.ano}.out`],
    },
    {
      inicio: new Date(this.ano, 0, 1),
      fim: new Date(this.ano, 10, 30),
       label: [`ano${this.ano}.nov`],
    },
    {
      inicio: new Date(this.ano, 0, 1),
      fim: new Date(this.ano, 11, 31),
       label: [`ano${this.ano}.dez`],
    },
  ];

  caldesp = [
    {
      inicio: new Date(this.ano, 0, 1),
      fim: new Date(this.ano, 0, 31),
      label: [`ano${this.ano}.jan`],
    },
    {
      inicio: new Date(this.ano, 1, 1),
      fim: new Date(this.ano, 1, 28),
       label: [`ano${this.ano}.fev`],

    },
    {
      inicio: new Date(this.ano, 2, 1),
      fim: new Date(this.ano, 2, 31),
     label: [`ano${this.ano}.mar`],
    },
    {
      inicio: new Date(this.ano, 3, 1),
      fim: new Date(this.ano, 3, 30),
       label: [`ano${this.ano}.abr`],
    },
    {
      inicio: new Date(this.ano, 4, 1),
      fim: new Date(this.ano, 4, 31),
    label: [`ano${this.ano}.mai`],
    },
    {
      inicio: new Date(this.ano, 5, 1),
      fim: new Date(this.ano, 5, 30),
       label: [`ano${this.ano}.jun`]},
    {
      inicio: new Date(this.ano, 6, 1),
      fim: new Date(this.ano, 6, 31),
      label: [`ano${this.ano}.jul`],
    },
    {
      inicio: new Date(this.ano, 7, 1),
      fim: new Date(this.ano, 7, 31),
      label: [`ano${this.ano}.ago`],
    },
    {
      inicio: new Date(this.ano, 8, 1),
      fim: new Date(this.ano, 8, 30),
      label: [`ano${this.ano}set`],
    },
    {
      inicio: new Date(this.ano, 9, 1),
      fim: new Date(this.ano, 9, 31),
       label: [`ano${this.ano}.out`],
    },
    {
      inicio: new Date(this.ano, 10, 1),
      fim: new Date(this.ano, 10, 30),
       label: [`ano${this.ano}.nov`],
    },
    {
      inicio: new Date(this.ano, 11, 1),
      fim: new Date(this.ano, 11, 31),
       label: [`ano${this.ano}.dez`],
    },
  ];

  calendar2025 = [
    { id: 0, inicio: '2025-01-01T00:00:00Z', fim: '2025-01-31T23:59:59Z' },
    { id: 1, inicio: '2025-02-01T00:00:00Z', fim: '2025-02-28T23:59:59Z' },
    { id: 2, inicio: '2025-03-01T00:00:00Z', fim: '2025-03-31T23:59:59Z' },
    { id: 3, inicio: '2025-04-01T00:00:00Z', fim: '2025-04-30T23:59:59Z' },
    { id: 4, inicio: '2025-05-01T00:00:00Z', fim: '2025-05-31T23:59:59Z' },
    { id: 5, inicio: '2025-06-01T00:00:00Z', fim: '2025-06-30T23:59:59Z' },
    { id: 6, inicio: '2025-07-01T00:00:00Z', fim: '2025-07-31T23:59:59Z' },
    { id: 7, inicio: '2025-08-01T00:00:00Z', fim: '2025-08-31T23:59:59Z' },
    { id: 8, inicio: '2025-09-01T00:00:00Z', fim: '2025-09-30T23:59:59Z' },
    { id: 9, inicio: '2025-10-01T00:00:00Z', fim: '2025-10-31T23:59:59Z' },
    { id: 10, inicio: '2025-11-01T00:00:00Z', fim: '2025-11-30T23:59:59Z' },
    { id: 11, inicio: '2025-12-01T00:00:00Z', fim: '2025-12-31T23:59:59Z' },
  ];

  calendar2024 = [
    { id: 0, inicio: '2024-01-01T00:00:00Z', fim: '2024-01-31T23:59:59Z' },
    { id: 1, inicio: '2024-02-01T00:00:00Z', fim: '2024-02-29T23:59:59Z' },
    { id: 2, inicio: '2024-03-01T00:00:00Z', fim: '2024-03-31T23:59:59Z' },
    { id: 3, inicio: '2024-04-01T00:00:00Z', fim: '2024-04-30T23:59:59Z' },
    { id: 4, inicio: '2024-05-01T00:00:00Z', fim: '2024-05-31T23:59:59Z' },
    { id: 5, inicio: '2024-06-01T00:00:00Z', fim: '2024-06-30T23:59:59Z' },
    { id: 6, inicio: '2024-07-01T00:00:00Z', fim: '2024-07-31T23:59:59Z' },
    { id: 7, inicio: '2024-08-01T00:00:00Z', fim: '2024-08-31T23:59:59Z' },
    { id: 8, inicio: '2024-09-01T00:00:00Z', fim: '2024-09-30T23:59:59Z' },
    { id: 9, inicio: '2024-10-01T00:00:00Z', fim: '2024-10-31T23:59:59Z' },
    { id: 10, inicio: '2024-11-01T00:00:00Z', fim: '2024-11-30T23:59:59Z' },
    { id: 11, inicio: '2024-12-01T00:00:00Z', fim: '2024-12-31T23:59:59Z' },
  ];

  fullyear2024 = [
    { id: 0, inicio: '2024-01-01T00:00:00Z', fim: '2024-12-31T23:59:59Z' },
  ];

  fullyear2025 = [
    { id: 0, inicio: '2025-01-01T00:00:00Z', fim: '2025-12-31T23:59:59Z' },
  ];

  calendar2024ts = [
    { id: 0, inicio: 1704067200, fim: 1706745599 },
    { id: 1, inicio: 1706745600, fim: 1709251199 },
    { id: 2, inicio: 1709251200, fim: 1711929599 },
    { id: 3, inicio: 1711929600, fim: 1714521599 },
    { id: 4, inicio: 1714521600, fim: 1717199999 },
    { id: 5, inicio: 1717200000, fim: 1719791999 },
    { id: 6, inicio: 1719792000, fim: 1722470399 },
    { id: 7, inicio: 1722470400, fim: 1725148799 },
    { id: 8, inicio: 1725148800, fim: 1727740799 },
    { id: 9, inicio: 1727740800, fim: 1730419199 },
    { id: 10, inicio: 1730419200, fim: 1733011199 },
    { id: 11, inicio: '1733011200', fim: '1735689599' },
  ];

  calendar2025ts = [
    { id: 0, inicio: 1735689600, fim: 1738367999 },
    { id: 1, inicio: 1738368000, fim: 1740787199 },
    { id: 2, inicio: 1740787200, fim: 1743465599 },
    { id: 3, inicio: 1743465600, fim: 1746057599 },
    { id: 4, inicio: 1746057600, fim: 1748735999 },
    { id: 5, inicio: 1748736000, fim: 1751327999 },
    { id: 6, inicio: 1751328000, fim: 1754006399 },
    { id: 7, inicio: 1754006400, fim: 1756684799 },
    { id: 8, inicio: 1756684800, fim: 1759276799 },
    { id: 9, inicio: 1759276800, fim: 1761955199 },
    { id: 10, inicio: 1761955200, fim: 1764547199 },
    { id: 11, inicio: 1764547200, fim: 1767225599 },
  ];

  standardCalendarAtivoPassivoResultado = [
    {
      inicio: new Date(this.ano, 0, 1),
      fim: new Date(this.ano, 0, 31),
      label: 'ano' + this.ano + '.jan',
    },
    {
      inicio: new Date(this.ano, 0, 1),
      fim: new Date(this.ano, 1, 28),
      label: 'ano' + this.ano + '.fev',
    },
    {
      inicio: new Date(this.ano, 0, 1),
      fim: new Date(this.ano, 2, 31),
      label: 'ano' + this.ano + '.mar',
    },
    {
      inicio: new Date(this.ano, 0, 1),
      fim: new Date(this.ano, 3, 30),
      label: 'ano' + this.ano + '.abr',
    },
    {
      inicio: new Date(this.ano, 0, 1),
      fim: new Date(this.ano, 4, 31),
      label: 'ano' + this.ano + '.mai',
    },
    {
      inicio: new Date(this.ano, 0, 1),
      fim: new Date(this.ano, 5, 30),
      label: 'ano' + this.ano + '.jun',
    },
    {
      inicio: new Date(this.ano, 0, 1),
      fim: new Date(this.ano, 6, 31),
      label: 'ano' + this.ano + '.jul',
    },
    {
      inicio: new Date(this.ano, 0, 1),
      fim: new Date(this.ano, 7, 31),
      label: 'ano' + this.ano + '.ago',
    },
    {
      inicio: new Date(this.ano, 0, 1),
      fim: new Date(this.ano, 8, 30),
      label: 'ano' + this.ano + '.set',
    },
    {
      inicio: new Date(this.ano, 0, 1),
      fim: new Date(this.ano, 9, 31),
      label: 'ano' + this.ano + '.out',
    },
    {
      inicio: new Date(this.ano, 0, 1),
      fim: new Date(this.ano, 10, 30),
      label: 'ano' + this.ano + '.nov',
    },
    {
      inicio: new Date(this.ano, 0, 1),
      fim: new Date(this.ano, 11, 31),
      label: 'ano' + this.ano + '.dez',
    },
  ];

   standardCalendarDespesaReceita = [
    {
      inicio: new Date(this.ano, 0, 1),
      fim: new Date(this.ano, 0, 31),
      label: [`ano${this.ano}.jan`],
    },
    {
      inicio: new Date(this.ano, 1, 1),
      fim: new Date(this.ano, 1, 28),
       label: [`ano${this.ano}.fev`],

    },
    {
      inicio: new Date(this.ano, 2, 1),
      fim: new Date(this.ano, 2, 31),
     label: [`ano${this.ano}.mar`],
    },
    {
      inicio: new Date(this.ano, 3, 1),
      fim: new Date(this.ano, 3, 30),
       label: [`ano${this.ano}.abr`],
    },
    {
      inicio: new Date(this.ano, 4, 1),
      fim: new Date(this.ano, 4, 31),
    label: [`ano${this.ano}.mai`],
    },
    {
      inicio: new Date(this.ano, 5, 1),
      fim: new Date(this.ano, 5, 30),
       label: [`ano${this.ano}.jun`]},
    {
      inicio: new Date(this.ano, 6, 1),
      fim: new Date(this.ano, 6, 31),
      label: [`ano${this.ano}.jul`],
    },
    {
      inicio: new Date(this.ano, 7, 1),
      fim: new Date(this.ano, 7, 31),
      label: [`ano${this.ano}.ago`],
    },
    {
      inicio: new Date(this.ano, 8, 1),
      fim: new Date(this.ano, 8, 30),
      label: [`ano${this.ano}set`],
    },
    {
      inicio: new Date(this.ano, 9, 1),
      fim: new Date(this.ano, 9, 31),
       label: [`ano${this.ano}.out`],
    },
    {
      inicio: new Date(this.ano, 10, 1),
      fim: new Date(this.ano, 10, 30),
       label: [`ano${this.ano}.nov`],
    },
    {
      inicio: new Date(this.ano, 11, 1),
      fim: new Date(this.ano, 11, 31),
       label: [`ano${this.ano}.dez`],
    },
  ];



  up: any[] = [];
  expenses: any;
  constructor(private fs: FirestoreService) {

    this.fs.conectar()
  }

  converterDataForm(data) {
    const parts = data.split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Subtrair 1 para o índice baseado em zero
    const day = parseInt(parts[2], 10);
    const date0 = new Date(year, month, day);
    const timestamp = Timestamp.fromDate(date0);
    return timestamp;
  }

  roundToNDecimals(num: number, n = 2): number {
  const factor = Math.pow(10, n);
  return Math.round((num + Number.EPSILON) * factor) / factor;
}

  diasDecorridos(): number {
    const date1 = new Date(`${this.ano-1}-12-31T00:00:00`);
    //const date1 = new Date('2024-12-31T00:00:00');
    const ts1 = Timestamp.fromDate(date1);

    const date2 = new Date();
    const ts2 = Timestamp.fromDate(date2);

    const passado = ts1.toMillis();
    const hoje = ts2.toMillis();

    const differenceInMillis = hoje - passado;

    // Convert milliseconds to days
    const differenceInDays = Math.floor(
      differenceInMillis / (1000 * 60 * 60 * 24)
    );

   // const diasfaltantes = 365 - differenceInDays;

    // Do something with the difference in days

    console.log(`Difference in days: ${differenceInDays}`);
    // console.log(diasfaltantes);

    return differenceInDays;
  }

   roundToTwoDecimals(num: number): number {
    return Math.round((num + Number.EPSILON) * 100) / 100;
  }


  getMonthName(monthNumber: number): string {
    const monthNames = [
      'Janeiro',
      'Fevereiro',
      'Março',
      'Abril',
      'Maio',
      'Junho',
      'Julho',
      'Agosto',
      'Setembro',
      'Outubro',
      'Novembro',
      'Dezembro',
    ];
    return monthNames[monthNumber - 1]; // Subtraímos 1 porque os arrays são indexados de 0
  }

  async log() {
    const colRef = collection(this.fs.db, 'update');
    const qs0 = query(colRef, where('reg', '==', 1));

    const qs = await getDocs(qs0);
      let up : any[]=[]

    up = qs.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    let posicao = up[0].log;

    console.log(posicao)

    return posicao


  }

  millisecondsToMonths(milliseconds) {
    const seconds = milliseconds / 1000;
    const minutes = seconds / 60;
    const hours = minutes / 60;
    const days = hours / 24;
    const months = days / 30.44; // Average number of days in a month

    return Math.trunc(months); // Round down to the nearest whole month
  }

 async addMonths(date, months) {
    const data0 = date.toDate();
    console.log(data0);
    // const newDate = new Date(data0.valueOf());
    // console.log(newDate)
    const currentMonth = data0.getMonth();
   // console.log(currentMonth);
    const newMonth = currentMonth + months;
    //console.log(newMonth);
    data0.setMonth(newMonth);
    // Verifique se o dia do mês mudou após adicionar os meses
    if (data0.getDate() !== data0.getDate()) {
      // Ajuste a data para o último dia do mês anterior
      data0.setDate(0);
    }
    return data0;
  }

  addDays(data, days) {
    data.setDate(data.getDate() + days);

    const newTS = Timestamp.fromDate(data);

    return newTS;
  }

  dateToFirebaseTimestamp(date: Date): Timestamp {
    const seconds = Math.floor(date.getTime() / 1000);
    const nanoseconds = (date.getTime() % 1000) * 1000000;
    return new Timestamp(seconds, nanoseconds);
  }

  getMonthFromTimestamp(timestamp: Timestamp): number {
    const date = timestamp.toDate();
    const month = date.getMonth() + 1; // Adiciona 1 para obter o mês correto (1-12)
    return month;
  }

  getYearFromTimestamp(timestamp: Timestamp): number {
    const date = timestamp.toDate();
    const year = date.getFullYear();
    return year;
  }

  convertIsoStringToFirebaseTimestamp(isoString: string): Timestamp {
    const date = new Date(isoString);
    return Timestamp.fromDate(date);
  }

  hasExpenses(date: Date): boolean {
    return this.expenses.some((expense) => this.isSameDay(expense.date, date));
  }

  getExpenses(date: Date) {
    return this.expenses.filter((expense) =>
      this.isSameDay(expense.date, date)
    );
  }

  setSelectedDate(date: Date | null): void {
    this.selectedDateSource.next(date);
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  }

  differenceinDays(date0, date10): number {
    const date1 = new Date(date0);
    const ts1 = Timestamp.fromDate(date1);

    const date2 = new Date(date10);
    const ts2 = Timestamp.fromDate(date2);

    const passado = ts1.toMillis();
    const hoje = ts2.toMillis();

    const differenceInMillis = passado - hoje ;

    // Convert milliseconds to days
    const differenceInDays = Math.floor(
      differenceInMillis / (1000 * 60 * 60 * 24)
    );

    //const diasfaltantes = 365 - differenceInDays;

    // Do something with the difference in days

   // console.log(`Difference in days: ${differenceInDays}`);
    // console.log(diasfaltantes);

    return differenceInDays;
  }

  timestampToDate(timestamp: Timestamp): Date {
    return timestamp.toDate();
  }


 calcularDiferencaMeses(futureTimestamp: Timestamp): number {
  // Obtém a data atual
  const hoje = new Date();

  // Converte o timestamp do Firebase para um objeto Date
  const futureDate = futureTimestamp.toDate();

  // Calcula a diferença de anos e meses
  const anoAtual = hoje.getFullYear();
  const mesAtual = hoje.getMonth();
  const anoFuturo = futureDate.getFullYear();
  const mesFuturo = futureDate.getMonth();

  return (anoFuturo - anoAtual) * 12 + (mesFuturo - mesAtual);
}

// Exemplo de uso
//const futureTimestamp = Timestamp.fromDate(new Date("2026-07-01"));


difAposentadoria(){

  const futureTimestamp = Timestamp.fromDate(new Date("2034-01-01"));
  let diff = this.calcularDiferencaMeses(futureTimestamp)
  console.log(diff)
  return diff
}




}
