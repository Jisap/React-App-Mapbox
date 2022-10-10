/* eslint import/no-webpack-loader-syntax: off */

import { useContext, useEffect, useReducer } from 'react';
//@ts-ignore
import { AnySourceData, LngLatBounds, Map, Marker, Popup } from '!mapbox-gl';
import { MapContext } from './MapContext';
import { mapReducer } from './mapReducer';
import { PlacesContext } from '../places/PlacesContext';
import { directionsApi } from '../../apis';
import { DirectionsResponse } from '../../interfaces/directions';


export interface MapState {
    isMapReady: boolean;
    map?: Map;
    markers?: Marker[];
}

const INITIAL_STATE:MapState = {
    isMapReady: false,
    map: undefined,
    markers: [],
}

interface Props {
    children: JSX.Element | JSX.Element[]
}



export const MapProvider = ( { children }:Props ) => {

  const [state, dispatch] = useReducer( mapReducer, INITIAL_STATE );
  const { places } = useContext( PlacesContext );
  
  useEffect(() => {
    state.markers?.forEach( marker => marker.remove());                     // Limpiamos los marcadores
    const newMarkers: Marker[] = [];                                        // Inicializamos unos nuevos marcadores []   

    for( const place of places){                                            // Recorremos los lugares encontrados en la busqueda
        const[lng, lat] = place.center;
        const popup = new Popup()                                           // Por cada uno de ellos creamos un popup con su información
            .setHTML(`
                <h6>${ place.text_es }</h6>
                <p>${ place.place_name_es }</p>
            `)
        const newMarker = new Marker()                                       // Rellenamos los marcadores [] con los popup y su información    
            .setPopup( popup )
            .setLngLat([ lng, lat ])
            .addTo( state.map! )

        newMarkers.push( newMarker )                                          
    }

    dispatch({ type: 'setMarkers', payload: newMarkers })                    // Actualizamos el state de los mapas con los nuevos marcadores

  }, [places])
  
  const getRouteBetweenPoints = async( start: [number, number], end:[number, number]) => {
    const resp = await directionsApi.get<DirectionsResponse>(`/${ start.join(',') };${ end.join(',') }`)     // Petición a la api para que nos devuelva los puntos[] hasta el destino
    const { distance, duration, geometry } = resp.data.routes[0];                                            // Del destino final obtenemos la distancia, el tiempo para llegar y las coords[]
    //Cambiamos de nombre las coordinates                                                                    // para llegar a ese punto clickado
    const { coordinates: coords } = geometry;
    
    let kms = distance / 1000;                                                  // Conversión a Km   
        kms = Math.round( kms * 100 );
        kms /= 100;

    const minutes = Math.floor( duration /60 );                                 // Conversión a minutos   

    console.log({'kilometros':kms}, {'minutos':minutes})

    const bounds = new LngLatBounds(                                            // Definimos un cuadro delimitador geográfico para mostrar la ruta entre nuestra ubicación y la clickada
        start,                                                                  // Para ello necesitaremos las coordenadas iniciales y finales de coords[]   
        start
    )

    for( const coord of coords) {                                               // Añadimos a los límites las coords[]
        const newCoord: [ number, number ] = [ coord[0], coord[1] ]            
        bounds.extend( newCoord )
    }

    state.map?.fitBounds( bounds, { padding: 200} )                              // Ejecutamos en el map los límites de nuestra dirección objetivo 
  
    // Polyline
    const sourceData: AnySourceData = {
        type: 'geojson', 
        data:{
            type: 'FeatureCollection',
            features: [
                { 
                    type: 'Feature',
                    properties: {},
                    geometry:{
                        type: 'LineString',
                        coordinates: coords
                    }

                }
            ]
        }
    }

    //TODO:Remover polyline si existe
    if( state.map?.getLayer('RouteString')){
        state.map.removeLayer('RouteString')
        state.map.removeSource('RouteString')
    }

    state.map?.addSource('RouteString', sourceData )
    state.map?.addLayer({
        id: 'RouteString', 
        type: `line`,
        source: 'RouteString', 
        layout: {
            'line-cap': 'round',
            'line-join': 'round',
        }, 
        paint:{
            'line-color':'black',
            'line-width': 3
        } 
    })
}

  const setMap = ( map:Map ) => {               // Esta función establece el mapa en el estado del context

    const myLocationPopup = new Popup()
        .setHTML(`
        <h4>Aquí estoy</h4>
        <p>En algún lugar del mundo</p>
        `)

    new Marker()
        .setLngLat( map.getCenter() )           // Establecemos un marcador en el centro del mapa
        .setPopup( myLocationPopup )
        .addTo( map )                           

    dispatch({ type:'setMap', payload: map })   // para ello recibe el mapa y lo envia en un dispatch al reducer para establecerlo
  }


  return (
    <MapContext.Provider value={{
        ...state,                   // El state del context
        setMap,                     // y la función setMap se comparten al sus childrens
        getRouteBetweenPoints,
    }}>
        { children }
    </MapContext.Provider>
  )
}
