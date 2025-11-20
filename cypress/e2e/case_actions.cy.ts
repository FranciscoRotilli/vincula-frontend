describe('Case Actions Menu - by role', () => {
  beforeEach(() => {
    cy.visit('/casos');
  });

  it('ADMIN: should see all action menu items', () => {
    cy.loginAdmin();
    cy.selectCase();

    cy.get('[data-testid="case-details"]', { timeout: 15000 }).should('exist');
    cy.get('[data-testid="case-actions"] button').first().click({ force: true });

    cy.get('#basic-menu', { timeout: 10000 }).should('be.visible').within(() => {
      cy.get('[data-testid="menu-change-name"]').should('exist');
      cy.get('[data-testid="menu-change-situation"]').should('exist');
      cy.get('[data-testid="menu-allow-view"]').should('exist');

      cy.get('[data-testid="menu-change-case-owner"]').should('exist');
      cy.get('[data-testid="menu-delete-case"]').should('exist');
    });
  });

  it('USER: should see only items allowed for a regular user', () => {
    cy.loginUser();
    cy.selectCase();

    cy.get('[data-testid="case-details"]', { timeout: 15000 }).should('exist');
    cy.get('[data-testid="case-actions"] button').first().click({ force: true });

    cy.get('#basic-menu', { timeout: 10000 }).should('be.visible').within(() => {
      cy.get('[data-testid="menu-change-name"]').should('exist');
      cy.get('[data-testid="menu-change-situation"]').should('exist');
      cy.get('[data-testid="menu-allow-view"]').should('exist');

      cy.get('[data-testid="menu-change-case-owner"]').should('not.exist');
      cy.get('[data-testid="menu-delete-case"]').should('not.exist');
    });
  });
});

describe('Case - rename flow', () => {
  beforeEach(() => {
    cy.visit('/casos');
  });

  it('should successfully rename the case', () => {
    cy.loginAdmin();
    cy.selectCase();

    cy.get('[data-testid="case-details"]', { timeout: 15000 }).should('exist');

    cy.get('[data-testid="case-actions"] button').first().click({ force: true });
    cy.get('#basic-menu [data-testid="menu-change-name"]').click({ force: true });

    cy.get('[data-testid="modal-change-name"]', { timeout: 10000 }).should('be.visible');

    const newName = `Caso cypress`;

    cy.get('[data-testid="modal-change-name"] input[type="text"]').clear().type(newName);

    cy.get('[data-testid="modal-change-name"]').contains('button', /salvar|save/i).click();

    cy.get('[data-testid="case-name"]', { timeout: 15000 })
      .should('be.visible')
      .and('contain.text', newName);
  });
});
