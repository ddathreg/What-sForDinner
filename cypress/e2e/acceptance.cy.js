describe('Home Page Tests', () => {
  beforeEach(() => {
    cy.visit('https://ambitious-tree-0c41c301e.6.azurestaticapps.net/');
  });

  it('displays the home page and spins the wheel', () => {
    cy.wait(5000);
    cy.contains('Spin the Wheel').should('exist');
    
    cy.get('button.spin-button').click();

    cy.wait(4000);
    cy.get('.result-text').should('exist').and('contain', 'Selected Restaurant');
  });
});

describe('API - GET /restaurants/:city', () => {
  it('returns a list of restaurants for slo', () => {
    cy.request({
      method: 'GET',
      url: 'https://whatsfordinner-cwdyeqbfaabyhgbr.westus-01.azurewebsites.net/restaurants/slo',
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('array');
      expect(response.body.length).to.be.greaterThan(0);
      expect(response.body[0]).to.have.property('name');
    });
  });
});



describe("Login API", () => {
  beforeEach(() => {
    cy.intercept('POST', 'https://whatsfordinner-cwdyeqbfaabyhgbr.westus-01.azurewebsites.net/users/login', (req) => {
      req.reply({
        statusCode: 200,
        body: "fake-token",
      });
    }).as('loginRequest');
  });

  it('should make a POST request to login', () => {
    const username = 'testuser3';
    const password = 'Password123!';

    cy.request({
      method: 'POST',
      url: 'https://whatsfordinner-cwdyeqbfaabyhgbr.westus-01.azurewebsites.net/users/login',
      body: {
        username: username,
        passwd: password,
      },
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((response) => {
      expect(response.status).to.eq(200);
    });
  });
});




