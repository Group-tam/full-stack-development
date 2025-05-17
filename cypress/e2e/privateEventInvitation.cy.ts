describe('Private Event Invitation Flow', () => {
    it('allows owner to invite user and invitee to see invitation', () => {
        // Login as event owner (user A)
        cy.visit('http://localhost:58888/login');
        cy.get('input[name="username"]').type('A'); //This user has a single private event that hasn't invite anyone yet
        cy.get('input[name="password"]').type('iloveBRAINZ2001!');
        cy.get('button[type="submit"]').click();

        // Navigate to Event Management
        cy.contains('Event Management').click();

        // Find and click on the private event
        cy.get('[data-testid="event-card"]')
            .find('.text-red-700') 
            .contains('Private')
            .parents('a')  
            .click();

        // Click invite members button to open modal
        cy.get('button').contains('Invite members').click();
		
        // Input user B in the invitation form
        cy.get('[data-testid="invite-input"]').type('B');
        cy.get('button').contains('B').click();
        // Click send invitation
        cy.get('button').contains('Send Invites').click();

        // Verify invitation sent message
        cy.contains('Invitations sent successfully!').should('be.visible');

        // Close the modal
        cy.get('button').contains('Cancel').click();

        // Logout
        cy.get('[data-testid="logout-button"]').click();
        cy.url().should('include', '/login');

        // Login as the invitee (user B)
        cy.get('input[name="username"]').type('B');
        cy.get('input[name="password"]').type('iloveBRAINZ2001!');
        cy.get('button[type="submit"]').click();

        // Navigate to RSVP tab
        cy.get('[data-testid="rsvp-tab"]').click();

        // Verify the invitation is visible in the RSVP table (Make sure the table is empty)
        cy.get('[data-testid="rsvp-table"]').within(() => {
            cy.contains('td', 'A').should('be.visible'); // Event owner
            cy.contains('td', 'Pending').should('be.visible');
        });
    });
});
