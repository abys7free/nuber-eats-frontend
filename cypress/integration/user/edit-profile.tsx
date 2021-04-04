describe('edit Profile', () => {
  const user = cy;

  beforeEach(() => {
    // @ts-ignore
    user.login('abys7free@gmail.com', '12345');
  })
  it('can go to /edit-profile using the header', () => {
    user.get('a[href="/edit-profile"]').click();
    user.title()
    .should("eq", "Edit Profile | Nuber Eats");
  });
  it('can change email', () => {
    user.intercept('POST', 'http://localhost:4000/graphql', (req) => {
      if(req.body?.operationName === 'editProfile'){
        // @ts-ignore
        req.body?.variables?.input?.email = "abys7free@gmail.com"
      }
    })
    user.visit('/edit-profile');

    // @ts-ignore
    user.findByPlaceholderText(/email/i).clear().type('abys7free@gmail.com');
    user.findByRole('button').click()
  })
})