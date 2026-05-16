describe('Meme Museum - Test E2E', () => {
  
  // Dati di un utente fisicamente presente nel database 
  const testEmail = 'ele@gmail.com'; 
  const testPassword = '1234';  
   
  // Genero un titolo unico basato sul timestamp per evitare collisioni nei test (E2E best practice)
  const uniqueMemeTitle = 'Capolavoro Cypress ' + Date.now();

  // Funzione di supporto (Helper) per evitare di riscrivere il processo di login in ogni test
  const login = () => {
    cy.visit('/login');
    cy.get('input[type="email"]').type(testEmail);
    cy.get('input[type="password"]').type(testPassword);
    cy.contains('Entra nel Museo').click();
    cy.url().should('eq', Cypress.config().baseUrl + '/');
  };

  //  SCENARIO 1: AUTENTICAZIONE FALLITA 
  // Verifica che il frontend prevenga l'accesso e non faccia redirect se il server rifiuta i dati
  it('1. Dovrebbe restare sulla pagina di login se le credenziali sono errate', () => {
    cy.visit('/login');
    cy.get('input[type="email"]').type('fake@email.com');
    cy.get('input[type="password"]').type('sbagliata');
    cy.contains('Entra nel Museo').click();
    cy.url().should('include', '/login'); 
  });

  //  SCENARIO 2: FILTRI (UTENTE ANONIMO) 
  // Requisito Traccia: Anche gli utenti non loggati devono poter cercare e ordinare i meme
  it('2. Dovrebbe usare i filtri e lordinamento nella Home', () => {
    cy.visit('/');
    cy.get('select').select('Meno recenti'); 
    cy.get('input[placeholder="Cerca tag..."]').type('test');
    cy.contains('Rimuovi filtro: test').should('be.visible');
  });

  //  SCENARIO 3: CREAZIONE E UPLOAD FILE (MULTIPART) 
  // Requisito Traccia: Gli utenti autenticati possono caricare nuovi meme allegando un'immagine
  it('3. Dovrebbe permettere a un utente loggato di pubblicare un Meme', () => {
    login();
    cy.contains('Aggiungi Opera').click();
    cy.get('input[placeholder="Es: La Gioconda moderna..."]').type(uniqueMemeTitle);
    cy.get('input[placeholder="Scrivi un tag e premi Spazio..."]').type('e2e{enter}');

    // Simulazione del caricamento di un file fisico
    cy.get('input[type="file"]').selectFile({
      contents: Cypress.Buffer.from('Finto contenuto immagine'),
      fileName: 'test-cypress.png',
      mimeType: 'image/png'
    });

    cy.contains('Pubblica').click();
    cy.contains(uniqueMemeTitle, { timeout: 10000 }).should('be.visible');
  });

  //  SCENARI 4 E 5: SISTEMA DI VOTAZIONE 
  // Requisito Traccia: Meccanismo di Upvote/Downvote
  it('4. Dovrebbe poter mettere o togliere Like a un Meme', () => {
    login();
    cy.get('.museum-card', { timeout: 10000 }).should('exist');
    cy.get('.museum-card').first().find('.bi-heart, .bi-heart-fill').click({ force: true });
  });

  it('5. Dovrebbe poter mettere o togliere Dislike a un Meme', () => {
    login();
    cy.get('.museum-card', { timeout: 10000 }).should('exist');
    cy.get('.museum-card').first().find('.bi-hand-thumbs-down, .bi-hand-thumbs-down-fill').click({ force: true });
  });

  //  SCENARIO 6: INTERAZIONI E NETWORK STUBBING 
  // Uso cy.intercept per verificare la risposta vera e propria del server backend
  it('6. Dovrebbe poter aggiungere un Commento (Verifica Rete)', () => {
    login();
    cy.get('.museum-card', { timeout: 10000 }).should('exist');
    
    // Spio la rotta di inserimento dei commenti per verificare lo status code
    cy.intercept('POST', '**/comments').as('invioCommento');

    cy.get('.meme-image-container').first().click();
    cy.get('#genericMemeModal').should('be.visible');

    cy.get('#genericMemeModal input[placeholder="Scrivi un commento..."]').type('Test commento rapido');
    cy.get('#genericMemeModal .bi-send-fill').click();
    
    cy.wait('@invioCommento').its('response.statusCode').should('be.oneOf', [200, 201]);

    cy.get('#genericMemeModal .btn-close').click();
  });

  //  SCENARIO 7: ALGORITMO DI ROTAZIONE
  // Requisito Traccia: Sezione "Meme del Giorno"
  it('7. Dovrebbe visualizzare correttamente il Meme del Giorno', () => {
    cy.visit('/');
    cy.contains('Opera in Evidenza').click();
    cy.get('#memeOfDayModal', { timeout: 10000 }).should('be.visible');
    cy.get('.spinner-border').should('not.exist');
  });

  //  SCENARIO 8: PROFILO UTENTE E GESTIONE DATI 
  it('8. Dovrebbe accedere al Profilo e visualizzare le proprie opere', () => {
    login();
    cy.get('.bi-person-circle').click();
    cy.url().should('include', '/profile');
    cy.contains('La tua galleria personale').should('be.visible');
  });

  //  SCENARIO 9: ELIMINAZIONE IN SICUREZZA 
  // Cancello il meme creato nel Test 3 per mantenere il DB pulito
  it('9. Dovrebbe poter eliminare l\'opera appena creata nel Profilo', () => {
    login();
    cy.visit('/profile');
    // Forzo la conferma nativa (alert/confirm) del browser
    cy.on('window:confirm', () => true);
    
    cy.contains('.museum-card', uniqueMemeTitle)
      .find('.btn-trash')
      .click();

    cy.contains(uniqueMemeTitle).should('not.exist');
  });

  //  SCENARIO 10: CHIUSURA SESSIONE 
  it('10. Dovrebbe effettuare il Logout in sicurezza cancellando il token', () => {
    login();
    cy.get('.bi-box-arrow-right').click();
    cy.contains('Accedi').should('be.visible');
  });

});