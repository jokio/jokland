import {
  HashLocationStrategy,
  LocationStrategy,
} from '@angular/common'
import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { IonicModule } from '@ionic/angular'
import { AppRoutingModule } from './app-routing.module'
import { AppComponent } from './layouts/app/app.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment'

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    IonicModule.forRoot({ mode: 'ios' }),
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      // Register the ServiceWorker as soon as the app is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    }),
  ],
  providers: [
    [
      Location,
      { provide: LocationStrategy, useClass: HashLocationStrategy },
    ],
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
