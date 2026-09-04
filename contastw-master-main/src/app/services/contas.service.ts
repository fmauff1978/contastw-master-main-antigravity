import { Injectable, signal } from '@angular/core';
import { FirestoreService } from './firestore.service';
import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import {
  BehaviorSubject,
  forkJoin,
  from,
  map,
  Observable,
  Subject,
} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ContasService {
  items: any[] = [];
  fonte: any[] = [];
  cod2: number;
  contas: any[] = [];
  contasData: any[] = [];
  aum: number;
  private _items = signal<number>(0);
  contas0 = this._items.asReadonly();
  ano = new Date().getFullYear();

  private valueSubject = new BehaviorSubject<number>(0);
  value$ = this.valueSubject.asObservable();

  constructor(private fs: FirestoreService) {
    this.fs.conectar();
  }

  async pegarTodasContas(bool) {
    const colRef = collection(this.fs.db, 'contas2025');
    const q = query(
      colRef,

      where('em_uso', '==', bool),
      orderBy('conta', 'asc')
    );

    const qs = await getDocs(q);
    this.contasData = qs.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return this.contasData; // Log the retrieved data
  }

  pegarAtivo() {
    const colRef = collection(this.fs.db, 'contas2025');
    const q = query(
      colRef,
      where('natureza', '==', 'ativo'),
      where('em_uso', '==', true),
      orderBy('enq', 'asc')
    );
    return from(getDocs(q)).pipe(
      map((snapshot) => {
        return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      })
    );
  }

  pegarPassivo() {
    const colRef = collection(this.fs.db, 'contas2025');
    const q = query(
      colRef,
      where('natureza', '==', 'passivo'),
      where('em_uso', '==', true),
      orderBy('enq', 'asc')
    );
    return from(getDocs(q)).pipe(
      map((snapshot) => {
        return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      })
    );
  }

  pegarResultado() {
    const colRef = collection(this.fs.db, 'contas2025');
    const q = query(
      colRef,
      where('natureza', '==', 'resultado'),
      where('em_uso', '==', true),
      orderBy('enq', 'asc')
    );
    return from(getDocs(q)).pipe(
      map((snapshot) => {
        return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      })
    );
  }

  pegarDespesasReceitas() {
    const colRef = collection(this.fs.db, 'contas2025');
    const q = query(
      colRef,
      where('natureza', 'in', ['despesa', 'receita']),
      where('em_uso', '==', true)
    );
    return from(getDocs(q)).pipe(
      map((snapshot) => {
        return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      })
    );
  }

  pegarUltimoMesPrevi() {
    const colRef = collection(this.fs.db, 'previ');
    const q = query(colRef, orderBy('mes', 'desc'), limit(1));
    return from(getDocs(q)).pipe(
      map((snapshot) => {
        return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      })
    );
  }

  

  pegarDespesasLiquidas() {
    const colRef = collection(this.fs.db, 'contas2025');
    const q = query(
      colRef,
      where('mod_despesa', 'not-in', ['off', 'nihil']),
      where('em_uso', '==', true),
      orderBy('conta', 'asc')
    );
    return from(getDocs(q)).pipe(
      map((snapshot) => {
        return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      })
    );
  }

  pegarDespesasCompromissadas() {
    const colRef = collection(this.fs.db, 'contas2025');
    const q = query(
      colRef,
      where('mod_despesa', '==', 'compromissada'),
      where('em_uso', '==', true),
      orderBy('conta', 'asc')
    );
    return from(getDocs(q)).pipe(
      map((snapshot) => {
        return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      })
    );
  }

  pegarDespesasGerenciaveis() {
    const colRef = collection(this.fs.db, 'contas2025');
    const q = query(
      colRef,
      where('mod_despesa', '==', 'gerenciável'),
      where('em_uso', '==', true),
      orderBy('conta', 'asc')
    );
    return from(getDocs(q)).pipe(
      map((snapshot) => {
        return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      })
    );
  }

  pegarDespesasFO() {
    const colRef = collection(this.fs.db, 'contas2025');
    const q = query(colRef, where('cod', 'in', [32, 35, 37, 39, 40]));
    return from(getDocs(q)).pipe(
      map((snapshot) => {
        return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      })
    );
  }

  async pegarTodasDespesas() {
    const colRef = collection(this.fs.db, 'contas2025');
    const qs0 = query(
      colRef,
      where('natureza', '==', 'despesa'),
      where('em_uso', '==', true),
      orderBy('saldo', 'desc')
    );
    const qs = await getDocs(qs0);
    this.contas = qs.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return this.contas; // Log the retrieved data
  }

  
 

  async pegarContasParam(param1, param2, param3, param4, param5) {
    const colRef = collection(this.fs.db, 'contas2025');
    const q = query(
      colRef,
      where(param1, param2, param3),
      where('em_uso', '==', true),
      orderBy( param4, param5 )
    );

    const qs = await getDocs(q);
    this.contasData = qs.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return this.contasData; // Log the retrieved data
  }

  async atualizarValoresPorMes(
    documentId: string,
    mes: number,
    novoValor: number
  ): Promise<void> {
    const collectionRef = collection(this.fs.db, 'contas2025'); // Substitua 'sua_colecao' pelo nome da sua coleção
    const docRef = doc(collectionRef, documentId);

    const updateData = {};

    switch (mes) {
      case 0:
        updateData[`ano${this.ano}.jan`] = novoValor;
        break;
      case 1:
        updateData[`ano${this.ano}.fev`] = novoValor;
        break;
      case 2:
        updateData[`ano${this.ano}.mar`] = novoValor;
        break;
      case 3:
        updateData[`ano${this.ano}.abr`] = novoValor;
        break;
      case 4:
        updateData[`ano${this.ano}.mai`] = novoValor;
        break;
      case 5:
        updateData[`ano${this.ano}.jun`] = novoValor;
        break;
      case 6:
        updateData[`ano${this.ano}.jul`] = novoValor;
        break;
      case 7:
        updateData[`ano${this.ano}.ago`] = novoValor;
        break;
      case 8:
        updateData[`ano${this.ano}.set`] = novoValor;
        break;
      case 9:
        updateData[`ano${this.ano}.out`] = novoValor;
        break;
      case 10:
        updateData[`ano${this.ano}.nov`] = novoValor;
        break;
      case 11:
        updateData[`ano${this.ano}.dez`] = novoValor;
        break;
        case 12:
        updateData[`ano${this.ano}.total`] = novoValor;
        break;
      default:
        console.error('Mês inválido:', mes);
        return; // Encerra a função se o mês for inválido
    }

    try {
      await updateDoc(docRef, updateData);
      console.log(`Campo atualizado para o mês de ${mes} com sucesso!`);
    } catch (error) {
      console.error('Erro ao atualizar o documento:', error);
      throw new Error('Erro ao atualizar o documento');
    }
  }

  async pegarCod() {
    const colRef = collection(this.fs.db, 'contas2025');
    const q = query(
      colRef,
      // where('ativa', '==', true),
      orderBy('cod', 'desc'),
      limit(1)
    );

    const qs = await getDocs(q);

    const items = qs.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log('Dados do Firestore:', items); // Adicione este log

    return items;
    // Log the retrieved data
  }

  async pegarCod2() {
    return this.pegarCod().then((x) => {
      this.contasData = x;
      let cod2 = this.contasData[0].cod + 1;
      console.log(cod2); // Isso ainda será executado depois da consulta do Firestore
      return cod2; // Agora, retornamos cod2 para o .then da chamada inicial
    });
  }

  gravarConta(conta) {
    const coll = collection(this.fs.db, 'contas2025');
    addDoc(coll, conta)
      .then((docRef) => {
        console.log('Conta criada com o ID:', docRef.id);
      })
      .catch((error) => {
        console.error('Error adding document:', error);
      });
  }
}
