export {};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /**
       * Realiza login de usuário administrador no sistema via UI.
       */
      loginAdmin(): Chainable<void>;

      /**
       * Realiza login de usuário padrão no sistema via UI.
       */
      loginUser(): Chainable<void>;

      /**
       * Seleciona um caso na tabela clicando em "Ver detalhes" da linha informada
       * e valida o redirecionamento para /casos/<id>.
       *
       * @param rowIndex índice da linha na tabela (default = 0)
       * @param options waitBefore: ms antes de procurar a UI (default = 1000), 
       * timeout: ms para achar elementos (default = 15000)
       */
      selectCase(
        rowIndex?: number,
        options?: { waitBefore?: number; timeout?: number }
      ): Chainable<void>
    }
  }
}

Cypress.Commands.add('loginAdmin', () => {
  const username = Cypress.env('ADMIN_USERNAME');
  const password = Cypress.env('ADMIN_PASSWORD');

  if (!username || !password) {
    throw new Error('Cypress env variables USERNAME and PASSWORD must be set');
  }

  cy.visit('/');

  cy.get('[data-testid="username-input"]', { timeout: 15000 }).should('be.visible');
  cy.get('[data-testid="password-input"]').should('be.visible');
  cy.get('[data-testid="login-button"]').should('be.visible');

  cy.get('[data-testid="username-input"]').type(username);
  cy.get('[data-testid="password-input"]').type(password, { log: false });

  cy.get('[data-testid="login-button"]').click();

  cy.location('pathname', { timeout: 15000 }).should('eq', '/casos');
  cy.window().then((win) => {
    const at = win.localStorage.getItem('access_token');
    const rt = win.localStorage.getItem('refresh_token');

    expect(at, 'access_token should exist').to.be.a('string');
    expect(rt, 'refresh_token should exist').to.be.a('string');
  });
});

Cypress.Commands.add('loginUser', () => {
  const username = Cypress.env('USER_USERNAME');
  const password = Cypress.env('USER_PASSWORD');

  if (!username || !password) {
    throw new Error('Cypress env variables USERNAME and PASSWORD must be set');
  }

  cy.visit('/');

  cy.get('[data-testid="username-input"]', { timeout: 15000 }).should('be.visible');
  cy.get('[data-testid="password-input"]').should('be.visible');
  cy.get('[data-testid="login-button"]').should('be.visible');

  cy.get('[data-testid="username-input"]').type(username);
  cy.get('[data-testid="password-input"]').type(password, { log: false });

  cy.get('[data-testid="login-button"]').click();

  cy.location('pathname', { timeout: 15000 }).should('eq', '/casos');
  cy.window().then((win) => {
    const at = win.localStorage.getItem('access_token');
    const rt = win.localStorage.getItem('refresh_token');

    expect(at, 'access_token should exist').to.be.a('string');
    expect(rt, 'refresh_token should exist').to.be.a('string');
  });
});

Cypress.Commands.add('selectCase', (rowIndex = 0, options = {}) => {
  const { waitBefore = 1000, timeout = 15000 } = options

  cy.wait(waitBefore)

  cy.get('[data-testid="cases-table"]', { timeout }).should('exist')

  cy.get('table tbody tr', { timeout })
    .eq(rowIndex)
    .then(($row) => {
      const row = cy.wrap($row)
      row.contains('a', /^ver detalhes$/i, { timeout })
        .scrollIntoView()
        .click({ force: true })
        .then(() => {
        })
    })

  cy.location('pathname', { timeout }).should((path) => {
    expect(path).to.match(/^\/casos\/.+/)
  })
})