import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();
import express from 'express';
import fetch from 'node-fetch';


const app = express();

app.listen(3000, () => {
    console.log('Server listening on port 3000');
});


app.get('/weather', async (req, res) => {
    const { city } = req.query;
    const apiKey = process.env.SECRET_KEY;
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;

    const response = await fetch(apiUrl);
    let data = await response.json();

    data = addWeatherIcon(data);

    res.json(data);
});


function addWeatherIcon (data) {
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
    const image = `https://openweathermap.org/img/wn/${imageId}@2x.png`;

    return {
        ...data,
        image
    }
}