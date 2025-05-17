// User A has a single public event which is requested from B, one private event that has invited B
describe('RSVP Acceptance Flows', () => {
    it('allows event owner to accept join request and requester to see acceptance', () => {
        cy.visit('http://localhost:58888/login');
        cy.get('input[name="username"]').type('A'); 
        cy.get('input[name="password"]').type('iloveBRAINZ2001!');
        cy.get('button[type="submit"]').click();
        cy.get('[data-testid="rsvp-tab"]').click();

        // Find and accept the unanswered request from user B
        // The RSVP table should has two entries, one is for incoming request from B one is for tracking invitation status
        cy.get('[data-testid="rsvp-table"]').within(() => {
            cy.contains('td', 'Unanswered')
                .parent('tr')
                .within(() => {
                    cy.get('button').contains('Accept').click();
                });
        });
        
        // Wait for the response update
        cy.contains('td', 'Accepted').should('be.visible');

        // Logout
        cy.get('[data-testid="logout-button"]').click();
        
        // Login as requester (user B)
        cy.get('input[name="username"]').type('B');
        cy.get('input[name="password"]').type('iloveBRAINZ2001!');
        cy.get('button[type="submit"]').click();

        cy.get('[data-testid="rsvp-tab"]').click();

        // Verify acceptance is shown in the table 
        cy.get('[data-testid="rsvp-table"]').within(() => {
            cy.contains('td', 'sent request') 
                .parent('tr')
                .within(() => {
                    cy.contains('td', 'A').should('be.visible'); //Receiver check
                    cy.contains('td.px-4.py-3', 'Accepted').should('be.visible'); 
                });
        });
    });

    it('allows invitee to accept invitation and owner to see acceptance', () => {
        // Login as invitee (user B)
        cy.visit('http://localhost:58888/login');
        cy.get('input[name="username"]').type('B');
        cy.get('input[name="password"]').type('iloveBRAINZ2001!');
        cy.get('button[type="submit"]').click();

        cy.get('[data-testid="rsvp-tab"]').click();

        // Find and accept the pending invitation
        cy.get('[data-testid="rsvp-table"]').within(() => {
            cy.contains('td', 'Pending')
                .parent('tr')
                .within(() => {
                    cy.get('button').contains('Accept').click();
                });
        });

        // Wait for the response update
        cy.contains('td', 'Accepted').should('be.visible');

        // Logout
        cy.get('[data-testid="logout-button"]').click();
        cy.url().should('include', '/login');

        // Login as event owner (user A)
        cy.get('input[name="username"]').type('A');
        cy.get('input[name="password"]').type('iloveBRAINZ2001!');
        cy.get('button[type="submit"]').click();

        cy.get('[data-testid="rsvp-tab"]').click();

        // Verify acceptance
        cy.get('[data-testid="rsvp-table"]').within(() => {
            cy.contains('td', 'sent invitation') 
                .parent('tr')
                .within(() => {
                    cy.contains('td', 'B').should('be.visible'); //Receiver check
                    cy.contains('td.px-4.py-3', 'Accepted').should('be.visible'); 
                });
        });
    });
});
