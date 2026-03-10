describe('Chat Bot', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should open the chat if the chat icon was clicked', () => {
    cy.get('[data-test="chat-widget-content"]').should('not.exist');
    cy.get('[data-test="chat-widget-trigger"]').click();
    cy.get('[data-test="chat-widget-content"]').should('be.visible');
  });

  it('should display the user message on input + enter and display bots response', () => {
    // Arrange
    const message = 'Hello Cypress!';
    cy.intercept("POST", "/api/ai", {
      fixture: "chatbot-response.json"
    }).as("ai-request");

    // Act
    cy.get('[data-test="chat-widget-content"]').should('not.exist');
    cy.get('[data-test="chat-widget-trigger"]').click();
    cy.get('[data-test="chat-widget-content"]').should('be.visible');

    cy.get('[data-test="chat-input"]')
      .should('be.visible')
      .type(`${message}{enter}`);

    // Assert
    cy.wait('@ai-request').its('response.statusCode')
      .should('equal', 200);
    cy.get('[data-test="chat-bubble"]:last-of-type [data-test="chat-bubble-text"]')
      .should(
        'contain.text',
        "Hi! I’m here to help with the Social Media Post Generator. If you need assistance using the app or have questions about creating social-media posts from articles, let me know how I can help!",
      );
  });
});
