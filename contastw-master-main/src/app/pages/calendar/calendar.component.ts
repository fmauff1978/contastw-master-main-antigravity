import { CommonModule } from '@angular/common';
import { Component, LOCALE_ID, OnInit } from '@angular/core';
import { TimestampService } from '../../services/timestamp.service';
import { LctosService } from '../../services/lctos.service';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-calendar',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.css',
   providers: [{ provide: LOCALE_ID, useValue: 'pt' }],
})
export class CalendarComponent implements OnInit {
  headers = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
  hoje: Date = new Date(); // Inicializa 'hoje' como uma nova data
  isAuthenticated: boolean = false;
  calendario: any[] = [];
  eventos: any[] = [];
  private authSubscription: Subscription;
  origem = this.getSelectDate(2024, 0, 1);
  totalItems = 42;
  valores: any[] = [];
  mes: string;
  total: number
  nomesMeses = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

  constructor(private ls: LctosService, private ts: TimestampService, private as: AuthService) { }

  ngOnInit(): void {
    this.loadEventsAndCalendar();


    this.authSubscription = this.as.isAuthenticated$.subscribe(isAuth => {
      this.isAuthenticated = isAuth;

    
    });

    
    

    
  }

  async loadEventsAndCalendar(){
    this.iniciar(); // Carrega o calendário inicial
    this.ls.getLctoDespesas().then((x) => {
      this.eventos = x;
      this.processEvents();
      this.updateCalendarEvents();
    });
  }

  processEvents() {
    let nro: number;
    for (let i = 0; i < this.eventos.length; i++) {
      let date0 = this.eventos[i].datalcto.toDate();
      nro = this.ts.differenceinDays(date0, this.origem);
      this.eventos[i].nro = nro;
    }
    this.valores = Array.from(
      this.sumValuesByDate(this.eventos).entries()
    ).map(([nro, total]) => ({ nro, total }));
  }

  updateCalendarEvents() {
    for (const itemA of this.calendario) {
      const itemB = this.valores.find((item) => item.nro == itemA.nro);
      if (itemB) {
        itemA.eventos = itemB;
      } else {
        itemA.eventos = "";
      }
    }
  }

  iniciar() {
    this.calendario = []; // Limpa o calendário anterior
    this.generateCalendar(this.hoje);

    let mes0 = this.hoje.getMonth()
    this.mes = this.nomesMeses[mes0]
    console.log(this.mes)
    
  }

  private generateCalendar(ref: Date) {

     //encontrar o dia da semana em que cai o primeiro dia do mes (array de 0 a 6 => dom a sab)
    const dataprimeirodia = this.getSelectDate(
        ref.getFullYear(),
        ref.getMonth(),
        1
      ).getDay();

      //encontrar a qtde de dias do mes anterior
      const qtdediasdomesanterior = this.getSelectDate(
        ref.getFullYear(),
        ref.getMonth(),
        0
      ).getDate();

      for (let i = dataprimeirodia; i > 0; i--) {
        this.calendario.push({
          day: qtdediasdomesanterior - (i - 1),
          data: this.getSelectDate(
            ref.getFullYear(),
            ref.getMonth() - 1,
            qtdediasdomesanterior - (i - 1)
          ),
          nro: i + 50,
          isCurrentDay: false,
          isCurrentMonth: false,
        });
      }

      //encontrar a qtde de dias do mes atual
      const daysInMonth = this.getSelectDate(
        ref.getFullYear(),
        ref.getMonth() + 1,
        0
      ).getDate();

      //gerar dias do mes atual
      for (let i = 1; i <= daysInMonth; i++) {
        const newDate = this.getSelectDate(
          ref.getFullYear(),
          ref.getMonth(),
          i
        );

        this.calendario.push({
          day: i,
          data: newDate,
          nro: this.ts.differenceinDays(newDate, this.origem),
          isCurrentDay: this.formDate(this.hoje) === this.formDate(newDate),
          isCurrentMonth: true,
        });
      }
      const calendarLength = this.calendario.length;

      for (let i = 1; i <= this.totalItems - calendarLength; i++) {
        const newDate = this.getSelectDate(
          ref.getFullYear(),
          ref.getMonth() + 1,
          i
        );

        this.calendario.push({
          day: i,
          data: this.getSelectDate(
            ref.getFullYear(),
            ref.getMonth() + 1,
            i
          ),
          nro: this.ts.differenceinDays(newDate, this.origem),
          isCurrentDay: false,
          isCurrentMonth: false,
        });
      }

  }

  private getSelectDate(year: number, month: number, day: number) {
    return new Date(year, month, day);
  }

  private formDate(date: Date) {
    return `${date.getFullYear()}/${date.getMonth()}/${date.getDate()}`;
  }

  sumValuesByDate(items): Map<string, number> {
    const sumMap = new Map<string, number>();

    items.forEach((item) => {
      const x = item.nro;
      const currentValue = sumMap.get(x) || 0;
      sumMap.set(x, currentValue + item.valor);
    });
    return sumMap;
  }

  mesanterior() {
    this.hoje = new Date(this.hoje.getFullYear(), this.hoje.getMonth() - 1, 1); // atualiza o this.hoje
    this.loadEventsAndCalendar()

  }

  proximomes() {
    this.hoje = new Date(this.hoje.getFullYear(), this.hoje.getMonth() + 1, 1); // Atualiza o this.hoje
    this.loadEventsAndCalendar();
  }

 
}
