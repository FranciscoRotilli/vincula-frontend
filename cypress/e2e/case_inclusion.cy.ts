describe('Case inclusion flow', () => {
  beforeEach(() => {
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: {
        access_token: 'fake-access-token',
        refresh_token: 'fake-refresh-token',
      },
    }).as('login');

    cy.intercept('GET', /\/api\/case.*/, {
      statusCode: 200,
      body: {
        total: 0,
        page: 1,
        limit: 10,
        items: [],
        sorting: {},
      },
    }).as('getCasesInitial');

    cy.visit('/');
  });

  it('logs in and creates a new case', () => {
    const username = Cypress.env('USERNAME');
    const password = Cypress.env('PASSWORD');
    if (!username || !password) {
      throw new Error('Cypress env variables USERNAME and PASSWORD must be set');
    }
    cy.get('[data-testid="username-input"]').type(username);
    cy.get('[data-testid="password-input"]').type(password, { log: false });
    cy.get('[data-testid="login-button"]').click();
    cy.wait('@login');

    // Intercept the /api/me endpoint
    cy.intercept('GET', '/api/me', {
      statusCode: 200,
      body: {
        id: 'user-1',
        username: username,
        email: `${username}@example.com`,
      },
    }).as('getMe');

    cy.setCookie('access_token', 'fake-access-token', { path: '/' });
    cy.setCookie('refresh_token', 'fake-refresh-token', { path: '/' });

    cy.visit('/casos');

    cy.url().should('include', '/casos');

    cy.intercept('POST', '/api/case', {
      statusCode: 201,
      body: { id: 'case-cypress-1', name: 'Caso Cypress Teste' },
    }).as('createCase');

    cy.intercept('GET', /\/api\/case.*/, {
      statusCode: 200,
      body: {
        total: 1,
        page: 1,
        limit: 10,
        items: [
          {
            id: 'case-cypress-1',
            name: 'Caso Cypress Teste',
            owner: username,
            status: 'Em andamento',
            creation_date: '01/01/2025',
          },
        ],
        sorting: {},
      },
    }).as('getCasesAfterCreate');

    cy.contains(/ADICIONAR CASO|ADD CASE/i).click();

    cy.get('input[placeholder="Digite o nome do caso"], input[placeholder="Enter case name"]').type('Caso Cypress Teste');
    cy.contains(/^(Adicionar|Add)$/i).click();

    cy.wait('@createCase');
    cy.wait('@getCasesAfterCreate');

    cy.contains('Caso Cypress Teste').should('be.visible');
  });

  it('does not allow creating a case without a name', () => {
    const username = Cypress.env('USERNAME');
    const password = Cypress.env('PASSWORD');
    if (!username || !password) {
      throw new Error('Cypress env variables USERNAME and PASSWORD must be set');
    }

    cy.get('[data-testid="username-input"]').type(username);
    cy.get('[data-testid="password-input"]').type(password, { log: false });
    cy.get('[data-testid="login-button"]').click();
    cy.wait('@login');

    // Intercept the /api/me endpoint
    cy.intercept('GET', '/api/me', {
      statusCode: 200,
      body: {
        id: 'user-1',
        username: username,
        email: `${username}@example.com`,
      },
    }).as('getMe');

    cy.setCookie('access_token', 'fake-access-token', { path: '/' });
    cy.setCookie('refresh_token', 'fake-refresh-token', { path: '/' });
    cy.visit('/casos');

    cy.contains(/ADICIONAR CASO|ADD CASE/i).click();

    cy.intercept('POST', '/api/case').as('createCase');

    cy.contains(/^(Adicionar|Add)$/i).should('be.disabled');

    cy.contains(/^(Adicionar|Add)$/i).click({ force: true });

    cy.wait(500); 
    cy.get('@createCase.all').should('have.length', 0);

    cy.get('input[placeholder="Digite o nome do caso"], input[placeholder="Enter case name"]').should('exist');
  });
});