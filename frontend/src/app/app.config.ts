import { ApplicationConfig } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router'; // Añadimos withInMemoryScrolling
import { routes } from './app.routes'; 
import { provideHttpClient } from '@angular/common/http';



export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes, 
      // Esta es la configuración para que el scroll siempre suba al cambiar de página
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled' })
    ), 
    provideHttpClient()
  ]
};