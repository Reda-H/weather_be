import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();
import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import mockData from './mockWeather.js';
import cities from './city.list.js';


const app = express();

app.use(cors());

app.listen(80, () => {
    console.log('Server listening on port 80');
});


app.get('/weather', async (req, res) => {
    let { city } = req.query;
    city = city.toLowerCase()
    console.log('request for /weather received for', city)
    const apiKey = process.env.SECRET_KEY;
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
    let data = null;
    
    try {
        const response = await fetch(apiUrl);
        // console.log(response);
        data = await response.json();
        data = addWeatherIcon(data);
    } catch (error) {
        console.log('request failed')
        data = mockData;
        data = addWeatherIcon(data);
    }

    res.json(data);
    // res.send(data);
});

function autocompleteMatch(input) {
    if (input == '') {
      return [];
    }
    var reg = new RegExp(`^${input}`)
    return cities.filter(function(city) {
        if (city.name.toLowerCase().match(reg)) {
          return city;
        }
    });
  }


app.get('/search', async (req, res) => {
    let {input} = req.query;
    let listOfReturnedCities = autocompleteMatch(input).sort((a, b) => {
        if (a.name.toUpperCase() < b.name.toUpperCase()) {
          return -1;
        }
        if (a.name.toUpperCase() > b.name.toUpperCase()) {
          return 1;
        }
        // names must be equal
        return 0;
    });
    for(let i = 0; i < listOfReturnedCities.length - 1; i++) {
        if(listOfReturnedCities[i].name === listOfReturnedCities[i+1].name) {
            listOfReturnedCities.splice(i, 1);
            i--;
        }
    }
    res.json(listOfReturnedCities.slice(0,10));
})


function addWeatherIcon(data) {
    console.log(data);
    let imageId = null;
    let weatherCode = data.weather[0].id;
    if (weatherCode >= 200 && weatherCode <= 232) {
        imageId = '11d';
    } else if (weatherCode >= 300 && weatherCode <= 320) {
        imageId = '09d';
    } else if (weatherCode >= 500 && weatherCode <= 531) {
        imageId = '10d';
        if (weatherCode == 511) {
            imageId = '13d';
        } else if (weatherCode >= 520) {
            imageId = '09d';
        }
    } else if (weatherCode >= 600 && weatherCode <= 622) {
        imageId = '13d';
    } else if (weatherCode >= 701 && weatherCode <= 781) {
        imageId = '50d';
    } else if (weatherCode == 800) {
        let moment = data.dt;
        if (moment > data.sys.sunrise && moment < data.sys.sunset) {
            imageId = '01d';
        } else {
            imageId = '01n';
        }
    } else if (weatherCode >= 801 && weatherCode <= 804) {
        if (weatherCode == 801) imageId = '02';
        else if (weatherCode == 802) imageId = '03';
        else if (weatherCode == 803 || weatherCode == 804) imageId = '04';

        let moment = data.dt;
        if (moment > data.sys.sunrise && moment < data.sys.sunset) {
            imageId += 'd';
        } else {
            imageId += 'n';
        }
    }
    const image = `https://openweathermap.org/img/wn/${imageId}@4x.png`;

    return {
        ...data,
        image
    }
}