import { gql, useQuery, useSubscription } from '@apollo/client'
import React, { useEffect } from 'react'
import { useHistory, useParams } from 'react-router'
import { Link } from 'react-router-dom'
import { Dish } from '../../components/dish'
import { DISH_FRAGMENT, FULL_ORDER_FRAGMENT, ORDERS_FRAGMENT, RESTAURANT_FRAGMENT } from '../../fragments'
import { myRestaurant, myRestaurantVariables } from '../../__generated__/myRestaurant'
import { VictoryTheme, VictoryChart, VictoryAxis, VictoryLabel, VictoryVoronoiContainer, VictoryLine, VictoryTooltip } from 'victory'
import { pendingOrders } from '../../__generated__/pendingOrders'
import { DishOption } from '../../components/dish-option'
import { Helmet } from 'react-helmet-async'

export const MY_RESTAURANT_QUERY = gql`
  query myRestaurant($input: MyRestaurantInput!){
    myRestaurant(input:$input){
      ok
      error
      restaurant {
        ...RestaurantParts
        menu {
          ...DishParts
        }
        orders {
          ...OrderParts
        }
      }
    }
  }
  ${RESTAURANT_FRAGMENT}
  ${DISH_FRAGMENT}
  ${ORDERS_FRAGMENT}
`

interface IParams {
  id: string;
}

const PENDING_ORDERS_SUBSCRIPTION = gql`
  subscription pendingOrders{
    pendingOrders {
      ...FullOrderParts
    }
  }
  ${FULL_ORDER_FRAGMENT}
`

export const MyRestaurant = () => {
  const { id } = useParams<IParams>();
  const { data } = useQuery<myRestaurant, myRestaurantVariables>(
    MY_RESTAURANT_QUERY,
    {
      variables: {
        input: {
          id: +id,
        }
      }
    }
  );
  const { data: subscriptionData } = useSubscription<pendingOrders>(
    PENDING_ORDERS_SUBSCRIPTION
  );
  const history = useHistory()
  useEffect(() => {
    if (subscriptionData?.pendingOrders.id) {
      history.push(`/orders/${subscriptionData.pendingOrders.id}`)
    }
  }, [subscriptionData])
  return (
    <div>
      <Helmet>
        <title>My Restaurant | Nuber Eats</title>
      </Helmet>
      <div
        className=" bg-gray-800 bg-center bg-cover pt-56 pb-4"
        style={{
          backgroundImage: `url(${data?.myRestaurant.restaurant?.coverImg})`,
        }}
      >
        <div className="text-white pl-5 hidden md:block items-end">
          <h4 className="text-4xl mb-3">{data?.myRestaurant.restaurant?.name}</h4>
          <h5 className="text-sm font-light mb-2">
            {data?.myRestaurant.restaurant?.category?.name}
          </h5>
          <h6 className="text-sm font-light">
            {data?.myRestaurant.restaurant?.address}
          </h6>
        </div>
      </div>

      <div className="text-black mt-4 pl-5 md:hidden">
        <h4 className="text-2xl mb-3">{data?.myRestaurant.restaurant?.name}</h4>
        <h5 className="text-sm font-light mb-2">
          {data?.myRestaurant.restaurant?.category?.name}
        </h5>
        <h6 className="text-sm font-light">
          {data?.myRestaurant.restaurant?.address}
        </h6>
      </div>

      <div className="container pb-32 flex flex-col items-end mt-5">
        <div className='mt-5 mb-2'>
          <Link to={`/restaurants/add-dish`} className=" mr-3 text-white bg-gray-800 py-3 inline-block w-40 text-center">
            Add Dish &rarr;
                </Link>
          <Link to={``} className=" text-white bg-lime-700 py-3 inline-block w-40 text-center">
            Buy Promotion &rarr;
                </Link>
        </div>
        <div className="grid mt-8 md:mt-16 md:grid-cols-2 gap-x-5 gap-y-10 w-full lg:grid-cols-3">
          {data?.myRestaurant.restaurant?.menu.map((dish, index) => (
            <Dish
              id={dish.id}
              key={index}
              name={dish.name}
              description={dish.description}
              price={dish.price}
              photo={dish.photo}
              isCustomer={true}
              options={dish.options}
            >
            </Dish>
          ))}

        </div>
        {/* <div className="mt-20 mb-10">
          <h4 className="text-center text-2xl font-medium">Sales</h4>
          <div className="  mt-10">
            <VictoryChart
              height={500}
              theme={VictoryTheme.material}
              width={window.innerWidth}
              domainPadding={50}
              containerComponent={<VictoryVoronoiContainer />}
            >
              <VictoryLine
                labels={({ datum }) => `$${datum.y}`}
                labelComponent={
                  <VictoryTooltip
                    style={{ fontSize: 18 } as any}
                    renderInPortal
                    dy={-20}
                  />
                }
                data={data?.myRestaurant.restaurant?.orders.map((order) => ({
                  x: order.createdAt,
                  y: order.total,
                }))}
                interpolation="natural"
                style={{
                  data: {
                    strokeWidth: 5,
                  },
                }}
              />
              <VictoryAxis
                tickLabelComponent={<VictoryLabel renderInPortal />}
                style={{
                  tickLabels: {
                    fontSize: 20,
                  } as any,
                }}
                tickFormat={(tick) => new Date(tick).toLocaleDateString("ko")}
              />
            </VictoryChart>

          </div>
        </div> */}
      </div>
    </div>
  );
}