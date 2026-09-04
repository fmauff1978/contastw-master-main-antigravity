import { Component, computed, inject, signal } from '@angular/core';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { FirestoreService } from '../../services/firestore.service';
import { CommonModule } from '@angular/common';
import { ModalcadoutroscredoresComponent } from "../../shared/modal/modalcadoutroscredores/modalcadoutroscredores.component";
import { IncrementaroutroscredoresComponent } from "../../shared/modal/incrementaroutroscredores/incrementaroutroscredores.component";
import { Contas2Service } from '../../services/contas2.service';

@Component({
  selector: 'app-outroscredores',
  imports: [CommonModule, ModalcadoutroscredoresComponent, IncrementaroutroscredoresComponent],
  templateUrl: './outroscredores.component.html',
  styleUrl: './outroscredores.component.css'
})
export class OutroscredoresComponent {


  fs = inject(FirestoreService)
  cs = inject(Contas2Service)
  oc = signal<any[]>([]);
  sr = signal<number>(0);

prov= signal<any[]>([]);
atualizar: any;
showModal3: boolean = false;
showModal4: boolean = false;
  selectedItem: any;
  selectedItem2: any;
parc: any;
  showModal5: boolean = false;
  oc0 : number = 0;
  estaConciliado: boolean = false; 
pa = computed(() => Math.round(this.sr() * 100) / 100);

  constructor(){

    this.fs.conectar()
    this.gerarTab()
    this.pegarTotal()
    // Moved async call to ngOnInit

  }

  async ngOnInit() {
    // Replace the arguments below with actual collection, id, and field names as needed
    let ocz = await this.cs.getFieldValue('contas2025', 'cy7NxZuk3xYiLPfWRecN', 'saldo');
    let ocx = Math.abs(ocz);
    this.oc0 = Math.round(ocx * 100) / 100
    console.log("Saldo inicial de Outros Credores: ", this.oc0);
    console.log("Saldo atual de Outros Credores: ", this.pa());

    this.verificarConciliacao();
  }


  async pegarOC(){

    const colRef = collection(this.fs.db, 'outroscredores');
        const qs0 = query(
          colRef,

          where("ativo" , "==", true),
          orderBy('cod', 'asc')
        );
        const qs = await getDocs(qs0);
        let contasData: any[] = [];
        contasData = qs.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        return contasData; // Log the retrieved data
      }

      async gerarTab() {
      let data: any[] = [];
      data = await this.pegarOC();
      this.oc.set(data);

      console.log(this.oc());

    }
sortTable(arg0: string) {
throw new Error('Method not implemented.');
}
incluir() {
     console.log("cadastrando")
    this.showModal3 = true;

}

editarData(item){
        console.log("editando")
      this.selectedItem = item;
      this.showModal3 = true;




    }

    closeModal() {
      this.showModal3 = false;
      this.gerarTab()

  }

   saveData() {
    this.showModal3 = false;


  }

   totalizar(fonte) {
            const total = computed(() => fonte.reduce((a, b) => a + b.saldo, 0));
            return total();
          }

    async pegarTotal() {
      await this.gerarTab()
      this.sr.set(await this.totalizar(this.oc()));
      console.log(this.sr());
      
// this.pa assignment moved to property declaration above to avoid type mismatch

    }

     incrementar(item){

  console.log("adicionando")
  this.showModal5 = true;
  this.selectedItem = item;


  }

   verificarConciliacao(): void {
    // Sua lógica de igualdade vai aqui
   
    this.estaConciliado = (this.oc0 === this.pa());
  }


}
