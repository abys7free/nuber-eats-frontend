import React from 'react'
import { restaurant_restaurant_restaurant_menu_options } from '../__generated__/restaurant';

interface IDishProps {
  id?: number,
  description: string;
  name: string;
  price: number;
  photo?: string | null;
  isCustomer?: boolean;
  orderStarted?: boolean;
  options?: restaurant_restaurant_restaurant_menu_options[] | null
  addItemToOrder?: (dishId: number) => void;
  removeFromOrder?: (dishId: number) => void;
  isSelected?: boolean;
}

export const Dish: React.FC<IDishProps> = ({
  id = 0,
  description,
  name,
  price,
  photo,
  isCustomer = false,
  orderStarted = false,
  options,
  isSelected,
  addItemToOrder,
  removeFromOrder,
  children: dishOptions,
}) => {
  const onClick = () => {
    if (orderStarted) {
      if (!isSelected && addItemToOrder) {
        addItemToOrder(id);
      }
      if (isSelected && removeFromOrder) {
        return removeFromOrder(id);
      }
    }
  }
  return (
    <div
      className={`border cursor-pointer hover:border-gray-600 transition-all ${isSelected ? "bg-yellow-100" : ""}`}
      onClick={onClick}
      >
      <div className="flex justify-around h-full">
        <div className="w-3/5 p-3 flex flex-col justify-around">
          <div>
            <h3 className="text-lg font-medium">{name}</h3>
            <h4 className="font-medium">{description}</h4>
          </div>
          <div className="mt-3">
            <span>${price}</span>
            {isCustomer && options && options.length !== 0 && (
              <div>
                <h5 className="mt-5 mb-3 font-medium">Dish Options:</h5>
                {dishOptions}
              </div>
            )}
          </div>
        </div>
        <div
          className="w-2/5 bg-center bg-cover"
          style={{
            backgroundImage: `url(${photo})`,
          }}
        />
      </div>
    </div>
  );
};