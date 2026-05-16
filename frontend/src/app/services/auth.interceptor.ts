import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Recupero il token salvato nel LocalStorage al momento del login
  const token = localStorage.getItem('token');

 
  if (token) {
    // se il token è presente devo creare un clone della richiesta, 
    // perchè in Angular e immutabile, e a questa aggiungo iltoken
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    return next(clonedRequest);
  }

  // Se non c'è il token manda avanti la richiesta normale
  return next(req);
};