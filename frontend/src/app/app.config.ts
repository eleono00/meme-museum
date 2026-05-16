import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient , withInterceptors} from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr'; 
import { authInterceptor } from './services/auth.interceptor';

//richiamato dal main.ts

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    // Configuro il client HTTP e gli aggancio l'interceptor.
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimations(),
   
    provideToastr({
      positionClass: 'toast-top-right', 
      preventDuplicates: true,       
      timeOut: 3000               
    })

  ]
};
