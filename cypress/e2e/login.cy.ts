describe('Login Page', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should log in successfully as an ADMIN', () => {
    cy.loginAdmin()
  })

  it('should log in successfully as an USER', () => {
    cy.loginUser()
  })

  it('shows validation errors when submitting empty form', () => {
    cy.visit('/')

    cy.get('[data-testid="login-button"]').click()

    cy.contains('label', 'Usuário').should('exist')
    cy.contains('O usuário deve ser informado.').should('be.visible')

    cy.contains('label', 'Senha').should('exist')
    cy.contains('A senha deve ser informada.').should('be.visible')
  })

  it('disables button and shows loading state while pending', () => {
    const username = Cypress.env('ADMIN_USERNAME')
    const password = Cypress.env('ADMIN_PASSWORD')

    cy.get('[data-testid="username-input"]').type(username)
    cy.get('[data-testid="password-input"]').type(password, { log: false })

    cy.get('[data-testid="login-button"]').click()
    cy.get('[data-testid="login-button"]')
      .should('be.disabled')
      .and('contain.text', 'Entrando...')
  })

  it('shows invalid credentials error when server denies login', () => {
    cy.intercept('GET', '**/me', { statusCode: 401, body: {} }).as('me')

    const username = 'usuario_teste'
    const wrongPassword = 'senha_incorreta'

    cy.get('[data-testid="username-input"]').type(username)
    cy.get('[data-testid="password-input"]').type(wrongPassword, { log: false })
    cy.get('[data-testid="login-button"]').click()

    cy.url().should('not.include', '/casos')

    cy.contains('label', 'Usuário').should('exist')
    cy.contains('Usuário ou senha inválido.').should('be.visible')

    cy.contains('label', 'Senha').should('exist')
    cy.contains('Usuário ou senha inválido.').should('be.visible')
  })
})