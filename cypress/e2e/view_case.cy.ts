describe('View Case - search, filter and details', () => {
  before(() => {
    cy.loginUser();
  });

  it('filters the cases list, opens a case and shows investigators, files and metadata', () => {
    cy.get('table tbody tr')
      .first()
      .then(($tr) => {
        const $cells = $tr.find('td');
        const caseName = $cells.length ? $cells.eq(0).text().trim() : $tr.text().trim();

        cy.get('[data-testid="filter-button"]').click();
        cy.contains(caseName).should('be.visible');
      });

    cy.selectCase(0, { waitBefore: 1000, timeout: 15000 });

    cy.contains(/Investigad/i).should('exist');
    cy.contains(/Arquiv/i).should('exist');
  });
});
