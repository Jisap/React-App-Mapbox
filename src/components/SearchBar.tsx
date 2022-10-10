import { ChangeEvent, useContext, useRef } from "react"
import { PlacesContext } from "../context";
import { SearchResult } from "./SearchResult";




export const SearchBar = () => {

  const { searchPlacesByTerm } = useContext( PlacesContext )

  const debounceRef = useRef<NodeJS.Timeout>(); // Referencia a un retardo en la emisión de una acción tras pasar 500 msec sin introducir nada en el input
  
  const onQueryChanged = ( event:ChangeEvent<HTMLInputElement> ) => { // En ts El evento del input es de tipo ChangeEvent y este devuelve un HTMLInputElement
    
    if( debounceRef.current )                                         // 1º Si la ref tiene algún valor se limpia   
        clearTimeout( debounceRef.current );

    debounceRef.current = setTimeout( () => {                         // 2º Si la ref no tiene valor alguno le asignamos un setTimeout  
        searchPlacesByTerm( event.target.value )                      // para la petición de la busqueda de una localización            
    }, 350)    
  }

  return (
    <div className="search-container">
        <input 
            type="text"
            className="form-control"
            placeholder="Buscar lugar..."
            onChange={ onQueryChanged } // Aqui se llama a onQueryChanged que le da valor a nuestro debounceRef
        />

        <SearchResult />


    </div>
  )
}
