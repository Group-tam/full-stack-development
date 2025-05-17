describe('Joined Events Access', () => {
    beforeEach(() => {
        // Login as user A
        cy.visit('http://localhost:58888/login')
        cy.get('input[name="username"]').type('A') // This user has joined one public event and one private event
        cy.get('input[name="password"]').type('iloveBRAINZ2001!')
        cy.get('button[type="submit"]').click()
        
        // Navigate to event management through the UI
        cy.contains('Event Management').click()
    })

    it('allows access to joined public event and shows proper controls', () => {
        // Go to Joined Events section and find a public event
        cy.get('[data-testid="joined-events"]').within(() => {
            cy.get('[data-testid="public-status"]')
                .contains('Public')
                .closest('[data-testid="event-card"]')
                .click()
        })

        // Verify event details are visible
        cy.get('h1').should('exist')  // Event name should be visible

        // For security we need to verify the user don't see owner controls
        cy.get('button').contains('Edit Event Details').should('not.exist')
		cy.get('button').contains('Incoming Requests').should('not.exist')
        cy.get('button').contains('Inform Participants').should('not.exist')
		//Congrate message
		cy.contains('Congrate').should('not.exist')
    })

    it('allows access to joined private event and shows proper controls', () => {
        // Go to Joined Events section and find a private event
        cy.get('[data-testid="joined-events"]').within(() => {
            cy.get('[data-testid="public-status"]')
                .contains('Private')
                .closest('[data-testid="event-card"]')
                .click()
        })

        // Verify event details are visible
        cy.get('h1').should('exist')  // Event name should be visible
        cy.get('img').should('be.visible')  // Event image should be visible

        // Verify appropriate controls for joined event
        cy.contains('Discussion Board').should('be.visible')

        // Verify we don't see owner controls
        cy.get('button').contains('Edit Event Details').should('not.exist')
        cy.get('button').contains('Invite members').should('not.exist')
        cy.get('button').contains('Inform Participants').should('not.exist')

    })
})
