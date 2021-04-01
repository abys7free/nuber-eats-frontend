import { render } from '@testing-library/react';
import React from 'react';
import { Restaurant } from '../restaurant';
import { BrowserRouter as Router } from 'react-router-dom';

describe('<FormError /', () => {
  const restaurantProps = {
    id: "1",
    coverImg: "lala",
    name: "name",
    categoryName: "categoryName"
  }
  it('renders OK with props', () => {
    const { debug, getByText, container } = render(
      <Router>
        <Restaurant
          {...restaurantProps} />
      </Router>
    )
    getByText(restaurantProps.name)
    getByText(restaurantProps.categoryName)
    expect(container.firstChild).toHaveAttribute("href", `/restaurants/${restaurantProps.id}`)
  })
})