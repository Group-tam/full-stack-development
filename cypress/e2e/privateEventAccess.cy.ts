describe('Private Event Access', () => {
    beforeEach(() => {
        // Login as user A
        cy.visit('http://localhost:58888/login')
        cy.get('input[name="username"]').type('A') //Trying to access somebody else private event without being invited
        cy.get('input[name="password"]').type('iloveBRAINZ2001!')
        cy.get('button[type="submit"]').click()
    })

    it('shows access denied when visiting uninvited private event directly', () => {
		//The only way to access is via URL (This has to be a valid url to the existing private event)
        cy.visit('http://localhost:58888/event-detail/6825b42b5edc07e38ff03872') 

        // Verify access denied message is shown
        cy.get('.text-2xl')
            .contains('Access Denied')
            .should('be.visible')

        // Verify message
        cy.get('p')
            .contains("You don't have the permission to view this event")
            .should('be.visible')

        // Verify none of the event details are visible
        cy.get('button').contains('Edit Event Details').should('not.exist')
        cy.get('button').contains('Request to join').should('not.exist')
        cy.get('button').contains('Inform Participants').should('not.exist')
    })
})
