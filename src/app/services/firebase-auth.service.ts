import { Injectable, signal } from '@angular/core';
import type {
  User} from 'firebase/auth';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInAnonymously,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';

import { firebaseAuth } from '../firebase.client';

@Injectable({
  providedIn: 'root',
})
export class FirebaseAuthService {
  readonly currentUser = signal<User | null>(null);
  private authInitialized: Promise<User | null>;

  constructor() {
    this.authInitialized = new Promise((resolve) => {
      let isFirstEmission = true;
      onAuthStateChanged(firebaseAuth, (user) => {
        this.currentUser.set(user);
        if (isFirstEmission) {
          isFirstEmission = false;
          resolve(user);
        }
      });
    });
  }

  waitForAuthInit(): Promise<User | null> {
    return this.authInitialized;
  }

  private withTimeout<T>(promise: Promise<T>, timeoutMs = 10000): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        reject({ code: 'auth/timeout' });
      }, timeoutMs);

      promise
        .then((result) => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch((err) => {
          clearTimeout(timer);
          reject(err);
        });
    });
  }

  async login(email: string, password: string): Promise<User> {
    const credential = await this.withTimeout(
      signInWithEmailAndPassword(firebaseAuth, email.trim(), password)
    );
    return credential.user;
  }

  async register(email: string, password: string): Promise<User> {
    const credential = await this.withTimeout(
      createUserWithEmailAndPassword(firebaseAuth, email.trim(), password)
    );
    return credential.user;
  }

  async loginAsGuest(): Promise<User> {
    const credential = await this.withTimeout(signInAnonymously(firebaseAuth));
    return credential.user;
  }

  async logout(): Promise<void> {
    await signOut(firebaseAuth);
  }

  mapAuthError(error: unknown): string {
    console.error('Firebase auth chyba:', error);
    const code = (error as { code?: string })?.code ?? '';
    switch (code) {
      case 'auth/invalid-credential':
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        return 'Nesprávný e-mail nebo heslo.';
      case 'auth/too-many-requests':
        return 'Příliš mnoho neúspěšných pokusů. Zkuste to prosím za chvíli.';
      case 'auth/timeout':
        return 'Přihlášení trvalo příliš dlouho (10 s). Zkontrolujte připojení k internetu.';
      case 'auth/email-already-in-use':
        return 'Účet s tímto e-mailem již existuje.';
      case 'auth/weak-password':
        return 'Heslo je příliš slabé (zadejte alespoň 6 znaků).';
      case 'auth/invalid-email':
        return 'Neplatný formát e-mailové adresy.';
      case 'auth/network-request-failed':
        return 'Chyba připojení k internetu. Zkontrolujte síť.';
      case 'auth/operation-not-allowed':
      case 'auth/admin-restricted-operation':
        return 'Tento způsob přihlášení není ve Firebase Console povolen.';
      default:
        return 'Přihlášení se nezdařilo. Zkuste to prosím znovu.';
    }
  }
}