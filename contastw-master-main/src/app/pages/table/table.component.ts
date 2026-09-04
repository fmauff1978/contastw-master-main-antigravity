import { Component, LOCALE_ID } from '@angular/core';
import { ContasService } from '../../services/contas.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-table',
  imports: [CommonModule],
  templateUrl: './table.component.html',
  styleUrl: './table.component.css',
  providers: [{ provide: LOCALE_ID, useValue: 'pt' }],
})
export class TableComponent {

  items: any[] = [];
  items2: any[] = [];
  items3: any[] = [];
  fonte: any[] = [];
  ativo: number;
  passivo: number;
  resultado: number;
  superavit: number;
  aum: number;
  dl: number;
  dc: number;
  dg: number;
  dfo: number;

  
  constructor(private cs: ContasService) {
    this.cs.pegarAtivo().subscribe((items) => {
      this.items = items;
    

      
    });


    this.cs.pegarPassivo().subscribe((items) => {
      this.items2 = items;
    

     
    });

    this.cs.pegarResultado().subscribe((items) => {
      this.items3 = items;
   

     
    });
   
  }

}
