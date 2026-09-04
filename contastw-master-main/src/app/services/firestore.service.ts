import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from './firebase';
import { collection, DocumentData, getFirestore, query, QuerySnapshot, limit, orderBy, startAfter, getDocs, limitToLast } from 'firebase/firestore';
import { from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  public db
  

  conectar() { 

    const app = initializeApp(firebaseConfig.firebase);
    this.db = getFirestore(app);
  }

 
 
}


