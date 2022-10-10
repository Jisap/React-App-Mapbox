import axios from 'axios';

const searchApi = axios.create({
    baseURL: 'https://api.mapbox.com/geocoding/v5/mapbox.places',
    params: {
        limit: 5,
        language: 'es',
        access_token: 'pk.eyJ1IjoiamlzYXAiLCJhIjoiY2w4c3h4bmp5MDJmaTNucDhyb2FibWUwaSJ9.Ifpq8wQg-EXWOefyyONxGg'
    }
})

export default searchApi
