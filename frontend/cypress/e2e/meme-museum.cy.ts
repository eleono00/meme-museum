
describe('Meme Museum - Test Core e Contenuti (10 Scenari)', () => {
  
  // ⚠️ ATTENZIONE: Inserisci qui credenziali VALIDE del tuo database!
  const testEmail = 'ele@gmail.com'; 
  const testPassword = '1234';  
   
  
  const uniqueMemeTitle = 'Capolavoro Cypress ' + Date.now();

  const login = () => {
    cy.visit('/login');
    cy.get('input[type="email"]').type(testEmail);
    cy.get('input[type="password"]').type(testPassword);
    cy.contains('Entra nel Museo').click();
    cy.url().should('eq', Cypress.config().baseUrl + '/');
  };

  // TEST 1: LOGIN FALLITO
  it('1. Dovrebbe restare sulla pagina di login se le credenziali sono errate', () => {
    cy.visit('/login');
    cy.get('input[type="email"]').type('fake@email.com');
    cy.get('input[type="password"]').type('sbagliata');
    cy.contains('Entra nel Museo').click();
    // Verifica che l'URL rimanga bloccato sulla pagina di login
    cy.url().should('include', '/login'); 
  });

  // TEST 2: FILTRI HOME PAGE
  it('2. Dovrebbe usare i filtri e l\'ordinamento nella Home', () => {
    cy.visit('/');
    cy.get('select').select('Meno recenti'); 
    cy.get('input[placeholder="Cerca tag..."]').type('test');
    cy.contains('Rimuovi filtro: test').should('be.visible');
  });

  // TEST 3: UPLOAD DI UN MEME
  it('3. Dovrebbe permettere a un utente loggato di pubblicare un Meme', () => {
    login();
    cy.contains('Aggiungi Opera').click();
    cy.get('input[placeholder="Es: La Gioconda moderna..."]').type(uniqueMemeTitle);
    cy.get('input[placeholder="Scrivi un tag e premi Spazio..."]').type('e2e{enter}');

    cy.get('input[type="file"]').selectFile({
      contents: Cypress.Buffer.from('Finto contenuto immagine'),
      fileName: 'test-cypress.png',
      mimeType: 'image/png'
    });

    cy.contains('Pubblica').click();
    cy.contains(uniqueMemeTitle, { timeout: 10000 }).should('be.visible');
  });

  // TEST 4: LIKE A UN MEME
  it('4. Dovrebbe poter mettere o togliere Like a un Meme', () => {
    login();
    cy.get('.museum-card', { timeout: 10000 }).should('exist');
    // Cerchiamo DENTRO la prima card visibile e forziamo il click
    cy.get('.museum-card').first().find('.bi-heart, .bi-heart-fill').click({ force: true });
  });

  // TEST 5: DISLIKE A UN MEME
  it('5. Dovrebbe poter mettere o togliere Dislike a un Meme', () => {
    login();
    cy.get('.museum-card', { timeout: 10000 }).should('exist');
    // Cerchiamo DENTRO la prima card visibile e forziamo il click
    cy.get('.museum-card').first().find('.bi-hand-thumbs-down, .bi-hand-thumbs-down-fill').click({ force: true });
  });



// TEST 6: INSERIMENTO DI UN COMMENTO (Network Assertion)
  it('6. Dovrebbe poter aggiungere un Commento', () => {
    login();
    cy.get('.museum-card', { timeout: 10000 }).should('exist');
    
    // 1. Diciamo a Cypress di "spiare" la rotta del backend dove vengono inviati i commenti
    cy.intercept('POST', '**/comments').as('invioCommento');

    // 2. Apriamo la modale
    cy.get('.meme-image-container').first().click();
    cy.get('#genericMemeModal').should('be.visible');

    // 3. Scriviamo un commento e clicchiamo invia
    cy.get('#genericMemeModal input[placeholder="Scrivi un commento..."]').type('Test commento rapido');
    cy.get('#genericMemeModal .bi-send-fill').click();
    
    // 4. LA VERA MAGIA: Aspettiamo la risposta del Server. Se risponde 200 (OK) o 201 (Creato), il test è superato!
    cy.wait('@invioCommento').its('response.statusCode').should('be.oneOf', [200, 201]);

    // 5. Chiudiamo la modale
    cy.get('#genericMemeModal .btn-close').click();
  });

  // TEST 7: MEME DEL GIORNO
  it('7. Dovrebbe visualizzare correttamente il Meme del Giorno', () => {
    cy.visit('/');
    cy.contains('Opera in Evidenza').click();
    cy.get('#memeOfDayModal', { timeout: 10000 }).should('be.visible');
    cy.get('.spinner-border').should('not.exist');
  });

  // TEST 8: VISUALIZZAZIONE PROFILO E PROPRI MEME
  it('8. Dovrebbe accedere al Profilo e visualizzare le proprie opere', () => {
    login();
    cy.get('.bi-person-circle').click();
    cy.url().should('include', '/profile');
    cy.contains('La tua galleria personale').should('be.visible');
  });

  // TEST 9: ELIMINAZIONE DI UN MEME
  it('9. Dovrebbe poter eliminare l\'opera appena creata nel Profilo', () => {
    login();
    cy.visit('/profile');
    cy.on('window:confirm', () => true);
    
    cy.contains('.museum-card', uniqueMemeTitle)
      .find('.btn-trash')
      .click();

    cy.contains(uniqueMemeTitle).should('not.exist');
  });

  // TEST 10: LOGOUT E CHIUSURA
  it('10. Dovrebbe effettuare il Logout in sicurezza', () => {
    login();
    cy.get('.bi-box-arrow-right').click();
    cy.contains('Accedi').should('be.visible');
  });

});