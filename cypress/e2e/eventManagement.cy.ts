describe('Event Management Page', () => {
    beforeEach(() => {
        // Login first
        cy.visit('http://localhost:58888/login')
        cy.get('input[name="username"]').type('A')
        cy.get('input[name="password"]').type('iloveBRAINZ2001!')
        cy.get('button[type="submit"]').click()

        // Wait for login success
        cy.url().should('include', '/public-events')

        // Go to event management page
        cy.visit('http://localhost:58888/event-management')

        // Wait for API responses
        cy.intercept('GET', '/event/owned').as('ownedEvents')
        cy.intercept('GET', '/event/joined').as('joinedEvents')
        cy.wait(['@ownedEvents', '@joinedEvents'])
    })

    it('displays both sections with correct headers', () => {
        // Check owned events section header
        cy.get('[data-testid="owned-events"]')
            .should('exist')
            .within(() => {
                cy.get('h1').should('contain.text', 'Owned Events')
            })

        // Check joined events section header
        cy.get('[data-testid="joined-events"]')
            .should('exist')
            .within(() => {
                cy.get('h1').should('contain.text', 'Joined Events')
            })
    })

    it('displays event information if events exist', () => {
        // Check owned events section
        cy.get('[data-testid="owned-events"]').then($container => {
			if ($container.find('[data-testid="event-card"]').length > 0) {
				cy.get('[data-testid="event-card"]').first().within(() => {
					cy.get('[data-testid="event-name"]').should('be.visible')
					cy.get('[data-testid="event-description"]').should('be.visible')
					cy.get('[data-testid="event-time"]').should('be.visible')
					cy.get('[data-testid="event-location"]').should('be.visible')
					cy.get('[data-testid="public-status"]').should('be.visible')
				})
			}
    	})

        // Check joined events section
        cy.get('[data-testid="joined-events"]').then($container => {
			if ($container.find('[data-testid="event-card"]').length > 0) {
				cy.get('[data-testid="event-card"]').first().within(() => {
					cy.get('[data-testid="event-name"]').should('be.visible')
					cy.get('[data-testid="event-description"]').should('be.visible')
					cy.get('[data-testid="event-time"]').should('be.visible')
					cy.get('[data-testid="event-location"]').should('be.visible')
					cy.get('[data-testid="public-status"]').should('be.visible')
				})
			}
    	})
    })

    it('navigates to event details when clicking an event card if events exist', () => {
        cy.get('body').then($body => {
            if ($body.find('[data-testid="event-card"]').length > 0) {
                cy.get('[data-testid="event-card"]').first().click()
                cy.url().should('include', '/event-detail/')
            }
        })
    })
})