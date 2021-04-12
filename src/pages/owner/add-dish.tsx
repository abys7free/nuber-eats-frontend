import { gql, useMutation } from '@apollo/client';
import { faRegistered } from '@fortawesome/free-solid-svg-icons';
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useForm } from 'react-hook-form';
import { useHistory, useParams } from 'react-router';
import { setConstantValue } from 'typescript';
import { Button } from '../../components/button';
import { createDish, createDishVariables } from '../../__generated__/createDish';
import { MY_RESTAURANT_QUERY } from './my-restaurant';

const CREATE_DISH_MUTATION = gql`
  mutation createDish($input: CreateDishInput!) {
    createDish(input: $input){
      ok
      error
    }
  }
`


interface IParams {
  restaurantId: string;
}

interface Iform {
  name: string;
  price: string;
  description: string;
  [key: string]: string;
}


export const AddDish = () => {
  const { restaurantId } = useParams<IParams>();
  const history = useHistory();
  const [createDishMutation, { loading }] = useMutation<createDish, createDishVariables
  >(CREATE_DISH_MUTATION, {
    refetchQueries: [
      {
        query: MY_RESTAURANT_QUERY,
        variables: {
          input: {
            id: +restaurantId
          },
        },
      },
    ],
  });
  const { handleSubmit, register, formState, getValues, setValue } = useForm<Iform>({
    mode: 'onChange'
  });
  const onSubmit = () => {
    const { name, price, description, ...rest } = getValues();
    const optionObjects = optionsNumber.map(theId => ({ name: rest[`${theId}-OptionName`], extra: +rest[`${theId}-OptionExtra`] }))
    console.log(optionObjects);
    createDishMutation({
      variables: {
        input: {
          name,
          price: +price,
          description,
          restaurantId: +restaurantId,
          options: optionObjects
        },
      },
    });
    history.goBack();
  };
  const [optionsNumber, setOptionsNumber] = useState<number[]>([]);
  const onAddOptionClick = () => {
    setOptionsNumber(current => current.length !== 0 ? [Date.now(), ...current] : [Date.now()]);
  }
  const onDeleteClick = (idToDelete: number) => {
    setOptionsNumber(current => current.filter(id => id !== idToDelete));
    setValue(`${idToDelete}-optionName`, "")
    setValue(`${idToDelete}-optionExtra`, "")
  }
  return (
    <div className="container flex flex-col items-center mt-52">
      <Helmet>
        <title>Add Dish | Nuber Eats</title>
      </Helmet>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid max-w-screen-sm gap-3 mt-5 w-full mb-5"
      >
        <input
          className="input"
          type="text"
          name="name"
          placeholder="Name"
          ref={register({ required: "Name is required" })}
        />
        <input
          className="input"
          type="number"
          name="price"
          min={0}
          placeholder="Price"
          ref={register({ required: "Price is required" })}
        />
        <input
          className="input"
          type="text"
          name="description"
          placeholder="Description"
          ref={register({ required: "Description is required" })}
        />
        <div className="my-10">
          <h4 className="font-medium mb-3 text-lg">Dish Options</h4>
          <span
            onClick={onAddOptionClick}
            className="cursor-pointer text-white bg-gray-900 py-1 px-2 mt-5"
          >Add Dish Option</span>
          {optionsNumber.length !== 0 && (
            optionsNumber.map((id) => (
              <div key={id} className="mt-5" >
                <input ref={register} name={`${id}-OptionName`} className="py-2 px-4 focus:outline-none focus:border-gray-600 border-2" type="text" placeholder="Option Name" />
                <input ref={register} name={`${id}-OptionExtra`} className="py-2 px-4 focus:outline-none focus:border-gray-600 border-2" type="number" min={0} placeholder="Option Extra" />
                <span className="cursor-pointer text-white bg-red-500 ml-3 py-2 border-red-500 border-2 px-4 mt-5 bg" onClick={() => onDeleteClick(id)}>Delete</span>
              </div>
            ))
          )}
        </div>
        <Button
          loading={loading}
          canClick={formState.isValid}
          actionText="Create Dish"
        />
      </form>
    </div >
  );
};

