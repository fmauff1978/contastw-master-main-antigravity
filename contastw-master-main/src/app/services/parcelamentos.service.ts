import { computed, Injectable, Signal } from '@angular/core';
import { FirestoreService } from './firestore.service';
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
import { TimestampService } from './timestamp.service';

@Injectable({
  providedIn: 'root',
})
export class ParcelamentosService {
  parc: any[] = [];

  constructor(private fs: FirestoreService, private ts: TimestampService) {
    this.fs.conectar();
  }

  async pegarParc() {
    const colRef = collection(this.fs.db, 'parcelamentos');
    const q = query(
      colRef,
      where('ativa', '==', true),
      orderBy('datadacompra', 'desc')
    );

    const qs = await getDocs(q);
    this.parc = qs.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return this.parc; // Log the retrieved data
  }

  async pegarCartao() {
    const colRef = collection(this.fs.db, 'contas2025');
    const q = query(
      colRef,
      where('enquadramento', 'in', ['rotativo','pal']),
      where('em_uso', '==', true),
      orderBy('conta', 'asc')
    );

    const qs = await getDocs(q);
    this.parc = qs.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return this.parc; // Log the retrieved data
  }

  async saveParc(lcto) {
    const coll = collection(this.fs.db, 'parcelamentos');
    addDoc(coll, lcto)
      .then((docRef) => {
        console.log('Parcelamento criado com o ID:', docRef.id);
      })
      .catch((error) => {
        console.error('Error adding document:', error);
      });
  }

  async desativarParcela(id) {
    const docRef = doc(this.fs.db, 'faturas', id);
    await updateDoc(docRef, { ativa: false });

    console.log('desativando:' + id);
  }

  async desativarParcelamento(id) {
    const docRef = doc(this.fs.db, 'parcelamentos', id);
    await updateDoc(docRef, { ativa: false });

    console.log('desativando:' + id);
  }

  async atualizarparc(): Promise<any[]> {
    const data = await this.pegarParc();
    this.parc = data;

    console.log(this.parc);

    for (let i = 0; i < this.parc.length; i++) {
      const up = this.parc[i].ultimaparcela;
      const id = this.parc[i].id;
      const ultparc = up.toMillis();
      const hoje = Timestamp.now().toMillis();
      const dif9 = ultparc - hoje;
      // console.log(dif9, hoje);

      if (dif9 < 0) {
        const docRef = doc(this.fs.db, 'parcelamentos', id);
        await updateDoc(docRef, {
          saldorestante: 0,
          parcelasrestantes: 0,
          ativa: false,
          atualizado_em: Timestamp.now(),
        });
      } else {
        const dif10 = this.ts.millisecondsToMonths(dif9) + 1;

        console.log(hoje, dif9, dif10);

        const docRef = doc(this.fs.db, 'parcelamentos', id);
        await updateDoc(docRef, {
          saldorestante: dif10 * this.parc[i].valorparcela,
          parcelasrestantes: dif10,
          atualizado_em: Timestamp.now(),
        });

        console.log(id, this.parc[i].cod, 'atualizado com sucesso');
      }
    }

    // Retorna os dados atualizados para o componente
    return await this.pegarParc();
  }

  totalizar(fonte) {
    const total = computed(() =>
      fonte.reduce((a, b) => a + b.saldorestante, 0)
    );
    return total();
  }
}
