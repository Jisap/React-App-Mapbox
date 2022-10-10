//Provider, lo que se guarda en memoria

import { PlacesContext } from "./PlacesContext";
import { useEffect, useReducer } from 'react';
import { placesReducer } from "./placesReducer";
import { getUserLocation } from "../../helpers";
import { searchApi } from "../../apis";
import { Feature, PlacesResponse } from "../../interfaces/places";

export interface PlacesState {
    isLoading:boolean;
    userLocation?: [number, number];
    isLoadingPlaces: boolean;
    places: Feature[];
}

const INITIAL_STATE: PlacesState = {
    isLoading: true,
    userLocation: undefined,
    isLoadingPlaces: false,
    places: []
}

export interface Props {
    children: JSX.Element | JSX.Element
}

export const PlacesProvider = ({ children }:Props) => {                   // El Provider guarda en memoria lo que el context establece como contenido para compartir
  
    const [state, dispatch] = useReducer( placesReducer, INITIAL_STATE );            // Con este hook usamos el placeReducer con un INITIAL_STATE 
  
    useEffect(() => {
        getUserLocation()
            .then( lngLat => dispatch({ type:'setUserLocation', payload: lngLat }) ) // Al cargar la app obtenemos la localización del usuario del navegador
    }, []);                                                                          // y la establecemos en el state   

    const searchPlacesByTerm = async( query: string ):Promise<Feature[]> => {        // Esta función permite realizar una busqueda en la api de mapbox

        if (query.length === 0) {                                                    // Sino hay query limpiamos el state
            dispatch({ type: 'setPlaces', payload:[] })
            return []
        }                  
        if( !state.userLocation ) throw new Error('No hay ubicación del usuario')    // Sino hay localización del usuario mensaje de error

        dispatch({ type: 'setLoadingPlaces' })                                       // Bandera en el state de cargando lugares de busqueda

        const resp = await searchApi.get<PlacesResponse>(`/${query}.json`,{          // La busqueda realiza una petición a mapbox mandando un query y la localización
            params:{
                proximity: state.userLocation.join(',')
            }
        })

        dispatch({ type: 'setPlaces', payload: resp.data.features })                 // Obtenidos los resultados de la busqueda establecemos el state                
        
        return resp.data.features
    }
  
    return (
    <PlacesContext.Provider value={{
        ...state,
        searchPlacesByTerm
    }}>
        { children }
    </PlacesContext.Provider>
  )
}
