import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonTitle,
  IonContent,
  IonCard,
  IonCardContent,
  IonIcon,
  IonButton,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  documentTextOutline,
  shieldCheckmarkOutline,
  timeOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-terms',
  templateUrl: './terms.page.html',
  styleUrls: ['./terms.page.scss'],
  standalone: true,
  imports: [
    RouterLink,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonTitle,
    IonContent,
    IonCard,
    IonCardContent,
    IonIcon,
    IonButton,
  ],
})
export class TermsPage {
  constructor() {
    addIcons({ documentTextOutline, shieldCheckmarkOutline, timeOutline });
  }
}