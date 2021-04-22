import { gql, useMutation, useQuery, useReactiveVar } from "@apollo/client";
import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { useHistory, useParams } from "react-router-dom";
import { Dish } from "../../components/dish";
import { DISH_FRAGMENT, RESTAURANT_FRAGMENT } from "../../fragments";
import {
  restaurant,
  restaurantVariables,
} from "../../__generated__/restaurant";
import { CreateOrderItemInput } from '../../__generated__/globalTypes';
import { CreateOrderInput } from "../../__generated__/globalTypes";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckSquare as faCheckSquareS } from "@fortawesome/free-solid-svg-icons";
import { faCheckSquare as faCheckSquareR } from "@fortawesome/free-regular-svg-icons";
import { DishOption } from "../../components/dish-option";
import { createOrder, createOrderVariables } from '../../__generated__/createOrder';
import { addressVar, orderLatLngVar } from "../../apollo";


const RESTAURANT_QUERY = gql`
  query restaurant($input: RestaurantInput!) {
    restaurant(input: $input) {
      ok
      error
      restaurant {
        ...RestaurantParts
        menu {
          ...DishParts
        }
      }
    }
  }
  ${RESTAURANT_FRAGMENT}
  ${DISH_FRAGMENT}

`;

const CREATE_ORDER_MUTATION = gql`
  mutation createOrder(
    $input: CreateOrderInput!){
      createOrder(input:$input){
        ok
        error
        orderId
      }
    }
`

interface IRestaurantParams {
  id: string;
}

export const Restaurant = () => {
  const params = useParams<IRestaurantParams>();
  const orderAddress = useReactiveVar(addressVar);
  const orderLatLng = useReactiveVar(orderLatLngVar);

  const { data } = useQuery<restaurant, restaurantVariables>(
    RESTAURANT_QUERY,
    {
      variables: {
        input: {
          restaurantId: +params.id,
        },
      },
    }
  );
  const [orderStarted, setOrderStarted] = useState(false)
  const [orderItems, setOrderItems] = useState<CreateOrderItemInput[]>([]);
  const triggerStartOrder = () => {
    setOrderStarted(true)
  }
  const getItem = (dishId: number) => {
    return orderItems.find(order => order.dishId === dishId)
  }
  const isSelected = (dishId: number) => {
    return Boolean(getItem(dishId));
  }
  const addItemToOrder = (dishId: number) => {
    if (isSelected(dishId)) {
      return;
    }
    setOrderItems(current => [{ dishId, options: [] }, ...current])
  }
  const removeFromOrder = (dishId: number) => {
    setOrderItems((current) => current.filter(dish => dish.dishId !== dishId))
  }
  const addOptionToItem = (dishId: number, optionName: string) => {
    if (!isSelected(dishId)) {
      return;
    }
    const oldItem = getItem(dishId)
    if (oldItem) {
      const hasOption = Boolean(
        oldItem.options?.find(aOption => aOption.name === optionName)
      );
      if (!hasOption) {
        removeFromOrder(dishId);
        setOrderItems(current => [
          { dishId, options: [...oldItem.options!, { name: optionName }] },
          ...current
        ]);
      }
    }
  }
  const getOptionFromItem = (item: CreateOrderItemInput, optionName: string) => {
    return item.options?.find(option => option.name === optionName)
  }
  const isOptionSelected = (dishId: number, optionName: string) => {
    const item = getItem(dishId)
    if (item) {
      return Boolean(getOptionFromItem(item, optionName));
    }
    return false;
  }
  const removeOptionFromItem = (dishId: number, optionName: string) => {
    if (!isSelected(dishId)) {
      return;
    }
    const oldItem = getItem(dishId)
    if (oldItem) {
      removeFromOrder(dishId);
      setOrderItems(current => [
        { dishId, options: oldItem.options?.filter(option => option.name !== optionName) },
        ...current
      ]);
      return
    }
  }
  const history = useHistory();
  const onCompleted = (data: createOrder) => {
    const { createOrder: { ok, orderId } } = data;
    if (ok) {
      const { lat, lng } = orderLatLng;
      history.push(`/orders/${orderId}`)
    }
  }
  const [createOrderMutation, { loading: placingOrder }] = useMutation<createOrder, createOrderVariables
  >(CREATE_ORDER_MUTATION, {
    onCompleted
  })
  const triggerCancelOrder = () => {
    setOrderStarted(false);
    setOrderItems([]);
  }
  const triggerConfirmOrder = () => {
    if (placingOrder) {
      return;
    }
    if (orderItems.length === 0) {
      alert("Can't place empty oreder")
      return;
    }
    const ok = window.confirm("You are about to place an order");
    if (ok) {
      console.log('should trigger mutation');
      createOrderMutation({
        variables: {
          input: {
            restaurantId: +params.id,
            items: orderItems,
            orderAddress,
          }
        }
      })
    }

  }
  console.log(orderItems)
  return (
    <div>
      <Helmet>
        <title>{data?.restaurant.restaurant?.name || ""} | Nuber Eats</title>
      </Helmet>
      <div
        className=" bg-gray-800 bg-center bg-cover pt-56 pb-4"
        style={{
          backgroundImage: `url(${data?.restaurant.restaurant?.coverImg})`,
        }}
      >
        <div className="text-white pl-5 hidden md:block items-end">
          <h4 className="text-4xl mb-3">{data?.restaurant.restaurant?.name}</h4>
          <h5 className="text-sm font-light mb-2">
            {data?.restaurant.restaurant?.category?.name}
          </h5>
          <h6 className="text-sm font-light">
            {data?.restaurant.restaurant?.address}
          </h6>
        </div>
      </div>

      <div className="text-black mt-4 pl-5 md:hidden">
        <h4 className="text-2xl mb-3">{data?.restaurant.restaurant?.name}</h4>
        <h5 className="text-sm font-light mb-2">
          {data?.restaurant.restaurant?.category?.name}
        </h5>
        <h6 className="text-sm font-light">
          {data?.restaurant.restaurant?.address}
        </h6>
      </div>

      <div className="container pb-32 flex flex-col items-end mt-5">
        {!orderStarted && (
          <button onClick={triggerStartOrder} className="btn py-2 px-3 md:px-10 roun">
            {orderStarted ? "Ordering" : "Start Order"}
          </button>
        )}
        {orderStarted && (
          <div className="flex items-center">
            <button onClick={triggerConfirmOrder} className="btn py-2 w-24 mr-1">
              Confirm
          </button>
            <button onClick={triggerCancelOrder} className="btn py-2 w-24 bg-black hover:bg-black">
              Reset
          </button>
          </div>
        )}
        <div className="grid mt-8 md:mt-16 md:grid-cols-2 gap-x-5 gap-y-10 w-full lg:grid-cols-3">
          {data?.restaurant.restaurant?.menu.map((dish, index) => (
            <Dish
              isSelected={isSelected(dish.id)}
              id={dish.id}
              orderStarted={orderStarted}
              key={index}
              name={dish.name}
              description={dish.description}
              price={dish.price}
              photo={dish.photo}
              isCustomer={true}
              options={dish.options}
              addItemToOrder={addItemToOrder}
              removeFromOrder={removeFromOrder}
            >
              {dish.options?.map((option, index) => (
                <DishOption
                  key={index}
                  dishId={dish.id}
                  isSelected={isOptionSelected(dish.id, option.name)}
                  name={option.name}
                  extra={option.extra}
                  addOptionToItem={addOptionToItem}
                  removeOptionFromItem={removeOptionFromItem}
                />
              ))}

            </Dish>
          ))}

        </div>
      </div>
    </div>
  );
};