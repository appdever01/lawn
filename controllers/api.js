
const axios = require('axios');



const apiKey = process.env.REAPI_API_KEY; 
const baseUrl = 'https://api.realestateapi.com/v2';

const instant_estimate = async (req, res) => {
  try {
    const { house, street, city, state, zip, address } = req.body;
    const url = `${baseUrl}/PropertyDetail`;

    let response
    if (address){
      const response_ = await axios.post(url, {
        address
      }, {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
      });
      response = response_
    } else {
      const response_ = await axios.post(url, {
        house,
        street,
        city,
        state,
        zip,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
      });
      response = response_
    }
    
    const data = response.data

    let lotsize
    if(data.statusCode == 200){
       lotsize = data.data.lotInfo.lotSquareFeet
    }
    // calculate estimate

    const price = 0.005 * lotsize
    console.log(price, lotsize)

    res.json({
      price: price,
      lotsize: lotsize,
      statusmessage: `${response.data.statusMessage}`,
      statusCode: `${response.data.statusCode}`
    })

  } catch (error) {
    console.error('Error fetching property details:', error.message);
    return res.json({
      status: 404,
      msg: 'Error fetching property details',
      stmsg: `${error.response.data.message}`,
      statusmessage: `${error.response.data.statusMessage}`,
      statusCode: `${error.response.data.statusCode}`
    })
  }
};





module.exports = {
  instant_estimate,
};
