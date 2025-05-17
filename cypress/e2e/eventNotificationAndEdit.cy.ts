// User A has a public event that B has joined, currently B has no notification
// Importantly the event time should be 5 minutes away from the real time
describe('Event Edit and Notification Flow', () => {
    it('allows owner to edit event and notifies joined users', () => {
        // Login as event owner (user A)
        cy.visit('http://localhost:58888/login');
        cy.get('input[name="username"]').type('A');
        cy.get('input[name="password"]').type('iloveBRAINZ2001!');
        cy.get('button[type="submit"]').click();

        // Navigate to Event Management
        cy.contains('Event Management').click();

        // Find and click the owned event
        cy.get('[data-testid="owned-events"]').within(() => {
            cy.get('[data-testid="public-status"]') // Can be private as well
                .contains('Public')
                .closest('[data-testid="event-card"]')
                .click()
        })

        // Click edit event details button
        cy.get('button').contains('Edit Event Details').click();

        // Edit event details in modal
        cy.get('[data-testid="event-edit-modal"]').within(() => {
            // Clear and type new event name
            cy.get('input[name="eventName"]').clear().type('Updated Event Name Test');            
            cy.get('input[name="eventLocation"]').clear().type('New Test Location');            
            cy.get('textarea[name="eventDescription"]').clear()
                .type('UPDATED.');

            // Submit changes
            cy.get('button').contains('Apply').click();
        });

        // Verify modal is closed and changes are visible
        cy.get('[data-testid="event-edit-modal"]').should('not.exist');
        
        // Verify updated details are shown
        cy.contains('Updated Event Name Test').should('be.visible');
        cy.contains('New Test Location').should('be.visible');
        cy.contains('UPDATED').should('be.visible');

        // Logout
        cy.get('[data-testid="logout-button"]').click();
        cy.url().should('include', '/login');

        // Login as joined user (user B)
        cy.get('input[name="username"]').type('B');
        cy.get('input[name="password"]').type('iloveBRAINZ2001!');
        cy.get('button[type="submit"]').click();

        // Verify notification badge
        cy.get('[data-testid="notification-badge"]')
            .should('be.visible')
            .and('contain', '1');
    });

    it('allows owner to inform participants and updates notification count', () => {
        // Login as event owner (user A)
        cy.visit('http://localhost:58888/login');
        cy.get('input[name="username"]').type('A');
        cy.get('input[name="password"]').type('iloveBRAINZ2001!');
        cy.get('button[type="submit"]').click();

        // Navigate to Event Management
        cy.contains('Event Management').click();

        // Find and click the owned event
        cy.get('[data-testid="owned-events"]').within(() => {
            cy.get('[data-testid="public-status"]') // Can be private as well
                .contains('Public')
                .closest('[data-testid="event-card"]')
                .click()
        });

        // Click inform participants button
        cy.get('button').contains('Inform Participants').click();

        // Type message in the inform modal
        cy.get('[data-testid="inform-modal"]').within(() => {
            cy.get('textarea[placeholder="Write your message here..."]')
                .type('INFORMTEST');

            // Click send button
            cy.get('button').contains('Send').click();
        });

        // Logout
        cy.get('[data-testid="logout-button"]').click();
        cy.url().should('include', '/login');

        // Login as joined user (user B)
        cy.get('input[name="username"]').type('B');
        cy.get('input[name="password"]').type('iloveBRAINZ2001!');
        cy.get('button[type="submit"]').click();

        // Verify notification badge shows 2
        cy.get('[data-testid="notification-badge"]')
            .should('be.visible')
            .and('contain', '2');
    });

    it('allows owner to schedule a notification and participant receives it after delay', () => {
        // Login as event owner (user A)
        cy.visit('http://localhost:58888/login');
        cy.get('input[name="username"]').type('A');
        cy.get('input[name="password"]').type('iloveBRAINZ2001!');
        cy.get('button[type="submit"]').click();

        // Navigate to Event Management
        cy.contains('Event Management').click();

        // Find and click the owned event
        cy.get('[data-testid="owned-events"]').within(() => {
            cy.get('[data-testid="public-status"]') // Can be private as well
                .contains('Public')
                .closest('[data-testid="event-card"]')
                .click()
        });

        // Click inform participants button
        cy.get('button').contains('Inform Participants').click(); // Type message and set up scheduled notification
        cy.get('[data-testid="inform-modal"]').within(() => {
            // Type message
            cy.get('textarea[placeholder="Write your message here..."]')
                .type('SCHEDULED');

            // Scheduling
            cy.get('input[type="checkbox"][id="schedule"]').click();

            // Select 1 minute
            cy.get('select').select('1');

            // Send
            cy.get('button').contains('Send').click();
        });

        // Wait for modal to close and get event time from the event detail card
        cy.get('[data-testid="inform-modal"]').should('not.exist');        
		cy.get('[data-testid="event-detail-card"]').within(() => {
            cy.get('[data-testid="event-time-value"]').invoke('text').then((timeText) => {
                cy.wrap(new Date(timeText)).as('eventDateTime');
            });
        });

        // Logout
        cy.get('[data-testid="logout-button"]').click();
        cy.url().should('include', '/login');        // Login as joined user (user B)
        cy.get('input[name="username"]').type('B');
        cy.get('input[name="password"]').type('iloveBRAINZ2001!');
        cy.get('button[type="submit"]').click();

        // Calculate and wait for notification time
        cy.get('@eventDateTime').then((eventDateTime: any) => {
            const notificationTime = new Date((eventDateTime as Date).getTime() - 60000); // 1 minute before
            const now = new Date();
            const waitTime = notificationTime.getTime() - now.getTime() + 8000;
            
            if (waitTime > 0) {
                cy.wait(waitTime);
            }
        });

        // Verify notification badge has increased to 3 (Success)
        cy.get('[data-testid="notification-badge"]')
            .should('be.visible')
            .and('contain', '3');
    });
});
