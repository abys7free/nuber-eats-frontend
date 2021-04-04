describe("Log In", () => {
  const user = cy;
  it("should see login page", () => {
    user.visit('/').title()
      .should("eq", "Login | Nuber Eats");
  });
  it('can see email / password validation errors', () => {
    user.visit('/')
    user.findByPlaceholderText(/email/i).type("bad@gmail");
    user.findByRole('alert').should('have.text', "Please enter a valid email")
    user.findByPlaceholderText(/email/i).clear()
    user.findByRole('alert').should('have.text', "Email is required")
    user.findByPlaceholderText(/email/i).type("bad@gmail.com");
    user.findByPlaceholderText(/password/i).type("a")
    user.findByPlaceholderText(/password/i).clear()
    user.findByRole('alert').should('have.text', "Password is required")
  })
  it('can fill out the form and log in', () => {
    // @ts-ignore
    user.login("abys7free@gmail.com", '12345')
  })
});
