
const getCountry = async (lat, lng) => {
  const apiKey = process.env.OPENCAGE_KEY;
  const url = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${apiKey}`;
  
  const res = await fetch(url);
  const data = await res.json();
  
  return data.results[0].components.country;
}

const getMap = async (lat, lng) => { 
  return "https://www.google.com/maps?q=" + lat +"," + lng;
};

module.exports = {getCountry, getMap};
