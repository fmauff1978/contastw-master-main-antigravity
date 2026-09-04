import { Injectable } from '@angular/core';
import { FirestoreService } from './firestore.service';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  increment,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import {
  forkJoin,
  from,
  map,
  of,
  Observable,
  BehaviorSubject,
  lastValueFrom,
  switchMap,
} from 'rxjs';
import { TimestampService } from './timestamp.service';

@Injectable({
  providedIn: 'root',
})
export class LctosService {
  fonte: any = {};
  fonte1: any = {};
  fonte0: any = {};
  fonte2: any = ([] = []);
  fonte3: any = ([] = []);
  fopag: any[] = [];
  valordeb: number;
  valorcred: number;
  montante: number;

  private valueSubject = new BehaviorSubject<any[]>([]);
  value$ = this.valueSubject.asObservable();
  private valueSubject2 = new BehaviorSubject<any[]>([]);
  value2$ = this.valueSubject2.asObservable();
  private valueSubject3 = new BehaviorSubject<number>(0);
  value3$ = this.valueSubject3.asObservable();
  valor1: any;
  arrayDFO: any[] = [];
  saldo: number;

  constructor(private fs: FirestoreService, private ts: TimestampService) {
    this.fs.conectar();
  }

  gravarLcto(lcto) {
    const colRef = collection(this.fs.db, 'lancamentos2025');
    addDoc(colRef, lcto).then((docRef) => {
      console.log('Lançamento criado com o ID:', docRef.id);
    });
  }

  async debitar(id, valor) {
    const docRef = doc(this.fs.db, 'contas2025', id);
    await updateDoc(docRef, { saldo: increment(valor) });
    await updateDoc(docRef, { atualizado_em: Timestamp.now() });
    console.log('debitando:' + id, valor);
  }

  async creditar(id, valor) {
    const docRef = doc(this.fs.db, 'contas2025', id);
    await updateDoc(docRef, { saldo: increment(-1 * valor) });
    await updateDoc(docRef, { atualizado_em: Timestamp.now() });
    console.log('creditando:' + id, valor);
  }

  async pegarContasDeb(conta) {
    const colRef = collection(this.fs.db, 'lancamentos2025');
    const q = query(
      colRef,
      where('contadebitada.conta', '==', conta),
      orderBy('datalcto', 'desc')
    );

    const qs = await getDocs(q);

    let dados = qs.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return dados; // Log the retrieved data
  }

  async pegarContasCred(conta) {
    const colRef = collection(this.fs.db, 'lancamentos2025');
    const q = query(
      colRef,
      where('contacreditada.conta', '==', conta),
      orderBy('datalcto', 'desc')
    );

    const qs = await getDocs(q);

    let dados0 = qs.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return dados0; // Log the retrieved data
  }

  async juntarContasDebCred(conta) {
    await this.pegarContasDeb(conta).then(async (data) => {
      this.fonte = data;
      console.log(this.fonte);

      await this.pegarContasCred(conta).then((data) => {
        this.fonte0 = data;
        console.log(this.fonte0);

        const merge = this.fonte.concat(this.fonte0);

        console.log(merge);

        this.valueSubject.next(merge);
      });
    });
  }

  async pegarLctos() {
    const colRef = collection(this.fs.db, 'lancamentos2025');
    const q = query(
      colRef,
      // where('datalcto', '==', data),
      orderBy('datalcto', 'desc')
    );

    const qs = await getDocs(q);

    let dados0 = qs.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return dados0; // Log the retrieved data
  }

  async pegarLctosporReg(reg) {
    const colRef = collection(this.fs.db, 'lancamentos2025');
    const q = query(colRef, where('reg', '==', reg));

    const qs = await getDocs(q);

    let dados0 = qs.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return dados0; // Log the retrieved data
  }

  async estornar0(id: string, valor: number) {
    console.log(id, valor);

    const docRef = doc(this.fs.db, 'contas2025', id);
    await updateDoc(docRef, {
      saldo: increment(-1 * valor),
      atualizado_em: Timestamp.now(),
    });
    console.log('estornando:' + id, valor);
  }

  async estornar1(id: string, valor: number) {
    const docRef = doc(this.fs.db, 'contas2025', id);
    await updateDoc(docRef, {
      saldo: increment(valor),
      atualizado_em: Timestamp.now(),
    });
    console.log('estornando:' + id, valor);
  }

  async excluirData(id) {
    const coll = doc(this.fs.db, 'lancamentos2025', id);
    deleteDoc(coll)
      .then(() => {
        console.log('Documento apagado com sucesso!');
      })
      .catch((error) => {
        console.error('Erro ao apagar documento:', error);
      });
  }

  async pegarLctosporDatas(inicio, fim) {
    const colRef = collection(this.fs.db, 'lancamentos2025');
    const q = query(
      colRef,
      where('datalcto', '>=', inicio),
      ((this.fs.db, 'lancamentos2025'), where('datalcto', '<=', fim)),
      orderBy('datalcto', 'desc')
    );

    const qs = await getDocs(q);

    let dados0 = qs.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return dados0; // Log the retrieved data
  }

  async pegarLctoporContasDataDeb(conta, inicio, fim) {
    const colRef = collection(this.fs.db, 'lancamentos2025');
    const q = query(
      colRef,
      where('contadebitada.conta', '==', conta),
      where('datalcto', '>=', inicio),
      where('datalcto', '<=', fim)
    );
    const qs = await getDocs(q);
    this.fonte = qs.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return this.fonte; // Log the retrieved data
  }

  async pegarLctosporContasDataCred(conta, inicio, fim) {
    const colRef = collection(this.fs.db, 'lancamentos2025');
    const q = query(
      colRef,
      where('contacreditada.conta', '==', conta),
      where('datalcto', '>=', inicio),
      where('datalcto', '<=', fim)
    );
    const qs = await getDocs(q);
    this.fonte = qs.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return this.fonte; // Log the retrieved data
  }

  pegarLctosContaDataGlobal(conta, inicio, fim) {
    this.pegarLctoporContasDataDeb(conta, inicio, fim).then((data) => {
      this.fonte2 = data;
      console.log(this.fonte2);

      this.pegarLctosporContasDataCred(conta, inicio, fim).then((data) => {
        this.fonte3 = data;
        console.log(this.fonte3);

        const merge = this.fonte2.concat(this.fonte3);

        console.log(merge);

        this.valueSubject2.next(merge);
      });
    });
  }

  async pegarFOPAG() {
    const colRef = collection(this.fs.db, 'contas2025');
    const qs0 = query(
      colRef,
      where('cod', 'in', [9, 7, 125, 124, 12, 41, 47, 48, 49, 43, 44,45, 210]),
      orderBy('cod', 'asc')
    );
    const qs = await getDocs(qs0);
    this.fopag = qs.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return this.fopag; // Log the retrieved data
  }

  async totalizarporNatureza(fonte, nat, inicio, fim) {
    const inic = this.ts.converterDataForm(inicio);
    const fim0 = this.ts.converterDataForm(fim);
    console.log(inic, fim0);

    const colRef = collection(this.fs.db, 'lancamentos2025');
    const q = query(
      colRef,
      where(fonte, '==', nat),
      where('datalcto', '>=', inic),
      where('datalcto', '<=', fim0)
    );
    const qs = await getDocs(q);
    this.fonte = qs.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return this.fonte; // Log the retrieved data
  }

  async saldoporNatureza(fontedeb, fontecred, nat, inicio, fim) {
    this.totalizarporNatureza(fontedeb, nat, inicio, fim).then((x) => {
      this.fonte = x;
      this.valordeb = this.fonte.reduce(function (a, b) {
        return a + b.valor;
      }, 0);

      this.totalizarporNatureza(fontecred, nat, inicio, fim).then((x) => {
        this.fonte1 = x;
        this.valorcred = this.fonte1.reduce(function (a, b) {
          return a + b.valor;
        }, 0);

        let montante = this.valordeb - this.valorcred;

        console.log(this.valordeb, this.valorcred, montante);

        this.valueSubject3.next(montante);
      });
    });
  }

  async saldoDFO(inicio, fim) {
    const inic = this.ts.converterDataForm(inicio);
    const fim0 = this.ts.converterDataForm(fim);

    const dfo = [
      'Juros Rotativo',
      'IOF',
      'JurosCartão',
      'Tarifas Bancárias/Anuidades',
      'TarifasWallet',
    ];

    this.arrayDFO = [];

    for (let i = 0; i < dfo.length; i++) {
      let nat = dfo[i];
      // console.log(nat)
      let saldo = await this.gerarFecMes(nat, inic, fim0);
      //console.log(saldo)

      this.arrayDFO.push({ natureza: nat, saldo: saldo });
    }

    //console.log(this.arrayDFO)

    this.montante = this.arrayDFO.reduce(function (a, b) {
      return a + b.saldo;
    }, 0);

    return this.montante;
  }

  async gerarFecMes(conta, inicio, fim) {
    const x = inicio;
    const y = fim;

    let z = conta;

    // Aguardar as promessas antes de prosseguir
    const debitosData = await this.pegarLctoporContasDataDeb(z, x, y);
    const creditosData = await this.pegarLctosporContasDataCred(z, x, y);

    // Calcular os valores totais
    const valordeb = debitosData.reduce((a, b) => a + b.valor, 0);
    const valorcred = creditosData.reduce((a, b) => a + b.valor, 0);

    const fecmes = valordeb - valorcred;

    // Retornar o valor calculado
    return fecmes;
  }

  async getLctoDespesas() {
    const colRef = collection(this.fs.db, 'lancamentos2025');

    const qs0 = query(
      colRef,
      where('contadebitada.mod_despesa', 'in', [
        'compromissada',
        'gerenciável',
      ]),
      where('datalcto','>=', new Date (2024,0,1)),
      orderBy('datalcto', 'desc')
    );

    const qs = await getDocs(qs0);
    this.fonte = qs.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return this.fonte; // Log the retrieved data
  }

  async pegarLctoporModDespesa( inicio, fim) {
    const colRef = collection(this.fs.db, 'lancamentos2025');
    const q = query(
      colRef,
      where('contadebitada.mod_despesa', 'in', ['compromissada','gerenciável']),
      where('datalcto', '>=', inicio),
      where('datalcto', '<=', fim)
    );
    const qs = await getDocs(q);
    this.fonte = qs.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),

      
    }));


    this.valordeb = this.fonte.reduce(function (a, b) {
      return a + b.valor;
    }, 0);

    return this.valordeb
   
  }





}
