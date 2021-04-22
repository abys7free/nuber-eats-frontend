import React, { useEffect, useState } from 'react';
import GoogleMapReact from 'google-map-react';
import { gql, useMutation, useSubscription } from '@apollo/client';
import { FULL_ORDER_FRAGMENT } from '../../fragments';
import { cookedOrders } from '../../__generated__/cookedOrders';
import { useHistory } from 'react-router-dom';
import { takeOrder, takeOrderVariables } from '../../__generated__/takeOrder';
import { orderLatLngVar } from '../../apollo';
import { replace } from 'cypress/types/lodash';

const COOKED_ORDERS_SUBSCRIPTION = gql`
  subscription cookedOrders {
    cookedOrders {
      ...FullOrderParts
    }
  }
  ${FULL_ORDER_FRAGMENT}
`
const TAKE_ORDER_MUTATION = gql`
  mutation takeOrder($input: TakeOrderInput!){
    takeOrder(input:$input){
      ok
      error
    }
  }
`

interface ICoords {
  lat: number;
  lng: number;
}

// interface IDriverProps {
//   lat: number;
//   lng: number;
//   $hover?: any;
// }

// const Driver: React.FC<IDriverProps> = (lat, lng) => <div className="text-lg">🚖</div>;

export const Dashboard = () => {
  const [driverCoords, setDriverCoords] = useState<ICoords>({ lng: 0, lat: 0 })
  const [map, setMap] = useState<google.maps.Map>()
  const [maps, setMaps] = useState<any>()
  // @ts-ignore
  const onSuccess = ({ coords: { latitude, longitude } }: Position) => {
    setDriverCoords({ lat: 34.053477, lng: -118.242893 })
    console.log("watch loaded")
  }
  // @ts-ignore
  const onError = (error: PositionError) => {
    console.log(error)
  }

  useEffect(() => {
    navigator.geolocation.watchPosition(onSuccess, onError, {
      enableHighAccuracy: true,
    })
    console.log('watch')
  }, [])
  useEffect(() => {
    if (map && maps) {
      map.panTo(new google.maps.LatLng(driverCoords.lat, driverCoords.lng));
      console.log("driver:", driverCoords)
    }
  }, [driverCoords.lat, driverCoords.lng])
  const onApiLoaded = ({ map, maps }: { map: any, maps: any }) => {
    map.panTo(new google.maps.LatLng(driverCoords.lat, driverCoords.lng))
    setMap(map);
    setMaps(maps);
  };

  const makeRoute = (startPlace: google.maps.Place, orderPlace: google.maps.Place, restaurantLatLng: google.maps.Place) => {
    if (map) {
      const directionsService = new google.maps.DirectionsService();
      const directionsRenderer = new google.maps.DirectionsRenderer({
        draggable: true,
        // polylineOptions: {
        //   strokeColor: '#000',
        //   strokeOpacity: 0.8,
        //   strokeWeight: 3,
        // },
      });
      directionsRenderer.setMap(map);
      if (startPlace && orderPlace && restaurantPlace) {
        console.log("route start")
        directionsService.route(
          {
            origin: { placeId: startPlace.placeId },
            destination: { placeId: orderPlace.placeId },
            travelMode: google.maps.TravelMode.BICYCLING,
            waypoints: [{
              location: {
                placeId: restaurantPlace?.placeId
              }
            }]
          }, (result) => {
            console.log(result)
            directionsRenderer.setDirections(result);
          },
        )
      }
    }
  }
  const { data: cookedOrdersData } = useSubscription<cookedOrders>(
    COOKED_ORDERS_SUBSCRIPTION
  );
  const [orderPlace, setOrderPlace] = useState<google.maps.Place>();
  const [restaurantPlace, setRestaurantPlace] = useState<google.maps.Place>();
  const [startPlace, setStartPlace] = useState<google.maps.Place>();

  useEffect(() => {
    console.log('getOrder Start')
    console.log('getOrder cookedOrder', cookedOrdersData?.cookedOrders);

    if (cookedOrdersData?.cookedOrders.id) {
      const { orderAddress, restaurant } = cookedOrdersData?.cookedOrders
      if (orderAddress && restaurant?.address) {
        const geocoder = new google.maps.Geocoder();
        if (orderAddress && restaurant.address) {
          geocoder.geocode(
            {
              address: orderAddress,
            },
            (results, status) => {
              console.log(status)
              console.log(results)
              setOrderPlace({
                location: results[0].geometry.location,
                placeId: results[0].place_id
              })
            }
          );
          geocoder.geocode(
            {
              address: restaurant.address,
            },
            (results, status) => {
              console.log(status)
              console.log(results)
              setRestaurantPlace({
                location: results[0].geometry.location,
                placeId: results[0].place_id
              })
            }
          );

          geocoder.geocode(
            {
              location: {
                lat: driverCoords.lat,
                lng: driverCoords.lng,
              }
            },
            (results, status) => {
              console.log(status)
              console.log(results)
              setStartPlace(results &&
              {
                location: results[0].geometry.location,
                placeId: results[0].place_id
              }
              )
            }
          );
        }
      }
      console.log(orderAddress, startPlace, orderPlace, "geocode");
    }
  }, [cookedOrdersData])

  useEffect(() => {
    console.log("orderPlace: ", startPlace, orderPlace)
    if (startPlace && orderPlace && restaurantPlace) {
      makeRoute(startPlace, orderPlace, restaurantPlace)
    }
  }, [orderPlace, startPlace, restaurantPlace])

  const history = useHistory();
  const [orderAccept, setOrderAccept] = useState(false);
  const onCompleted = (data: takeOrder) => {
    if (data.takeOrder.ok) {
      setOrderAccept(true);
      // history.push(`/orders/${cookedOrdersData?.cookedOrders.id}`)
    }
  }
  const [takeOrderMuation] = useMutation<takeOrder, takeOrderVariables>(TAKE_ORDER_MUTATION,
    {
      onCompleted
    }
  )
  const triggerMutation = (orderId: number) => {
    takeOrderMuation({
      variables: {
        input: {
          id: orderId,
        }
      }
    })
  }
  return (
    <div>
      <div
        className=" overflow-hidden"
        style={{ width: window.innerWidth, height: '50vh' }}>
        <GoogleMapReact
          yesIWantToUseGoogleMapApiInternals
          onGoogleApiLoaded={onApiLoaded}
          defaultZoom={15}
          defaultCenter={
            {
              lat: 34.053477,
              lng: -118.242893,
            }
          }
          bootstrapURLKeys={{ key: "AIzaSyBMMLxClVwhMZfaV-NPLmDV0le8rO3up28" }}
        >
          {/* <Driver lat={driverCoords.lat} lng={driverCoords.lng} /> */}
        </GoogleMapReact>
      </div>
      <div className="max-w-screen-sm mx-auto bg-white relative -top-10 shadow-lg py-8 px-5">
        {cookedOrdersData?.cookedOrders.restaurant ? (
          <>
            <h1 className="text-center text-3xl font-medium">New Cooked Order</h1>
            <h4 className="text-center my-3 text-2xl font-medium">Pick it up Soon! @ {cookedOrdersData.cookedOrders.restaurant?.name}</h4>
            <button onClick={() => triggerMutation(cookedOrdersData.cookedOrders.id)} className="btn w-full block text-center mt-5">Accept Challenge &rarr;</button>
          </>
        ) : (
          <h1 className="text-center text-3xl font-medium">
            No Orders yet...
          </h1>
        )}
      </div>
    </div>
  )
}