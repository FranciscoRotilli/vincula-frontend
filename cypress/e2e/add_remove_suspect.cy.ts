describe('Add and Remove Suspect Flow', () => {
  const caseName = 'Operação Escola Segura'
  const caseId = '62af25d0-3338-45f7-95e6-13d7333d40ce'

  beforeEach(() => {
    cy.loginAdmin()
  })

  it('adds a suspect with name and CPF to Escola Segura case', () => {
    const suspectName = `Sus ${Math.random().toString(36).slice(7)}`
    const suspectCpf = String(Math.floor(10_000_000_000 + Math.random() * 90_000_000_000))
    const suspectId = 'suspect-123'

    cy.intercept('GET', '/api/case*', {
      total: 1,
      page: 1,
      limit: 10,
      items: [
        {
          id: caseId,
          name: caseName,
          owner: 'admin',
          status: 'Em andamento',
          creation_date: '01/01/2025',
        },
      ],
      sorting: {},
    }).as('cases')

    cy.intercept('GET', `/api/case/${caseId}`, {
      id: caseId,
      name: caseName,
      owner: 'admin',
      status: 'Em andamento',
      creation_date: '01/01/2025',
      case_number: '2024001',
      suspects: [],
    }).as('caseDetails')

    cy.intercept('GET', `/api/cases/${caseId}/users`, []).as('caseUsers')
    cy.intercept('GET', `/api/case/${caseId}/viewers`, []).as('caseViewers')
    cy.intercept('GET', `/api/case/${caseId}/suspects`, []).as('suspects')
    cy.intercept('GET', `/api/case/${caseId}/files`, []).as('files')

    cy.visit('/casos')
    cy.wait('@cases')

    cy.get('[data-testid="case-name-input"] input').clear().type(caseName)
    cy.wait('@cases')

    cy.selectCase(0, { waitBefore: 500, timeout: 20000 })
    cy.url().should('include', `/casos/`)
    cy.wait('@caseDetails')

    cy.intercept('POST', `/api/case/${caseId}/suspect`, {
      statusCode: 201,
      body: { id: suspectId, name: suspectName, cpf_cnpj: suspectCpf, phone_number: '' },
    }).as('addSuspect')

    cy.intercept('GET', `/api/case/${caseId}`, {
      id: caseId,
      name: caseName,
      owner: 'admin',
      status: 'Em andamento',
      creation_date: '01/01/2025',
      case_number: '2024001',
      suspects: [{ id: suspectId, name: suspectName, cpf_cnpj: suspectCpf, phone_number: '' }],
    }).as('caseDetailsWithSuspect')

    cy.get('[data-testid="investigated-section"]').within(() => {
      cy.contains('label', 'Nome').parent().find('input').type(suspectName)
      cy.contains('label', 'CPF / CNPJ').parent().find('input').type(suspectCpf)
      cy.get('[data-testid="add-suspect"]').click()
    })

    cy.wait('@addSuspect')
    cy.wait('@caseDetailsWithSuspect')

    cy.get('[data-testid="involved-table"]')
      .contains('tr', suspectName)
      .within(() => {
        cy.contains('td', suspectName).should('be.visible')
        cy.contains('td', suspectCpf.substring(0, 3)).should('be.visible')
      })
  })

  it('removes a suspect from Escola Segura case', () => {
    const suspectName = `Sus ${Math.random().toString(36).slice(7)}`
    const suspectCpf = String(Math.floor(10_000_000_000 + Math.random() * 90_000_000_000))
    const suspectId = 'suspect-456'

    cy.intercept('GET', '/api/case*', {
      total: 1,
      page: 1,
      limit: 10,
      items: [
        {
          id: caseId,
          name: caseName,
          owner: 'admin',
          status: 'Em andamento',
          creation_date: '01/01/2025',
        },
      ],
      sorting: {},
    }).as('cases')

    cy.intercept('GET', `/api/case/${caseId}`, {
      id: caseId,
      name: caseName,
      owner: 'admin',
      status: 'Em andamento',
      creation_date: '01/01/2025',
      case_number: '2024001',
      suspects: [{ id: suspectId, name: suspectName, cpf_cnpj: suspectCpf, phone_number: '' }],
    }).as('caseDetails')

    cy.intercept('GET', `/api/cases/${caseId}/users`, []).as('caseUsers')
    cy.intercept('GET', `/api/case/${caseId}/viewers`, []).as('caseViewers')
    cy.intercept('GET', `/api/case/${caseId}/suspects`, []).as('suspects')
    cy.intercept('GET', `/api/case/${caseId}/files`, []).as('files')

    cy.visit('/casos')
    cy.wait('@cases')

    cy.get('[data-testid="case-name-input"] input').clear().type(caseName)
    cy.wait('@cases')

    cy.selectCase(0, { waitBefore: 500, timeout: 20000 })
    cy.url().should('include', `/casos/`)
    cy.wait('@caseDetails')

    cy.get('[data-testid="involved-table"]')
      .contains('tr', suspectName)
      .within(() => {
        cy.contains('td', suspectName).should('be.visible')
      })

    cy.intercept('DELETE', `/api/case/${caseId}/suspect/${suspectId}`, { statusCode: 204 }).as('deleteSuspect')

    cy.intercept('GET', `/api/case/${caseId}`, {
      id: caseId,
      name: caseName,
      owner: 'admin',
      status: 'Em andamento',
      creation_date: '01/01/2025',
      case_number: '2024001',
      suspects: [],
    }).as('caseDetailsAfterDelete')

    cy.get('[data-testid="involved-table"]')
      .contains('tr', suspectName)
      .within(() => {
        cy.get('button[aria-label="Remover"]').click()
      })

    cy.contains('Remover investigado?').should('be.visible')
    cy.contains('button', 'Remover').last().click()

    cy.wait('@deleteSuspect')
    cy.wait('@caseDetailsAfterDelete')

    cy.get('[data-testid="involved-table"]').should('not.contain.text', suspectName)
  })
})
