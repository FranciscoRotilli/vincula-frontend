describe('Flow: Login, List and Filter Cases', () => {

  it('should login as admin, load the list and filter the case "Operação Escola Segura"', () => {

    cy.visit('/'); 
    
    cy.intercept('POST', '/api/auth/login').as('loginRequest');

    cy.get('[data-testid="username-input"]').type(Cypress.env('USERNAME'));
    cy.get('[data-testid="password-input"]').type(Cypress.env('PASSWORD'));
    cy.get('[data-testid="login-button"]').click(); 

    cy.wait('@loginRequest');

    cy.url({ timeout: 10000 }).should('include', '/casos'); 
    
    cy.get('[data-testid="cases-table"] tbody > tr')
      .should('have.length.greaterThan', 0);

    let totalCasesBeforeFilter: number;
    cy.get('[data-testid="cases-table"] tbody > tr').then(($rows) => {
      totalCasesBeforeFilter = $rows.length;
    });

    const uniqueCaseName = 'Operação Escola Segura';
    
    cy.intercept('GET', '/api/case*').as('filterRequest');
    
    cy.get('[data-testid="case-name-input"] input').clear().type(uniqueCaseName);
    
    cy.wait('@filterRequest', { timeout: 5000 });
    
    cy.get('[data-testid="cases-table"] tbody > tr', { timeout: 10000 })
      .should('have.length', 1)
      .and('be.visible');

    cy.get('[data-testid="cases-table"] tbody > tr')
      .first()
      .should('contain.text', uniqueCaseName);

    cy.get('[data-testid="cases-table"] tbody > tr').then(($rows) => {
      const totalAfterFilter = $rows.length;      
      expect(totalAfterFilter).to.equal(1);
      expect($rows.text()).to.include(uniqueCaseName);
    });
  });
});