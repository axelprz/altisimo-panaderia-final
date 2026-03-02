import { ApplicationConfig, LOCALE_ID } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { routes } from './app.routes'; 
import { provideHttpClient } from '@angular/common/http';

// Importaciones para el idioma español
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';

// Registramos los datos de español
registerLocaleData(localeEs);

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes, 
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled' })
    ), 
    provideHttpClient(),
    // Establecemos el idioma español para toda la aplicación
    { provide: LOCALE_ID, useValue: 'es' }
  ]
};