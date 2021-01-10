import { DoBootstrap, Injector, NgModule } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { BrowserModule } from '@angular/platform-browser';

import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
  ],
  providers: [],
  bootstrap: environment.production ? [] : [AppComponent]
})
export class AppModule implements DoBootstrap {
  public constructor(private readonly injector: Injector) { }

  public ngDoBootstrap(): void {
    const el = createCustomElement(AppComponent, { injector: this.injector });
    customElements.define('example-two', el);
  }
}
