import axios from 'axios'

const API_KEY = 'eb52f1c1cccc03cda2d49bff7b171888'
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather'

export const getWeather = async (lat: number, lon: number) => {
  const response = await axios.get(BASE_URL, {
    params: {
      lat,
      lon,
      appid: API_KEY,
      units: 'metric',
      lang: 'kr'
    }
  })
  return response.data
}

export default getWeather