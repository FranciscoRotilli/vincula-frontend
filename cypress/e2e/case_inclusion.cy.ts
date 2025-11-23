describe('Case creation flow', () => {
  beforeEach(() => {
    cy.loginAdmin()

    cy.intercept('GET', '/api/me', {
      statusCode: 200,
      body: {
        id: 'user-1',
        username: Cypress.env('ADMIN_USERNAME'),
        email: 'admin@example.com',
      },
    }).as('getMe')
  })

  it('opens the modal and creates a new case successfully', () => {
    const newCaseName = `Caso Cypress ${Date.now()}`

    cy.intercept('GET', '/api/case*', {
      statusCode: 200,
      body: {
        total: 0,
        page: 1,
        limit: 10,
        items: [],
        sorting: {},
      },
    }).as('getCasesInitial')

    cy.visit('/casos')
    cy.wait('@getCasesInitial')

    cy.contains('button', /ADICIONAR CASO/i).click()

    cy.contains('Adicionar caso').should('be.visible')

    cy.get('input[placeholder="Digite o nome do caso"]').type(newCaseName)

    cy.intercept('POST', '/api/case', {
      statusCode: 201,
      body: { id: 'case-cypress-1', name: newCaseName },
    }).as('createCase')

    cy.intercept('GET', '/api/case*', {
      statusCode: 200,
      body: {
        total: 1,
        page: 1,
        limit: 10,
        items: [
          {
            id: 'case-cypress-1',
            name: newCaseName,
            owner: Cypress.env('ADMIN_USERNAME'),
            status: 'Em andamento',
            creation_date: '01/01/2025',
          },
        ],
        sorting: {},
      },
    }).as('getCasesAfterCreate')

    cy.contains('button', /^Adicionar$/i).click()

    cy.wait('@createCase')
    cy.wait('@getCasesAfterCreate')

    cy.get('[data-testid="cases-table"]').should('be.visible')
    cy.contains('[data-testid="cases-table"] td', newCaseName).should('be.visible')
  })

  it('does not allow creating a case with empty name', () => {
    cy.intercept('GET', '/api/case*', {
      statusCode: 200,
      body: {
        total: 0,
        page: 1,
        limit: 10,
        items: [],
        sorting: {},
      },
    }).as('getCasesInitial')

    cy.visit('/casos')
    cy.wait('@getCasesInitial')

    cy.contains('button', /ADICIONAR CASO/i).click()

    cy.contains('Adicionar caso').should('be.visible')

    cy.intercept('POST', '/api/case').as('createCase')

    cy.contains('button', /^Adicionar$/i).should('be.disabled')

    cy.contains('button', /^Adicionar$/i).click({ force: true })

    cy.wait(300)
    cy.get('@createCase.all').should('have.length', 0)

    cy.get('input[placeholder="Digite o nome do caso"]').should('exist')
  })
})
