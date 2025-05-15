describe('Event Access Tests', () => {
    beforeEach(() => {
        // Login first
        cy.visit('http://localhost:58888/login')
        cy.get('input[name="username"]').type('testuser')
        cy.get('input[name="password"]').type('TestPassword123!')
        cy.get('button[type="submit"]').click()
        cy.url().should('include', '/public-events')
    })

    it('owner can access their public event', () => {
        // Go to owned events
        cy.visit('http://localhost:58888/event-management')
        cy.wait('@ownedEvents')
        
        // Find and click first public owned event
        cy.get('[data-testid="owned-events"]')
            .find('[data-testid="event-card"]')
            .filter(':contains("Public")')
            .first()
            .click()

        // Verify owner access
        cy.get('button:contains("Edit Event Details")').should('be.visible')
        cy.get('button:contains("Inform Participants")').should('be.visible')
    })

    it('owner can access their private event', () => {
        cy.visit('http://localhost:58888/event-management')
        cy.wait('@ownedEvents')
        
        // Find and click first private owned event
        cy.get('[data-testid="owned-events"]')
            .find('[data-testid="event-card"]')
            .filter(':contains("Private")')
            .first()
            .click()

        // Verify owner access
        cy.get('button:contains("Edit Event Details")').should('be.visible')
        cy.get('button:contains("Invite members")').should('be.visible')
    })

    it('user can see but not interact with unjoined public event', () => {
        cy.visit('http://localhost:58888/public-events')
        
        // Click on a public event that user hasn't joined
        cy.get('[data-testid="event-card"]')
            .filter(':not(:contains("Accepted"))')
            .first()
            .click()

        // Verify limited access
        cy.get('button:contains("Request to join")').should('be.visible')
        cy.get('[data-testid="discussion-board"]').should('not.exist')
    })

    it('user cannot access unjoined private event', () => {
        // Try to access a private event directly (should redirect)
        cy.visit('http://localhost:58888/event-detail/privateEventId')
        cy.url().should('include', '/not-found')
    })

    it('user can fully access joined public event', () => {
        cy.visit('http://localhost:58888/event-management')
        cy.wait('@joinedEvents')
        
        // Find and click first joined public event
        cy.get('[data-testid="joined-events"]')
            .find('[data-testid="event-card"]')
            .filter(':contains("Public")')
            .first()
            .click()

        // Verify full access
        cy.get('[data-testid="discussion-board"]').should('exist')
        cy.get('textarea[name="message"]').should('be.visible')
    })

    it('user with invitation can access private event', () => {
        // Go to invitations
        cy.visit('http://localhost:58888/invitations')
        
        // Find and click a pending invitation
        cy.get('[data-testid="invitation-card"]')
            .filter(':contains("Pending")')
            .first()
            .click()

        // Verify invitation response options
        cy.get('button:contains("Accept")').should('be.visible')
        cy.get('button:contains("Decline")').should('be.visible')
    })
})