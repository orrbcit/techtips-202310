function showMap() {
    console.log("in show map");
    //------------------------------------------
    // Defines and initiates basic mapbox data
    //------------------------------------------
    mapboxgl.accessToken = 'pk.eyJ1IjoiYWRhbWNoZW4zIiwiYSI6ImNsMGZyNWRtZzB2angzanBjcHVkNTQ2YncifQ.fTdfEXaQ70WoIFLZ2QaRmQ';
    const map = new mapboxgl.Map({
        container: 'map', // Container ID
        style: 'mapbox://styles/mapbox/streets-v11', // Styling URL
        center: [-122.964274, 49.236082], // Starting position
        zoom: 8.8 // Starting zoom
    });

    //-------------------------------------------------------
    // Add user controls to map (compass and zoom) to top left
    //-------------------------------------------------------
    var nav = new mapboxgl.NavigationControl();
    map.addControl(nav, 'top-left');

    // declare some globally used variables
    var userLocationMarker;
    var searchLocationMarker;
    var userLocation;
    var searchLocation;

    // Get the user's location
    navigator.geolocation.getCurrentPosition(function (position) {
        userLocation = [position.coords.longitude, position.coords.latitude];
        console.log(userLocation);
        console.log(searchLocation);

        // Add a marker to the map at the user's location
        userLocationMarker = new mapboxgl.Marker()
            .setLngLat(userLocation)
            .addTo(map);

        // Center the map on the user's location
        map.flyTo({
            center: userLocation
        });
    });

    // Add the MapboxGeocoder search box to the map
    const geocoder = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        types: 'country,region,place,postcode,locality,neighborhood,address',
        localGeocoder: forwardGeocoder, 
        placeholder: 'Enter search e.g. Lot 7 at BCIT'
    });
    map.addControl(geocoder);



    // Listen for the 'result' event from the geocoder (when a search is made)
    geocoder.on('result', function (e) {
        searchLocation = e.result.geometry.coordinates;
        console.log(userLocation);
        console.log(searchLocation);

        // Add a marker to the map at the search location
        searchLocationMarker && searchLocationMarker.remove(); // Remove the previous search marker if it exists
        searchLocationMarker = new mapboxgl.Marker({
                color: 'red'
            })
            .setLngLat(searchLocation)
            .addTo(map);

        // Fit the map to include both the user's location and the search location
        const bounds = new mapboxgl.LngLatBounds();
        bounds.extend(userLocation);
        bounds.extend(searchLocation);

        map.fitBounds(bounds, {
            padding: {
                top: 100,
                bottom: 50,
                left: 100,
                right: 50
            } // Add some padding so that markers aren't at the edge
        });
    });
}

// Load custom data to supplement the search results.
const customData = {
    'features': [{
            'type': 'Feature',
            'properties': {
                'title': 'Lot 7 at BCIT'
            },
            'geometry': {
                'coordinates': [-122.99934141156427, 49.249070527260315],
                'type': 'Point'
            }
        },
        {
            'type': 'Feature',
            'properties': {
                'title': 'Lot N at BCIT'
            },
            'geometry': {
                'coordinates': [-123.00264423718266, 49.244465504164474],
                'type': 'Point'
            }
        },
    ],
    'type': 'FeatureCollection'
};


function forwardGeocoder(query) {
    const matchingFeatures = [];
    for (const feature of customData.features) {
        // Handle queries with different capitalization
        // than the source data by calling toLowerCase().
        if (
            feature.properties.title
            .toLowerCase()
            .includes(query.toLowerCase())
        ) {
            // Add an emoji as a prefix for custom
            // data results using carmen geojson format:
            // https://github.com/mapbox/carmen/blob/master/carmen-geojson.md
            feature['place_name'] = `🚗 ${feature.properties.title}`;
            feature['center'] = feature.geometry.coordinates;
            feature['place_type'] = ['park'];
            matchingFeatures.push(feature);
        }
    }
    return matchingFeatures;
}

//-----------------------------------------------------
// Add unqiue looking pin for showing where the user is.
//------------------------------------------------------
function addUserPin(map) {
    map.loadImage( // use whatever icon you like
        'https://cdn-icons-png.flaticon.com/512/61/61168.png',
        (error, image) => {
            if (error) throw error;

            // Add the image to the map style with width and height values
            map.addImage('userpin', image, {
                width: 10,
                height: 10
            });

            // Adds user's current location as a source to the map
            navigator.geolocation.getCurrentPosition(position => {
                const userLocation = [position.coords.longitude, position.coords.latitude];
                console.log(userLocation);
                if (userLocation) {
                    map.addSource('userLocation', {
                        'type': 'geojson',
                        'data': {
                            'type': 'FeatureCollection',
                            'features': [{
                                'type': 'Feature',
                                'geometry': {
                                    'type': 'Point',
                                    'coordinates': userLocation
                                },
                                'properties': {
                                    'description': 'Your location'
                                }
                            }]
                        }
                    });

                    // Creates a layer above the map displaying the user's location
                    map.addLayer({
                        'id': 'userLocation',
                        'type': 'symbol',
                        'source': 'userLocation',
                        'layout': {
                            'icon-image': 'userpin', // Pin Icon
                            'icon-size': 0.05, // Pin Size
                            'icon-allow-overlap': true // Allows icons to overlap
                        }
                    });

                    // Map On Click function that creates a popup displaying the user's location
                    map.on('click', 'userLocation', (e) => {
                        // Copy coordinates array.
                        const coordinates = e.features[0].geometry.coordinates.slice();
                        const description = e.features[0].properties.description;

                        new mapboxgl.Popup()
                            .setLngLat(coordinates)
                            .setHTML(description)
                            .addTo(map);
                    });

                    // Change the cursor to a pointer when the mouse is over the userLocation layer.
                    map.on('mouseenter', 'userLocation', () => {
                        map.getCanvas().style.cursor = 'pointer';
                    });

                    // Defaults
                    // Defaults cursor when not hovering over the userLocation layer
                    map.on('mouseleave', 'userLocation', () => {
                        map.getCanvas().style.cursor = '';
                    });
                }
            });
        }
    );
}

// Call the function to display the map with the user's location and event pins
showMap();