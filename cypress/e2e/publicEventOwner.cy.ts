describe('Public Events Page - Owner Access', () => {
    beforeEach(() => {
        // Login as user A
        cy.visit('http://localhost:58888/login')
        cy.get('input[name="username"]').type('A') // This user currently has a public event
        cy.get('input[name="password"]').type('iloveBRAINZ2001!')
        cy.get('button[type="submit"]').click()
        
        // We're on the public events page
        cy.url().should('include', '/public-events')
        cy.get('h1').contains('Public Events').should('be.visible')
    })

    it('allows access to event details and owner controls', () => {
		// Find event with owned badge
		cy.get('[data-testid="owned-badge"]')
			.should('be.visible')
			.should('contain', 'You own this item!')
	
		// Get the event card that contains the owned badge
		cy.get('[data-testid="owned-badge"]')
			.closest('a') 
			.within(() => {
				cy.get('h3').should('be.visible') // Event name 
				cy.get('img').should('be.visible') // Event image
				cy.contains('p', 'attendees').should('be.visible') // Attendee count
			})
		.click()

        // On the event details page, verify owner controls
        cy.get('button')
            .contains('Edit Event Details')
            .should('be.visible')
            .should('be.enabled')
        
        cy.get('button')
            .contains('Inform Participants')
            .should('be.visible')
            .should('be.enabled')
    })
})
