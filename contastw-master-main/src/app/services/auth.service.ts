import { Injectable } from '@angular/core';
import { FirebaseApp, initializeApp } from 'firebase/app';
import { firebaseConfig } from './firebase';
import { BehaviorSubject, map, Observable, take } from 'rxjs';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  GoogleAuthProvider,
  signInWithPopup,
  Auth,
  getAuth
} from 'firebase/auth';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private app: FirebaseApp;
  private auth: Auth;
  private userSubject = new BehaviorSubject<User | null>(null);
  public user$ = this.userSubject.asObservable();
  public isAuthenticated$ = this.user$.pipe(map(user => !!user));

  constructor(private router: Router) {
    this.app = initializeApp(firebaseConfig.firebase);
    this.auth = getAuth(this.app);

    // Recupera o estado de autenticação inicial
    const user = this.auth.currentUser;
    if (user) {
      this.userSubject.next(user);
    }

    // Monitora mudanças no estado de autenticação
    onAuthStateChanged(this.auth, (user) => {
      console.log('onAuthStateChanged foi chamado com o usuário:', user);
      this.userSubject.next(user);
      if (user && window.location.pathname === '/login') {
        this.router.navigate(['/bp']);
      }
    });
  }

  async loginWithGoogle(): Promise<void> {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(this.auth, provider);
      this.router.navigate(['/bp']);
    } catch (error) {
      console.error("Erro ao fazer login com Google:", error);
      throw error;
    }
  }

  async loginWithEmailAndPassword(email: string, password: string): Promise<void> {
    try {
      await signInWithEmailAndPassword(this.auth, email, password);
      this.router.navigate(['/bp']);
    } catch (error) {
      console.error("Erro ao fazer login com email e senha:", error);
      throw error;
    }
  }

  async registerWithEmailAndPassword(email: string, password: string): Promise<void> {
    try {
      await createUserWithEmailAndPassword(this.auth, email, password);
      this.router.navigate(['/bp']);
    } catch (error) {
      console.error("Erro ao registrar usuário:", error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
      this.router.navigate(['/login']);
      this.userSubject.next(null);
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      throw error;
    }
  }

  getCurrentUser(): Observable<User | null> {
    return this.user$;
  }

  isUserLoggedIn(): Observable<User | null> {
    return this.user$.pipe(
      take(1),
      map(user => {
        console.log('isUserLoggedIn emitindo o usuário:', user);
        return user;
      })
    );
  }
}

