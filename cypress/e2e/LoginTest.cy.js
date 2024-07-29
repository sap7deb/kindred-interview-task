describe('Validate Login', () => {

  let userCredentials;

  before('Setting up the User credentials for the tests',()=>{
    cy.fixture('user').then((usercreds)=>{
      userCredentials=usercreds;
    })
  })

  it('Should sucessfully login with valid email and password', () => {
    cy.visit('/login');
    cy.get('input[type=email').type(userCredentials.email);
    cy.get('input[type=password]').type(userCredentials.password);
    cy.get('button[type="submit"]').click();
    cy.wait(5000);
    cy.url().should('equal', Cypress.config('baseUrl'), { timeout: 5000 });

  })

  it('Should show an error message for invalid email format', () => {
    cy.visit('/login');
    cy.get('input[type="email"]').type(userCredentials.invalidemail);
    cy.get('button[type="submit"]').click();
    cy.get('input[type="email"]')
      .then(($input) => {
        const validityState = $input[0].validity;
        expect(validityState.valid).to.be.false;
        expect(validityState.typeMismatch).to.be.true;
        const validationMessage = $input[0].validationMessage;
        expect(validationMessage).to.contain('Please include an \'@\' in the email address');
      });
  });

  it('Should show an error message for incorrect password', () => {
    cy.visit('/login');
    cy.get('input[type="email"]').type(userCredentials.email);
    cy.get('input[type="password"]').type(userCredentials.wrongpsw);
    cy.get('button[type="submit"]').click();
    cy.contains('email or password is invalid').should('be.visible');
  });

  it('Should not allow SQL injection in the password field', () => {
    cy.visit('/login');
    cy.get('input[type="email"]').type(userCredentials.email);
    cy.get('input[type="password"]').type(userCredentials.sqlinjection);
    cy.get('button[type="submit"]').click();
    cy.contains('email or password is invalid').should('be.visible');
    cy.url().should('include', '/login');
  });

  it('Should mock login API call and return 401 status', () => {
    cy.visit('/login');

    cy.intercept('POST', '**/api/users/login', {
      statusCode: 401,
      body: { error: 'Unauthorized' }
    }).as('loginRequest');

    cy.get('input[type="email"]').type(userCredentials.email);
    cy.get('input[type="password"]').type(userCredentials.password);

    cy.get('button[type="submit"]').click();
    cy.wait('@loginRequest').its('response.statusCode').should('eq', 401);

  });
})