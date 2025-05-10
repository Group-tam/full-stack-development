/// <reference types="cypress" />

describe('Registration Page', () => {
	beforeEach(() => {
		// Visit the registration page before each test
		cy.visit('localhost:58888/register');
	});

	it('renders registration form with all fields', () => {
		// Check if all form elements are rendered
		cy.get('input[name="username"]').should('be.visible');
		cy.get('input[name="email"]').should('be.visible');
		cy.get('input[name="password"]').should('be.visible');
		cy.get('input[name="confirmPassword"]').should('be.visible');
		cy.get('input[type="checkbox"]').should('be.visible');
		cy.get('button[type="submit"]').should('be.visible');
	});

	it('registers successfully with valid data', () => {
		// Fill the form with valid data
		cy.get('input[name="username"]').type('newuser');
		cy.get('input[name="email"]').type('newuser@example.com');
		cy.get('input[name="password"]').type('Password123!');
		cy.get('input[name="confirmPassword"]').type('Password123!');
		cy.get('input[type="checkbox"]').check(); // Agree to terms

		// Submit the form
		cy.get('button[type="submit"]').click();

		// Check if the user was redirected to the login page or another page after successful registration
		cy.url().should('include', 'http://localhost:58888/login');
	});

	it('shows error for missing username', () => {
		// Fill in only the email and password fields
		cy.get('input[name="email"]').type('newuser@example.com');
		cy.get('input[name="password"]').type('Password123!');
		cy.get('input[name="confirmPassword"]').type('Password123!');
		cy.get('input[type="checkbox"]').check();

		// Submit the form
		cy.get('button[type="submit"]').click();

		// Check if the error message is displayed
		cy.get('.text-red-700').should('contain', 'Username is required');
	});

	it('disables submit button if terms not accepted', () => {
		// Fill the form but don't check the terms checkbox
		cy.get('input[name="username"]').type('newuser');
		cy.get('input[name="email"]').type('newuser@example.com');
		cy.get('input[name="password"]').type('Password123!');
		cy.get('input[name="confirmPassword"]').type('Password123!');

		// Check if the submit button is disabled
		cy.get('button[type="submit"]').should('be.disabled');
	});

	it('disables submit button if password is invalid', () => {
		// Fill the form with invalid password (too short)
		cy.get('input[name="username"]').type('newuser');
		cy.get('input[name="email"]').type('newuser@example.com');
		cy.get('input[name="password"]').type('short');
		cy.get('input[name="confirmPassword"]').type('short');
		cy.get('input[type="checkbox"]').check();

		// Check if the submit button is disabled
		cy.get('button[type="submit"]').should('be.disabled');
	});
});
