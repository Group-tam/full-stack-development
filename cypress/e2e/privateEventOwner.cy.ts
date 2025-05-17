describe('Private Event Owner Access via Event Management', () => {    beforeEach(() => {
        // Login as user A
        cy.visit('http://localhost:58888/login')
        cy.get('input[name="username"]').type('A') // This user currently has a private event
        cy.get('input[name="password"]').type('iloveBRAINZ2001!')       
		cy.get('button[type="submit"]').click()        
        cy.contains('Event Management').click()
        cy.get('[data-testid="owned-events"]').should('be.visible')
    })

    it('allows access to private event details and owner controls', () => {  // Find and click the first private event
        cy.get('[data-testid="owned-events"] [data-testid="public-status"]')
            .contains('Private')
            .closest('[data-testid="event-card"]')
            .click()

        // Verify owner controls for private event
        cy.get('button')
            .contains('Edit Event Details')
            .should('be.visible')
            .should('be.enabled')

        cy.get('button')
            .contains('Invite members')
            .should('be.visible')
            .should('be.enabled')

        cy.get('button')
            .contains('Inform Participants')
            .should('be.visible')
            .should('be.enabled')
    })
})
