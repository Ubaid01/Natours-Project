/* eslint-disable */

//- As Parser and MapBox NPM module sometimes don't work together so used CDN.
export const displayMap = ( locations , mapboxToken , mapboxStyle ) => {
   mapboxgl.accessToken = mapboxToken ;
    let map = new mapboxgl.Map( {
        container: 'map' , // Container ID
        style: mapboxStyle , // Custom Theme via Style-Editor
        scrollZoom: false
        // center: [-118.113491 , 34.111745], // Here also format is similar to MongoDB like (lon, lat)
        // zoom: 9 ,
        // interactive: false
    } ) ;

    const bounds = new mapboxgl.LngLatBounds() ;

    locations.forEach( loc => {
        // Create marker
        const el = document.createElement('div') ;
        el.className = 'marker' ;

        // Add marker
        new mapboxgl.Marker( {
            element: el ,
            anchor: 'bottom' // Bottom of element (i.e. pin) will be located at coordinate.
        } ).setLngLat( loc.coordinates ).addTo( map ) ;

        // Add popup
        new mapboxgl.Popup( {
            offset: 30 // To avoid overlapping with marker
        } ).setLngLat( loc.coordinates ).setHTML( `<p> Day ${ loc.day }: ${ loc.description } </p>` ).addTo( map ) ;

        // Extend map bounds to include current location.
        bounds.extend( loc.coordinates ) ;
    } ) ;

    map.fitBounds( bounds , {
        padding: {
            top: 200 ,
            bottom: 150 ,
            left: 100 ,
            right: 100
        }
    } ) ; 
} ;