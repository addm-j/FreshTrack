import { ChangeDetectorRef, Component, NgZone, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  IonContent,
  IonCard,
  IonCardContent,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonInput,
  IonButton,
  IonIcon,
  IonText,
  IonSpinner,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  leafOutline,
  eyeOutline,
  eyeOffOutline,
  personOutline,
  arrowForwardOutline,
  alertCircleOutline,
} from 'ionicons/icons';

import { FirebaseAuthService } from '../../services/firebase-auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    IonContent,
    IonCard,
    IonCardContent,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonInput,
    IonButton,
    IonIcon,
    IonText,
    IonSpinner,
  ],
})
export class LoginPage {
  private router = inject(Router);
  private authService = inject(FirebaseAuthService);
  private ngZone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);

  authMode: 'login' | 'register' = 'login';
  email = '';
  password = '';
  householdCode = '';

  showPassword = false;
  isLoading = false;
  errorMessage = '';

  constructor() {
    addIcons({
      leafOutline,
      eyeOutline,
      eyeOffOutline,
      personOutline,
      arrowForwardOutline,
      alertCircleOutline,
    });
  }

  onModeChange(): void {
    this.errorMessage = '';
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  async onSubmit(): Promise<void> {
    const trimmedEmail = this.email.trim();

    if (!trimmedEmail || !this.password) {
      this.errorMessage = 'Vyplňte prosím e-mail i heslo.';
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      this.errorMessage = 'Zadejte platnou e-mailovou adresu.';
      return;
    }

    if (this.password.length < 6) {
      this.errorMessage = 'Heslo musí mít alespoň 6 znaků.';
      return;
    }

    this.errorMessage = '';
    this.isLoading = true;
    this.cdr.detectChanges();

    try {
      if (this.authMode === 'login') {
        await this.authService.login(trimmedEmail, this.password);
      } else {
        await this.authService.register(trimmedEmail, this.password);
      }
      await this.ngZone.run(() =>
        this.router.navigateByUrl('/tabs/tab1', { replaceUrl: true })
      );
    } catch (error) {
      this.ngZone.run(() => {
        this.errorMessage = this.authService.mapAuthError(error);
        this.isLoading = false;
        this.cdr.detectChanges();
      });
    } finally {
      this.ngZone.run(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      });
    }
  }

  async continueAsGuest(): Promise<void> {
    this.errorMessage = '';
    this.isLoading = true;
    this.cdr.detectChanges();

    try {
      await this.authService.loginAsGuest();
      await this.ngZone.run(() =>
        this.router.navigateByUrl('/tabs/tab1', { replaceUrl: true })
      );
    } catch (error) {
      this.ngZone.run(() => {
        this.errorMessage = this.authService.mapAuthError(error);
        this.isLoading = false;
        this.cdr.detectChanges();
      });
    } finally {
      this.ngZone.run(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      });
    }
  }
}