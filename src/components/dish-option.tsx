import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import { faCheckSquare as faCheckSquareS } from '@fortawesome/free-solid-svg-icons'
import { faCheckSquare as faCheckSquareR, faSquare } from '@fortawesome/free-regular-svg-icons'


interface IDishOptionProps {
  isSelected: boolean;
  name: string;
  extra?: number | null;
  dishId: number;
  addOptionToItem: (dishId: number, optionName: string) => void;
  removeOptionFromItem: (dishId: number, optionName: string) => void;
}


export const DishOption: React.FC<IDishOptionProps> = ({ isSelected, name, extra, addOptionToItem, removeOptionFromItem, dishId }) => {
  const onClick = () => {
    if (isSelected) {
      removeOptionFromItem(dishId, name);
    } else {
      addOptionToItem(dishId, name)
    }
  }
  return (
    <span
      onClick={onClick}
      className="flex items-center"
    >
      <FontAwesomeIcon 
        icon={isSelected ? faCheckSquareS : faSquare} />
      <h6 className="mx-2">{name}</h6>
      {extra ? (<h6 className="text-sm opacity-75">(${extra})</h6>) : null}
    </span>)
}