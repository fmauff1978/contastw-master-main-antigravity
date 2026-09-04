import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { FirestoreService } from './firestore.service';
import { Injectable, computed, inject, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Contas2Service {
  fs = inject(FirestoreService);
  previ80 = signal<number | null>(null);
  inv = signal<number | null>(null);
  aum = signal<number | null>(null);
  sdo = signal<any[]>([]);
  mod_despesa = ['compromissada', 'gerenciável', 'off'];
  md = signal<any[]>([]);

  // aum = computed(() => this.previ80() + this.inv());

  constructor() {
    this.fs.conectar();
  }

  
  async pegarContasNatureza(param, equal, param2, bool) {
    const colRef = collection(this.fs.db, 'contas2025');
    const q = query(
      colRef,
      where(param, equal, param2),
      where('em_uso', '==', bool),
      orderBy('enq', 'asc')
    );

    const qs = await getDocs(q);
    let contasData = qs.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return contasData; // Log the retrieved data
  }

  

  

  async pegarContasModDespesa(param1, param2, param3, bool) {
    const colRef = collection(this.fs.db, 'contas2025');
    const q = query(
      colRef,
      where(param1, param2, param3),
      where('em_uso', '==', bool),
      orderBy('conta', 'asc')
    );
    const qs = await getDocs(q);
    let contasData: any[] = [];
    contasData = qs.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return contasData;
  }

  async pegarDados(
    colecao,
    param1,
    equal,
    param2,
    param3,
    equal2,
    bool,
    param4,
    param5
  ) {
    const colRef = collection(this.fs.db, colecao);
    const qs0 = query(
      colRef,
      where(param1, equal, param2),
      where(param3, equal2, bool),
      orderBy(param4, param5)
    );
    const qs = await getDocs(qs0);
    let contasData: any[] = [];
    contasData = qs.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return contasData; // Log the retrieved data
  }

  totalizar(fonte) {
    const total = computed(() => fonte.reduce((a, b) => a + b.saldo, 0));
    return total();
  }

  totalizar2(fonte) {
    const total = computed(() => fonte.reduce((a, b) => a + b.gd2024, 0));
    return total();
  }

 

  async pegarMD() {
    for (let i = 0; i < this.mod_despesa.length; i++) {
      let fonte2 = signal<any[]>([]);

      fonte2.set(
        await this.pegarDados(
          'contas2025',
          'mod_despesa',
          '==',
          this.mod_despesa[i],
          'em_uso',
          '==',
          true,
          'saldo',
          'desc'
        )
      );

      let saldo = await this.totalizar(fonte2());

      this.md.set([
        ...this.md(),
        {
          mod_despesa: this.mod_despesa[i],
          saldo: saldo,
        },
      ]);
    }

    return this.md();
  }
  async pegarUpdate(bd) {
    const colRef = collection(this.fs.db, bd);
    const q = query(
      colRef,
      // where('ativa', '==', true),
      orderBy('timestamp', 'desc'),
      limit(1)
    );

    const qs = await getDocs(q);

    let items: any[] = [];

    items = qs.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    //console.log('Dados do Firestore:', items); // Adicione este log

    let update = items[0]?.valor;

    console.log(update);

    return update;
    // Log the retrieved data
  }

  async salvarHistoricoAtrasado(valor: number, bd: string) {
    try {
      const coll = collection(this.fs.db, bd); // Use o nome da sua coleção
      await addDoc(coll, {
        valor: valor,
        timestamp: new Date(), // Timestamp atual
      });
      console.log('Histórico de atrasado salvo no Firestore com sucesso!');
    } catch (error) {
      console.error(
        'Erro ao salvar histórico de atrasado no Firestore:',
        error
      );
    }
  }

   async pegarTodasContas(bool) {
    const colRef = collection(this.fs.db, 'contas2025');
    const q = query(
      colRef,
      
      where('em_uso', '==', bool),
      orderBy('conta', 'asc')
    );

    const qs = await getDocs(q);

    let contasData: any[] = [];
    contasData = qs.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return contasData; // Log the retrieved data
  }


   async getFieldValue(colecao, id, campo ): Promise<any | null> {
      try {
        const docRef = doc(this.fs.db, colecao, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          return data ? data[campo] : null; // Retorna o valor do campo ou null se data for undefined
        } else {
          console.log("No such document!");
          return null;
        }
      } catch (error) {
        console.error("Error getting document:", error);
        return null;
      }
    }

    async obterDados(param, equal, param2, bool, sig, sig2) {
      try {
        const fonte = await this.pegarContasNatureza(
          param,
          equal,
          param2,
          bool
        );
        sig.set(fonte);
        const saldo = await this.totalizar(sig());
        if (saldo < 0) {
          sig2.set(saldo * -1);
        } else {
          sig2.set(saldo);
        }
      } catch (error) {
        alert('erro na obtencao dos dados');
        console.error(error);
      }
    }

   
}
