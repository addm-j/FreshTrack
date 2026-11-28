import { inject } from '@angular/core';
import type { CanActivateFn} from '@angular/router';
import { Router } from '@angular/router';

import { firebaseAuth } from '../firebase.client';
import { FirebaseAuthService } from '../services/firebase-auth.service';

export const authGuard: CanActivateFn = async () => {
  const authService = inject(FirebaseAuthService);
  const router = inject(Router);

  await authService.waitForAuthInit();
  return firebaseAuth.currentUser ? true : router.createUrlTree(['/login']);
};

export const guestOnlyGuard: CanActivateFn = async () => {
  const authService = inject(FirebaseAuthService);
  const router = inject(Router);

  await authService.waitForAuthInit();
  return firebaseAuth.currentUser ? router.createUrlTree(['/tabs/tab1']) : true;
};