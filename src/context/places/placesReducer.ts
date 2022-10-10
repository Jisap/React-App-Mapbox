import { Feature } from "../../interfaces/places";
import { PlacesState } from "./PlacesProvider";

type PlacesAction = 
| { type:'setUserLocation', payload:[number, number] } // long, lat
| { type: 'setPlaces', payload: Feature[] }
| { type: 'setLoadingPlaces' }

export const placesReducer = ( state:PlacesState, action:PlacesAction ):PlacesState => { // El reducer modifica el state recibiendo como arg el state y la action que lo modifica

    switch ( action.type ) {
        case 'setUserLocation':
            return { 
                ...state,
                isLoading: false,
                userLocation: action.payload
            }

        case 'setLoadingPlaces':
            return { 
                ...state,
                isLoadingPlaces: true,
                places: []                  // Cuando estamos cargando los lugares que buscamos limpiamos el rdo de la busqueda anterior
            }
        
        case 'setPlaces' :
            return { 
                ...state,
                isLoadingPlaces: false,
                places: action.payload      // Cuando los lugares buscados se cargaron establecemos el nuevo state con la carga útil del action.payload
            }         
    
        default:
            return state;

            
    }
}