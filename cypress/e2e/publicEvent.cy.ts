describe('Public Events Page', () => {
    before(() => {
        cy.visit('http://localhost:58888/login');
        cy.get('input[name="username"]').type('admin'); // Replace with an actual username
        cy.get('input[name="password"]').type('AdminPassword1234$'); // Replace with an actual password
        cy.get('button[type="submit"]').click();
    });

    it('should display the public events correctly', () => {
        cy.contains('h1', 'Public Events').should('be.visible');

        cy.get('body').then($body => {
            if ($body.find('[data-testid="event-card"] > *').length > 0) {
                // ✅ Events exist
                cy.get('[data-testid="event-card"]')
                    .children()
                    .should('have.length.greaterThan', 0);
            } else {
                // 🚫 No events fallback
                cy.get('[data-testid="no-events-message"]')
                    .should('contain.text', 'No events available')
                    .and('be.visible');
            }
        });

        cy.get('[data-testid="event-card"]').each(($el) => {
            cy.wrap($el).should('be.visible');
        });
    });
});
