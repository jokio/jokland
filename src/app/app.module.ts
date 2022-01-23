import {
  HashLocationStrategy,
  LocationStrategy,
} from '@angular/common'
import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { IonicModule } from '@ionic/angular'
import { AppRoutingModule } from './app-routing.module'
import { AppComponent } from './layouts/app/app.component'

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    IonicModule.forRoot({ mode: 'ios' }),
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
