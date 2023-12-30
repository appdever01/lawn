// const { Client } = require('@googlemaps/google-maps-services-js');

// const client = new Client({});

// const getElevation = async (address) => {
//   try {
//     // Geocode the address to get the coordinates
//     const geocodingResponse = await client.geocode({
//       params: {
//         address: address,
//       },
//     });

//     // Extract the location from the geocoding response
//     const location = geocodingResponse.data.results[0].geometry.location;

//     // Use the obtained coordinates for the elevation request
//     const elevationResponse = await client.elevation({
//       params: {
//         locations: [{ lat: location.lat, lng: location.lng }],
//       },
//     });

//     console.log('Elevation:', elevationResponse.data.results[0].elevation);
//   } catch (error) {
//     console.error('Error:', error);
//   }
// };

// const address = '1600 Amphitheatre Parkway, Mountain View, CA';
// getElevation(address);


const instant_estimate = async (req, res) => {

}

module.exports = {
    instant_estimate
}

