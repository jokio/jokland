import {
  HashLocationStrategy,
  LocationStrategy,
} from '@angular/common'
import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { ServiceWorkerModule } from '@angular/service-worker'
import { IonicModule } from '@ionic/angular'
import { environment } from '../environments/environment'
import { AppRoutingModule } from './app-routing.module'
import { AvatarBuilderComponent } from './components/avatar-builder/avatar-builder.component'
import { AppComponent } from './layouts/app/app.component'
import { AccountService } from './services/account.service'
import { AvatarService } from './services/avatar.service'

@NgModule({
  declarations: [AppComponent, AvatarBuilderComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    IonicModule.forRoot({ mode: 'ios' }),
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      // Register the ServiceWorker as soon as the app is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
  providers: [
    [
      Location,
      AccountService,
      AvatarService,
      { provide: LocationStrategy, useClass: HashLocationStrategy },
    ],
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
