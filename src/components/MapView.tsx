/* eslint import/no-webpack-loader-syntax: off */

//@ts-ignore
import { Map } from '!mapbox-gl';
import { useContext, useRef, useLayoutEffect } from 'react';
import { MapContext, PlacesContext } from "../context"
import { Loading } from "./"


export const MapView = () => {

  const { isLoading, userLocation } = useContext( PlacesContext );
  const { setMap } = useContext( MapContext );
  const mapDiv = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => { // useEffect se invoca después de pintar el DOM. useLayoutEffect se invoca sincrónicamente antes de que los cambios se pinten en la pantalla. 
   if( !isLoading ) {     // De esta forma damos tiempo para que se cargue el map  
       const map = new Map({                                          // Este mapa es el que se envía a nuestro contexto
           container: mapDiv.current!,                                // container ID
           style: 'mapbox://styles/mapbox/streets-v11',               // style URL
           center: userLocation,                                      // starting position [lng, lat]
           zoom: 9,                                                   // starting zoom
       });
      setMap( map )
   }
  }, [isLoading, userLocation])

  if ( isLoading ) {
    return( <Loading /> )
  }

  return (
    <div ref={ mapDiv }
         style={{
            height: '100vh',
            width: '100vw',
            position: 'fixed',
            top: 0,
            left:0
         }}
    >
        { userLocation?.join(',') }
    </div>
  )
}
