# Meme Museum - Progetto Tecnologie Web

Progetto realizzato per l'esame di Tecnologie Web (Università degli Studi di Napoli Federico II).
Traccia: **4.B WEBTECH'S MEMEMUSEUM**

## Tecnologie principali Utilizzate
* **Frontend:** Angular 17+ (Standalone Components), Bootstrap 5, SCSS
* **Backend:** Node.js, Express.js, Sequelize (ORM)
* **Testing:** Cypress (E2E)

---
 
## Istruzioni per l'Avvio

Per testare correttamente l'applicazione, è necessario avviare in parallelo sia il server backend che il client frontend. Assicurati di avere **Node.js** e **Angular CLI** installati sul tuo sistema.

### 1. Avvio del Backend 
Apri un terminale e posizionati nella cartella del backend:
`cd backend` 

Installa le dipendenze:
`npm install`

Avvia il server:
`npm start`

*(Il server partirà di default sulla porta 3001: http://localhost:3001)*

### 2. Avvio del Frontend 
Apri un **nuovo** terminale e posizionati nella cartella del frontend:
`cd frontend`

Installa le dipendenze:
`npm install`

Avvia l'applicazione Angular:
`ng serve`

*(L'applicazione sarà accessibile dal browser all'indirizzo: http://localhost:4200)*

---

## Testing End-to-End (Cypress)
Il progetto include una suite completa di 10 test E2E come richiesto dalle specifiche. 
**Importante:** I test devono essere eseguiti con *entrambi* i server (Backend e Frontend) accesi e in esecuzione.

Per avviare i test, posizionati nella cartella del frontend e lancia:
`npx cypress open`

Seleziona "E2E Testing", scegli il browser desiderato e avvia la suite `meme-museum.cy.ts`.

---

## 👤 Dati di Accesso Pre-caricati
Per testare immediatamente le funzionalità riservate agli utenti registrati (creazione meme, like/dislike, commenti, gestione profilo), puoi utilizzare il seguente account di test pre-configurato nel database:
* **Email:** ele@gmail.com
* **Password:** 1234