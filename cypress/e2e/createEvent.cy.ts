describe('Public Events Page', () => {
    beforeEach(() => {
        cy.visit('http://localhost:58888/login');
        cy.get('input[name="username"]').type('admin'); // Replace with an actual username
        cy.get('input[name="password"]').type('AdminPassword1234$'); // Replace with an actual password
        cy.get('button[type="submit"]').click();

        // Wait for the redirect to complete and URL to update
        cy.url().should('include', '/public-events'); // Adjust to expected path
        cy.get('button[name="createEventButton"]').click();

        // Wait for the redirect to complete and URL to update
        cy.url().should('include', '/create-event'); // Adjust to expected path
    });

    // it('Create an event successfully', () => {
    //     cy.get('h1').should('contain', 'Create an event');
    //     cy.get('input[name="name"]').type('Test Event');
    //     cy.get('input[name="location').type('Test Location');
    //     cy.get('textarea[name="description"]').type('Test Description');
    //     cy.get('input[name="date"]').type('2025-06-11T14:30');
    //     cy.get('select[name="eventType"]').select('Public');
    //     cy.get('input#imageUpload').selectFile('cypress/fixtures/test-image.jpg', { force: true });
    //     cy.get('button[type="submit"]').click();
    //
    //     cy.contains('🎉 Event created successfully!')
    //         .should('be.visible');
    // })

    it('Handle an error with grace', () => {
        cy.intercept('POST', '/event', {
            statusCode: 500,
            body: { message: 'Internal Server Error' },
        }).as('createEvent');

        cy.get('h1').should('contain', 'Create an event');
        cy.get('input[name="name"]').type('Test Event');
        cy.get('input[name="location').type('Test Location');
        cy.get('textarea[name="description"]').type('Test Description');
        cy.get('input[name="date"]').type('2025-06-11T14:30');
        cy.get('select[name="eventType"]').select('Public');
        cy.get('input#imageUpload').selectFile('cypress/fixtures/test-image.jpg', { force: true });
        // Submit the form
        cy.get('button[type="submit"]').click();

        // Wait for the intercepted request
        cy.wait('@createEvent');

        // Assert error message/toast appears
        cy.contains('❌ Something went wrong. Please try again.').should('be.visible');
    })
});