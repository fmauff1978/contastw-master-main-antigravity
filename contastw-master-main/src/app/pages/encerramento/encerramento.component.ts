import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Contas2Service } from '../../services/contas2.service';
import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { FirestoreService } from '../../services/firestore.service';
import { LctosService } from '../../services/lctos.service';
import { SpinnerComponent } from '../../shared/spinner/spinner.component';

@Component({
  selector: 'app-encerramento',
  imports: [CommonModule, SpinnerComponent],
  templateUrl: './encerramento.component.html',
  styleUrl: './encerramento.component.css',
})
export class EncerramentoComponent {
  cs = inject(Contas2Service);
  fs = inject(FirestoreService);
  ls = inject(LctosService);
  contas: any[] = [];
  contas1: any[] = [];
  contas2: any[] = [];
  contas3: any[] = [];
  contas4: any[] = [];
  isLoading = false;
  anoAtual = new Date().getFullYear();

  meses = {
    jan: null,
    fev: null,
    mar: null,
    abr: null,
    mai: null,
    jun: null,
    jul: null,
    ago: null,
    set: null,
    out: null,
    nov: null,
    dez: null,
    total: null,
  };

  anoProx = this.anoAtual + 1;

  constructor() {
    this.fs.conectar();
  }

  //gravação fechamento ano para as contas de ativo, passivo e resultado,
  //  gravacao de total do ano para contas de despesa e receita e sues respectivos
  //  valores de rateio diário (gd2025)
  async salvarResultados() {
    this.isLoading = true;
    await this.pegarAtivPass();
    await this.pegarDespRec();
    await this.pegarEnqFDA();
    this.isLoading = false;
  }

  async zerarContasDespRecRes() {
    this.isLoading = true;

    await this.contabilizacaoDespesas();
    await this.contabilizacaoReceitas();
    await this.contabilizacaoResultado();
    console.log('Contas de Despesa, Receita e Resultado zeradas com sucesso!');
    this.isLoading = false;
  }

  async pegarAtivPass() {
    this.contas = await this.cs.pegarDados(
      'contas2025',
      'em_uso',
      '==',
      true,
      'natureza',
      'in',
      ['ativo', 'passivo', 'resultado'],
      'cod',
      'asc',
    );

    console.log(this.contas);

    for (let i = 0; i < this.contas.length; i++) {
      let id = this.contas[i].id;
      let conta = this.contas[i].conta;
      let saldo0 = this.contas[i].saldo;
      let saldo = this.roundToTwoDecimals(saldo0);
      const docRef = doc(this.fs.db, 'contas2025', id);
      await updateDoc(docRef, {
        [`fechamento${this.anoAtual}`]: saldo,
        [`ano${this.anoProx}`]: this.meses,
        atualizacao: Timestamp.now(),
      });
    }
    console.log(
      'Contas de Ativo, Passivo e Resultado atualizadas com sucesso!',
    );

    let contas: any[] = [];
    contas = await this.cs.pegarContasNatureza('natureza', '==', 'ativo', true);

    let soma = contas.reduce(function (a, b) {
      return a + b.saldo;
    }, 0);

    const docRef2 = doc(this.fs.db, 'sh_agregados', 'AmWuqcCmRZ3ZzgH7kEbO');
    await updateDoc(docRef2, {
      [`fechamento${this.anoAtual}`]: soma,
      [`ano${this.anoProx}`]: this.meses,
      atualizacao: Timestamp.now(),
    });

    let contas2: any[] = [];
    contas2 = await this.cs.pegarContasNatureza(
      'natureza',
      '==',
      'passivo',
      true,
    );

    let soma2 = contas2.reduce(function (a, b) {
      return a + b.saldo;
    }, 0);

    const docRef9 = doc(this.fs.db, 'sh_agregados', '0AVwFNrr2L0iAhm5vkSp');
    await updateDoc(docRef9, {
      [`fechamento${this.anoAtual}`]: soma2,
      [`ano${this.anoProx}`]: this.meses,
      atualizacao: Timestamp.now(),
    });

    let contas3: any[] = [];
    contas3 = await this.cs.pegarContasNatureza(
      'natureza',
      '==',
      'despesa',
      true,
    );

    let soma3 = contas3.reduce(function (a, b) {
      return a + b.saldo;
    }, 0);

    const docRef91 = doc(this.fs.db, 'sh_agregados', 'vDi7ftEXgHavCzngGik5');
    await updateDoc(docRef91, {
      [`fechamento${this.anoAtual}`]: soma3,
      [`ano${this.anoProx}`]: this.meses,
      atualizacao: Timestamp.now(),
    });

    let contas4: any[] = [];
    contas4 = await this.cs.pegarContasNatureza(
      'natureza',
      '==',
      'receita',
      true,
    );

    let soma4 = contas4.reduce(function (a, b) {
      return a + b.saldo;
    }, 0);

    const docRef92 = doc(this.fs.db, 'sh_agregados', 'TQxibYZpx7k7CbSz7DGg');
    await updateDoc(docRef92, {
      [`fechamento${this.anoAtual}`]: soma4,
      [`ano${this.anoProx}`]: this.meses,
      atualizacao: Timestamp.now(),
    });

    let contas5: any[] = [];
    contas5 = await this.cs.pegarContasNatureza(
      'natureza',
      '==',
      'resultado',
      true,
    );

    let soma5 = contas5.reduce(function (a, b) {
      return a + b.saldo;
    }, 0);

    const docRef93 = doc(this.fs.db, 'sh_agregados', 'Zy0E3sWi0nIsYX3WHGTr');
    await updateDoc(docRef93, {
      [`fechamento${this.anoAtual}`]: soma5,
      [`ano${this.anoProx}`]: this.meses,
      atualizacao: Timestamp.now(),
    });
  }

  async pegarDespRec() {
    this.contas1 = await this.cs.pegarDados(
      'contas2025',
      'em_uso',
      '==',
      true,
      'natureza',
      'in',
      ['despesa', 'receita'],
      'cod',
      'asc',
    );

    console.log(this.contas1);

    for (let i = 0; i < this.contas1.length; i++) {
      let id = this.contas1[i].id;
      let conta = this.contas1[i].conta;
      let saldo0 = this.contas1[i].saldo;
      let saldo = this.roundToTwoDecimals(saldo0);
      let gd20250 = saldo0 / 365;
      let gd2025 = this.roundToTwoDecimals(gd20250);
      const docRef = doc(this.fs.db, 'contas2025', id);
      await updateDoc(docRef, {
        [`total${this.anoAtual}`]: saldo,
        [`gd${this.anoAtual}`]: gd2025,
        [`ano${this.anoProx}`]: this.meses,

        atualizado_em: Timestamp.now(),
      });
    }
    console.log('Contas de Despesa e Receita atualizadas com sucesso!');
  }

  roundToTwoDecimals(num: number): number {
    return Math.round((num + Number.EPSILON) * 100) / 100;
  }

  async contabilizacaoDespesas() {
    this.contas2 = await this.cs.pegarDados(
      'contas2025',
      'em_uso',
      '==',
      true,
      'natureza',
      '==',
      'despesa',
      'cod',
      'asc',
    );
    console.log(this.contas2);

    for (let i = 0; i < this.contas2.length; i++) {
      let id = this.contas2[i].id;
      let conta = this.contas2[i].conta;
      let cod = this.contas2[i].cod;
      let natureza = this.contas2[i].natureza;
      let enquadramento = this.contas2[i].enquadramento;
      let mod_despesa = this.contas2[i].mod_despesa;

      let saldo0 = this.contas2[i].saldo;
      let res1 = Math.abs(saldo0);
      let saldo = this.roundToTwoDecimals(res1);
      const data = new Date(`${this.anoAtual}-12-31T00:00:00`);

      const ts = Timestamp.fromDate(data);

      const lctogravar = {
        datalcto: ts,
        descricao: 'encerramento do exercicio anual',
        reg: `${Date.now()}`,
        contadebitada: {
          id: 'LaHlkroQyprQ8gfV22eZ',
          cod: 149,
          conta: 'Resultado Acumulado',
          natureza: 'resultado',
          enquadramento: 'resultado',
          mod_despesa: 'nihil',
        },

        contacreditada: {
          id: id,
          cod: cod,
          conta: conta,
          natureza: natureza,
          enquadramento: enquadramento,
          mod_despesa: mod_despesa,
        },

        valor: saldo,
        criado_em: Timestamp.now(),
      };

      this.ls.gravarLcto(lctogravar);
      await this.ls.debitar('LaHlkroQyprQ8gfV22eZ', saldo);
      await this.ls.creditar(id, saldo);
      if (i < this.contas2.length - 1) {
        await this.delay(1000);
      }
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async contabilizacaoReceitas() {
    this.contas3 = await this.cs.pegarDados(
      'contas2025',
      'em_uso',
      '==',
      true,
      'natureza',
      '==',
      'receita',
      'cod',
      'asc',
    );
    console.log(this.contas3);

    for (let i = 0; i < this.contas3.length; i++) {
      let id = this.contas3[i].id;
      let conta = this.contas3[i].conta;
      let cod = this.contas3[i].cod;
      let natureza = this.contas3[i].natureza;
      let enquadramento = this.contas3[i].enquadramento;
      let mod_despesa = this.contas3[i].mod_despesa;
      let saldo0 = this.contas3[i].saldo;
      let res1 = Math.abs(saldo0);
      let saldo = this.roundToTwoDecimals(res1);

      const data = new Date(`${this.anoAtual}-12-31T00:00:00`);

      const ts = Timestamp.fromDate(data);

      const lctogravar = {
        datalcto: ts,
        descricao: 'encerramento do exercicio anual',
        reg: `${Date.now()}`,
        contadebitada: {
          id: id,
          cod: cod,
          conta: conta,
          natureza: natureza,
          enquadramento: enquadramento,
          mod_despesa: mod_despesa,
        },
        contacreditada: {
          id: 'LaHlkroQyprQ8gfV22eZ',
          cod: 149,
          conta: 'Resultado Acumulado',
          natureza: 'resultado',
          enquadramento: 'resultado',
          mod_despesa: 'nihil',
        },

        valor: saldo,
        criado_em: Timestamp.now(),
      };

      this.ls.gravarLcto(lctogravar);

      await this.ls.debitar(id, saldo);
      this.ls.creditar('LaHlkroQyprQ8gfV22eZ', saldo);
      if (i < this.contas2.length - 1) {
        await this.delay(1000);
      }
    }
  }

  async contabilizacaoResultado() {
    this.contas4 = await this.cs.pegarDados(
      'contas2025',
      'em_uso',
      '==',
      true,
      'cod',
      'in',
      [191, 151, 148],
      'cod',
      'asc',
    );
    console.log(this.contas4);

    for (let i = 0; i < this.contas4.length; i++) {
      let id = this.contas4[i].id;
      let conta = this.contas4[i].conta;
      let cod = this.contas4[i].cod;
      let natureza = this.contas4[i].natureza;
      let enquadramento = this.contas4[i].enquadramento;
      let mod_despesa = this.contas4[i].mod_despesa;
      let saldo0 = this.contas4[i].saldo;
      let res1 = Math.abs(saldo0);
      let saldo = this.roundToTwoDecimals(res1);

      const data = new Date(`${this.anoAtual}-12-31T00:00:00`);
      const ts = Timestamp.fromDate(data);

      if (cod === 191) {
        const lctogravar0 = {
          datalcto: ts,
          descricao: 'encerramento do exercicio anual',
          reg: `${Date.now()}`,
          contadebitada: {
            id: id,
            cod: cod,
            conta: conta,
            natureza: natureza,
            enquadramento: enquadramento,
            mod_despesa: mod_despesa,
          },
          contacreditada: {
            id: 'LaHlkroQyprQ8gfV22eZ',
            cod: 149,
            conta: 'Resultado Acumulado',
            natureza: 'resultado',
            enquadramento: 'resultado',
            mod_despesa: 'nihil',
          },

          valor: saldo,
          criado_em: Timestamp.now(),
        };
        this.ls.gravarLcto(lctogravar0);

        this.ls.debitar(id, saldo);
        this.ls.creditar('LaHlkroQyprQ8gfV22eZ', saldo);
      } else {
        const lctogravar = {
          datalcto: ts,
          descricao: 'encerramento do exercicio anual',
          reg: `${Date.now()}`,
          contacreditada: {
            id: id,
            cod: cod,
            conta: conta,
            natureza: natureza,
            enquadramento: enquadramento,
            mod_despesa: mod_despesa,
          },
          contadebitada: {
            id: 'LaHlkroQyprQ8gfV22eZ',
            cod: 149,
            conta: 'Resultado Acumulado',
            natureza: 'resultado',
            enquadramento: 'resultado',
            mod_despesa: 'nihil',
          },

          valor: saldo,
          criado_em: Timestamp.now(),
        };

        this.ls.gravarLcto(lctogravar);

        this.ls.debitar('LaHlkroQyprQ8gfV22eZ', saldo);
        this.ls.creditar(id, saldo);
      }
    }
  }
  async pegarEnqFDA() {
    let contas0: any[] = [];
    // let anoAtual = 2025;
    let enq = [
      { id: 1, enquadramento: 'circulante' },
      { id: 2, enquadramento: 'realizável' },
      { id: 3, enquadramento: 'investimento' },
      { id: 4, enquadramento: 'imobilizado' },
      { id: 5, enquadramento: 'rotativo' },
      { id: 6, enquadramento: 'cdc' },
      { id: 6.3, enquadramento: 'pal' },
      { id: 6.5, enquadramento: 'reneg' },
      { id: 7, enquadramento: 'financiamento' },
      { id: 7.11, enquadramento: 'alimentação fora de casa' },
      { id: 7.12, enquadramento: 'educação' },
      { id: 7.13, enquadramento: 'familiares' },
      { id: 7.14, enquadramento: 'financeiras' },
      { id: 7.15, enquadramento: 'fopag' },
      { id: 7.16, enquadramento: 'imobiliárias' },
      { id: 7.17, enquadramento: 'lazer' },
      { id: 7.18, enquadramento: 'mobilidade' },
      { id: 7.19, enquadramento: 'ordinárias' },
      { id: 7.2, enquadramento: 'streaming' },
      { id: 8, enquadramento: 'receitas' },
      { id: 9, enquadramento: 'resultado' },
    ];

    for (let i = 0; i < enq.length; i++) {
      contas0 = await this.cs.pegarDados(
        'contas2025',
        'em_uso',
        '==',
        true,
        'enquadramento',
        '==',
        enq[i].enquadramento,
        'cod',
        'asc',
      );

      console.log(contas0);

      let soma = contas0.reduce(function (a, b) {
        return a + b.saldo;
      }, 0);

      console.log(enq[i].enquadramento, soma);

      const colRef = collection(this.fs.db, 'sh_agregados');
      const q = query(colRef, where('agregado', '==', enq[i].enquadramento));
      const qs = await getDocs(q);

      let agregData: any[] = [];
      agregData = qs.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log(agregData);
      let id = agregData[0].id;
      const docRef = doc(this.fs.db, 'sh_agregados', id);
      await updateDoc(docRef, {
        [`fechamento${this.anoAtual}`]: soma,
        [`ano${this.anoProx}`]: this.meses,
        atualizacao: Timestamp.now(),
      });
    }

    console.log('terminado');
  }
}
