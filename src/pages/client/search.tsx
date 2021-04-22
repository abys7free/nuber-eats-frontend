import { gql, useLazyQuery } from '@apollo/client';
import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useHistory, useLocation } from 'react-router';
import { RESTAURANT_FRAGMENT, CATEGORY_FRAGMENT } from '../../fragments';
import { searchRestaurant, searchRestaurantVariables } from '../../__generated__/searchRestaurant';
import { Restaurant } from "../../components/restaurant";


const SEARCH_RESTAURANT = gql`
  query searchRestaurant(
    $input: SearchRestaurantInput!
  ) {
    searchRestaurant(input: $input) {
      ok
      error
      totalPages
      totalResults
      restaurants {
        ...RestaurantParts
      }
    }
  }
  ${RESTAURANT_FRAGMENT}
`


export const Search = () => {
  const location = useLocation();
  const history = useHistory();
  const [callQuery, { loading, data, called }] = useLazyQuery<searchRestaurant, searchRestaurantVariables>(SEARCH_RESTAURANT)
  useEffect(() => {
    console.log(location);
    const [_, query] = location.search.split("?term=");
    if (!query) {
      return history.replace('/');
    }
    callQuery({
      variables: {
        input: {
          page: 1,
          query
        },
      },
    })
  }, [history, location])
  console.log(loading, data, called);
  return (
    <div>
      <Helmet>
        <title>Home | Nuber</title>
      </Helmet>
      <h1 className="py-5 pl-5 text-2xl font-medium">Search Result</h1>
      <div className="grid md:grid-cols-3 gap-x-5 gap-y-10">
        {data?.searchRestaurant.restaurants?.map((restaurant) => (
          <Restaurant
            key={restaurant.id}
            id={restaurant.id + ""}
            coverImg={restaurant.coverImg}
            name={restaurant.name}
            categoryName={restaurant.category?.name}
          />
        ))}
      </div>
    </div>
  )
}