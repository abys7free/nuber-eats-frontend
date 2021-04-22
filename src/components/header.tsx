/*global google*/
import { faMapMarked, faMapMarkedAlt, faMapMarkerAlt, faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';
import { useMe } from '../hooks/useMe'
import nuberLogo from "../images/logo.svg"
import DaumPostcode from 'react-daum-postcode'
import { useReactiveVar } from '@apollo/client';
import { addressDetailVar, addressVar, orderLatLngVar } from '../apollo';
import GoogleMapReact from 'google-map-react';
import { UserRole } from '../__generated__/globalTypes';

export const Header: React.FC = () => {
  const { data: myData } = useMe();
  const [daumPost, setDaumPost] = useState(false);
  const orderAddress = useReactiveVar(addressVar);
  const orderAddressDetail = useReactiveVar(addressDetailVar);

  const [addAddressDetail, setaddAddressDetail] = useState(false);

  const handleComplete = (data: any) => {
    let fullAddress = data.address;
    let extraAddress = '';

    if (data.addressType === 'R') {
      if (data.bname !== '') {
        extraAddress += data.bname;
      }
      if (data.buildingName !== '') {
        extraAddress += (extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName);
      }
      fullAddress += (extraAddress !== '' ? ` (${extraAddress})` : '');
    }
    localStorage.setItem("user-address", fullAddress);
    addressVar(fullAddress);
    setDaumPost(false);

    // orderAddressDetail = "";
    // console.log(fullAddress);  // e.g. '서울 성동구 왕십리로2길 20 (성수동1가)'
    // setLocationOpened(!locationOpened);
  }
  const callPostSetting = () => {
    if (daumPost || addAddressDetail) {
      setDaumPost(false);
      setaddAddressDetail(false);
    } else {
      setDaumPost(true);
      setaddAddressDetail(true);
    }
  }

  const [inputValue, setInputValue] = useState("");
  const onSettingClick = () => {
    console.log(inputValue);
    localStorage.setItem("user-addressDetail", inputValue);
    addressDetailVar(inputValue);
    callPostSetting();
  }
  const onChange = (e: any) => {
    setInputValue(e.target.value);
  }

  return (<>
    <div className="fixed top-0 left-0 right-0">
      {!myData?.me.verified && <div className="bg-red-500 py-3 px-3 text-center text-base text-white"><span>Please verify your email.</span></div>}
      <header className='flex w-full flex-col items-center bg-white py-2'>
        <div className="w-full py-3 px-5 xl:relative max-w-screen-2xl mx-auto flex items-center bg-white">
          <Link to='/' className="mr-auto">
            <img src={nuberLogo} alt="Nuber-Eats" className='w-32' />
          </Link>
          {myData?.me.role === UserRole.Client && (<span
            className="ml-auto text-xl pb-1 mr-4 cursor-pointer lg:absolute lg:left-1/2 "
            onClick={() => callPostSetting()}
          >
            <FontAwesomeIcon icon={faMapMarkerAlt} />
          </span>)}

          <Link to="/edit-profile" className="">
            <span className='text-xs'><FontAwesomeIcon icon={faUser} className="text-xl" /></span>
          </Link>
        </div>
      </header>
      <div className="bg-gray-800 bg-opacity-40 w-full flex flex-col items-center">
        <div className="w-full max-w-screen-xl mx-auto" >
          {orderAddress && addAddressDetail && (
            <div className="ml-auto p-2 w-full max-w-lg bg-gray-100 lg:mx-auto">
              <div className='p-3 bg-white border border-gray-200 text-black text-md'>
                <h4>
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" />{orderAddress}
                </h4>
                <div className="flex items-center pt-2 pl-5">
                  <div className="text-xs px-1 text-blue-500 border border-gray-200">상 세</div>
                  <input id="input-detail" type="text" defaultValue={orderAddressDetail} value={inputValue} onChange={onChange} className="ml-2 border pb-1 w-7/12 border-gray-200" />
                  <button onClick={onSettingClick} className="bg-gray-800 hover:bg-gray-700 ml-1 p-1 text-white">설정</button>
                </div>
              </div>
            </div>
          )}
          <div
            className={`ml-auto w-full min-h-full max-w-lg lg:mx-auto border border-gray-400 ${!daumPost ? "hidden" : "block"}`}
          >
            <DaumPostcode
              onComplete={handleComplete}
            />
          </div>
        </div>
      </div>
    </div>
    <GoogleMapReact
      bootstrapURLKeys={{ key: "AIzaSyBMMLxClVwhMZfaV-NPLmDV0le8rO3up28" }}
    ></GoogleMapReact>
  </>
  )
}
