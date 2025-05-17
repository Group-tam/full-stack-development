describe('Public Event Access', () => {
    beforeEach(() => {
        // Login as user A
        cy.visit('http://localhost:58888/login')
        cy.get('input[name="username"]').type('A') //Trying to access somebody else public event without being accepted
        cy.get('input[name="password"]').type('iloveBRAINZ2001!')
        cy.get('button[type="submit"]').click()
    })

    it('allows access to other users public events and shows join controls', () => {        // First check for public events
        cy.get('div[data-testid="event-card"]').within(() => {
            // Find the first card that doesn't show "You own this item!"
            cy.get('Link, a')  // Both Link and anchor tag just in case
                .not(':contains("You own this item!")')
                .first()
                .click()
        })

        // Verify we can access the event details
        cy.get('h1').should('exist')  // Event name should be visible
        cy.get('img').should('be.visible')  // Event image should be visible

        // Verify join controls are present
        cy.get('button')
            .contains('Request to join')
            .should('be.visible')
            .should('be.enabled')

        // Verify owner controls are NOT present
        cy.get('button').contains('Edit Event Details').should('not.exist')
        cy.get('button').contains('Inform Participants').should('not.exist')
    })
})
