describe('Event Join Request Flow', () => {
    it('allows user to request joining event and owner to see request', () => {
        // First login as the requesting user (user B)
        cy.visit('http://localhost:58888/login');
        cy.get('input[name="username"]').type('B');
        cy.get('input[name="password"]').type('iloveBRAINZ2001!');
        cy.get('button[type="submit"]').click();
		// Find an event organized by user A and click it   
        cy.get('[data-testid="event-card"]')
            .find('.text-gray-500')  
            .contains('Organized by A')
            .parents('a')  
            .click();

        // Click the request to join button
        cy.get('button')
            .contains('Request to join')
            .click();

        // Request sent message
        cy.contains('Your request to join is pending approval').should('be.visible');

        // Logout
        cy.get('[data-testid="logout-button"]').click();
        cy.url().should('include', '/login');

        // Login as the EVENT OWNER (user A)
        cy.get('input[name="username"]').type('A');
        cy.get('input[name="password"]').type('iloveBRAINZ2001!');
        cy.get('button[type="submit"]').click();

        // Navigate to Event Management
        cy.contains('Event Management').click();

        // Find and click on the event
        cy.get('[data-testid="event-card"]')
            .contains('Public')
            .closest('[data-testid="event-card"]')
            .click();

		// Go to RSVP tab
		cy.get('[data-testid="rsvp-tab"]').click();

        // Verify the request is visible in the RSVP table (Make sure the table is empty)
        cy.get('[data-testid="rsvp-table"]').within(() => {
            cy.contains('td', 'B').should('be.visible');
            cy.contains('td', 'Unanswered').should('be.visible');
        });
    });
});
