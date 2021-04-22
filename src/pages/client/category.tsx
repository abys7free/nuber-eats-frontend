import { gql, useQuery } from "@apollo/client";
import React from "react";
import { useLocation, useParams } from "react-router-dom";
import { Restaurant } from "../../components/restaurant";
import { CATEGORY_FRAGMENT, RESTAURANT_FRAGMENT } from "../../fragments";
import { category, categoryVariables } from "../../__generated__/category";

const CATEGORY_QUERY = gql`
  query category($input: CategoryInput!) {
    category(input: $input) {
      ok
      error
      totalPages
      totalResults
      restaurants {
        ...RestaurantParts
      }
      category {
        ...CategoryParts
      }
    }
  }
  ${RESTAURANT_FRAGMENT}
  ${CATEGORY_FRAGMENT}
`;

interface ICategoryParams {
  slug: string;
}

export const Category = () => {
  const params = useParams<ICategoryParams>();
  const { data, loading } = useQuery<category, categoryVariables>(
    CATEGORY_QUERY,
    {
      variables: {
        input: {
          page: 1,
          slug: params.slug,
        },
      },
    }
  );
  console.log(data);
  return (
    <>
      <h1 className="py-5 pl-5 text-2xl font-medium">{params.slug.toUpperCase()}</h1>
      <div className="grid md:grid-cols-3 gap-x-5 gap-y-10">
        {data?.category.restaurants?.map((restaurant) => (
          <Restaurant
            key={restaurant.id}
            id={restaurant.id + ""}
            coverImg={restaurant.coverImg}
            name={restaurant.name}
            categoryName={restaurant.category?.name}
          />
        ))}
      </div>
    </>
  );
};