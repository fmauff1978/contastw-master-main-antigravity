import { Component, LOCALE_ID, OnInit } from '@angular/core';
import { ParcelamentosService } from '../../services/parcelamentos.service';
import { doc, Timestamp, updateDoc } from 'firebase/firestore';
import { FirestoreService } from '../../services/firestore.service';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { TimestampService } from '../../services/timestamp.service';

@Component({
  selector: 'app-faturas',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './faturas.component.html',
  styleUrl: './faturas.component.css',
  providers: [{ provide: LOCALE_ID, useValue: 'pt' }],
})
export class FaturasComponent implements OnInit{

  hoje = Timestamp.now();
  mes: number;
  mesatual: string;
  ano: number;
  arrayDatas1: any[] = [];
  montante: number;
  p: any;
  parc: any[] = [];
  currentMonthIndex: number; // Índice do mês atual (0 = janeiro, 1 = fevereiro, etc.)

  constructor(
    private ps: ParcelamentosService,
    private fs: FirestoreService,
    private ts: TimestampService
  ) {}

  ngOnInit() {
    this.currentMonthIndex = this.ts.getMonthFromTimestamp(this.hoje) -1;  // Inicializa com o mês atual -1 pq o indice do array comeca em zero

    this.updateMonthData();
  }

  private updateMonthData() {
    this.mes = this.currentMonthIndex +1;
    this.ano = this.ts.getYearFromTimestamp(this.hoje);
    this.mesatual = this.ts.getMonthName(this.mes);

    let inicio = this.ts.calendar2025[this.currentMonthIndex].inicio;
    let inicioTimestamp = this.ts.convertIsoStringToFirebaseTimestamp(inicio);
    let fim = this.ts.calendar2025[this.currentMonthIndex].fim;
    let fimTimestamp = this.ts.convertIsoStringToFirebaseTimestamp(fim);


    // this.ps.pegarFaturasMes(inicioTimestamp, fimTimestamp).then((x) => {
    //   this.parc = x;
    //   this.montante = x.reduce((a, b) => a + b.valorparcela, 0);
    // });
  }

  prox() {
      this.currentMonthIndex++;
      if (this.currentMonthIndex >= 12){ //Se passar dezembro, volta para janeiro e avanca o ano
        this.currentMonthIndex= 0;
        this.ano++;
      }

      this.updateMonthData();

  }

  anterior() {
    this.currentMonthIndex--;
    if (this.currentMonthIndex < 0) { // Se passar janeiro, volta para dezembro e decrementa o ano
        this.currentMonthIndex = 11;
        this.ano--;
    }
    this.updateMonthData();
}


  async teste() {
    for (let i = 0; i < this.parc.length; i++) {
      let id = this.parc[i].id;
      let hoje = Timestamp.now();
      let data = this.parc[i].dataparcela;

      if (data < hoje) {
        const docRef = doc(this.fs.db, 'faturas', id);
        await updateDoc(docRef, { ativa: false });
      }
    }
  }

  teste2() {
    for (let i = 0; i < this.ts.calendar2025.length; i++) {
      let data = this.ts.calendar2025[i].inicio;
      let data2 = this.ts.calendar2025[i].fim;
      let mes = this.ts.calendar2025[i].id;

      let inicio = this.ts.convertIsoStringToFirebaseTimestamp(data);
      let fim = this.ts.convertIsoStringToFirebaseTimestamp(data2);

      const arrayDatas = {
        mes: mes,
        inicio: inicio,
        fim: fim,
      };

      this.arrayDatas1.push(arrayDatas);
    }
  }



  sortTable(column: string) {
    this.parc.sort((a, b) => {
      if (a[column] > b[column]) {
        return 1;
      }
      if (a[column] < b[column]) {
        return -1;
      }
      return 0;
    });
  }

  excluirData(item){
      console.log("excluindo")
      console.log(item);
    let id = item.id;

    this.ps.desativarParcela(id)




  }



// hoje = Timestamp.now();
// mes: any
// mesatual: any
// ano: number
// arrayDatas1: any[]=[]
// montante: number




// p: any;
// sortTable(arg0: string) {
// throw new Error('Method not implemented.');
// }


//   parc : any []=[]


//   constructor(private ps: ParcelamentosService, private fs: FirestoreService, private ts: TimestampService){}


//   //    this.ps.pegarFaturasMes(this.ts.calendar2024[this.mes-1].inicio, this.ts.calendar2024[this.mes-1].fim).then((x)=>{

//   //     this.parc = x

//   //    console.log(this.parc)

//   //  })


// ngOnInit(){
//   this.mes = this.ts.getMonthFromTimestamp(this.hoje);
//   console.log(this.mes)
//   this.ano = this.ts.getYearFromTimestamp(this.hoje);
//   this.mesatual = this.ts.getMonthName(this.mes)

//   let teste = this.ts.calendar2024[this.mes-1].inicio
//   let teste0 = this.ts.convertIsoStringToFirebaseTimestamp(teste)
//   let teste10 = this.ts.calendar2024[this.mes-1].fim
//   let teste100 = this.ts.convertIsoStringToFirebaseTimestamp(teste10)

//   console.log(teste0)


//   this.ps.pegarFaturasMes(teste0, teste100).then((x)=>{

//          this.parc = x

//      console.log(this.parc)

//      this.montante = x.reduce(function (a, b) {
//       return a + b.valorparcela;
//     }, 0);



//      })


// //  this.teste2()





//   }



//   // teste(){


//   //   for (let i=0; i<this.parc.length; i++){

//   //     let cod = this.parc[i].cod
//   //     let cartao = this.parc[i].cartaovinculado.nome
//   //     let datainic = this.parc[i].dataparcela
//   //     let compra = this.parc[i].descricao
//   //     let mult = this.parc[i].qtdedeparcelas
//   //     let valor = this.parc[i].valorparcela


//   //     this.ps.gerarFatura(cod, cartao, datainic, compra, mult, valor)





//   //   }

//   //   console.log("terminado")

//   // }

//   async teste(){

//       for(let i=0; i<this.parc.length; i++){


//         let id = this.parc[i].id
//         let hoje = Timestamp.now();
//         let data = this.parc[i].dataparcela;

//         if (data<hoje){

//           const docRef = doc(this.fs.db, 'faturas', id);
//               await updateDoc(docRef, { ativa: false });
//               console.log("foi")


//         }else{
//           console.log("em ser")
//         }





// }

//   }

//   teste2(){

//     for (let i=0; i<this.ts.calendar2025.length; i++){


//       let data = this.ts.calendar2025[i].inicio
//       let data2 = this.ts.calendar2025[i].fim
//       let mes = this.ts.calendar2025[i].id

//       let inicio = this.ts.convertIsoStringToFirebaseTimestamp(data)
//       let fim = this.ts.convertIsoStringToFirebaseTimestamp(data2)

//       const arrayDatas = {

//         mes: mes,
//         inicio: inicio,
//         fim: fim

//       }

//    this.arrayDatas1.push(arrayDatas)





//     }


//     console.log(this.arrayDatas1)

//   }

//   prox(){


//     let zero = this.ts.addMonths(this.hoje, 0)




//     this.hoje = this.ts.dateToFirebaseTimestamp(zero)

//     console.log(this.hoje)

//     this.ngOnInit()




//   }



}
