window.addEventListener('load', findLocation);

const buttonSearch=document.querySelector('.button_search');
buttonSearch.addEventListener('click', getForecast);
function findLocation() {
    if (!navigator.geolocation) {
        alert("Unable to determine your location!");
    } else {
        navigator.geolocation.getCurrentPosition(success, error)
    }
    function success(position) {
        const { longitude, latitude }  = position.coords
        ymaps.ready(init);
        function init() {
            let myGeocoder = ymaps.geocode([latitude,longitude]);
            myGeocoder.then(
                function (response) {
                    let geolocation = response.geoObjects.toArray()[0].properties.getAll();
                    let addressInfo={
                        city:geolocation.text.split(',')[1],
                        country:geolocation.text.split(',')[0]
                    }
                    const searchBar=document.querySelector('.search__bar');
                    searchBar.value=addressInfo.city;
                }
            );
        }
    }
    function error() {
        alert("Unable to determine your location!");
    }
    buttonSearch.click();
}

function getForecast(){
    const searchBar=document.querySelector('.search__bar');
    const urlCoords=`https://geocoding-api.open-meteo.com/v1/search?name=${searchBar.value.split(',')[0]}&count=1&language=en&format=json`;
    fetch(urlCoords).then(response => {
        response.json().then(res => {
            const location=res.results[0];
            const urlForecast = `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&hourly=temperature_2m,relativehumidity_2m,apparent_temperature,precipitation_probability,precipitation,rain,snowfall,surface_pressure,cloudcover,windspeed_10m,uv_index,is_day,weathercode&daily=weathercode,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_hours,precipitation_probability_max,windspeed_10m_max&current_weather=true&timezone=Europe%2FMoscow&forecast_days=14&models=best_match`;
            fetch(urlForecast).then((response) => {
                response=response.json();
                const buttons=document.getElementsByClassName('button_not-colored');
                for (const button of buttons) {
                    button.addEventListener('click', ()=>{
                        displayData(response, button.id);
                    })
                }
                buttons[0].click();
            }).then(()=>{
                window.setTimeout(function (){
                    document.body.classList.add('loaded_hiding');
                    window.setTimeout(function () {
                        document.body.classList.add('loaded');
                        document.body.classList.remove('loaded_hiding');
                    }, 1000);
                }, 1000);
            })
        }).catch(err =>alert("Error: this place was not found"));
    })
}

function displayData(data, buttonId){
    cleanDayData();
    data.then(forecast=>{
        let buttonNum, extraTime;
        const currentTime=+forecast.current_weather.time.split('T')[1].split(':')[0];
        buttonId==='today'?buttonNum=0:buttonNum=1;
        buttonId==='today'?extraTime=0:extraTime=24-currentTime;
        const detailedInfo=document.querySelector('.detailed-info');
        const daysForecast=document.querySelector('.days-forecast');
        if(buttonId==='14-days'){
            daysForecast.style.display='block';
            detailedInfo.style.display='none';
        }
        else{
            detailedInfo.style.display='block';
            daysForecast.style.display='none';

        }
        const currentTemp=document.querySelector('.current-temperature_nominal');
        currentTemp.innerHTML=Math.round(forecast.current_weather.temperature)+'&deg;';
        const realTemp=document.querySelector('.current-temperature_real');
        realTemp.innerHTML='Feels like '+Math.round(forecast.hourly.apparent_temperature[currentTime])+'&deg;';
        const rangeTemp=document.querySelector('.temperature-range');
        rangeTemp.innerHTML='Day '+Math.round(forecast.daily.temperature_2m_max[0])+'&deg;<br>Night '+Math.round(forecast.daily.temperature_2m_min[0])+'&deg;';
        const dateTime=document.querySelector('.main-info .date-time');
        dateTime.textContent=formatDate(forecast.current_weather.time.split('T')[0])+', '+forecast.current_weather.time.split('T')[1];
        const weatherVisualizationImg=document.querySelector('.main-info .weather-visualization__img');
        weatherVisualizationImg.src=weatherVisualization[forecast.current_weather.weathercode].img;
        const weatherVisualizationText=document.querySelector('.main-info .weather-visualization__text');
        weatherVisualizationText.textContent=weatherVisualization[forecast.current_weather.weathercode].text;

        const windSpeed=document.querySelector('.detailed-info .wind .info__content');
        windSpeed.textContent=forecast.daily.windspeed_10m_max[buttonNum]+' km/h';
        const rainChance=document.querySelector('.detailed-info .rain .info__content');
        rainChance.textContent=+forecast.daily.precipitation_probability_max[buttonNum]+' %';
        const pressure=document.querySelector('.detailed-info .pressure .info__content');
        pressure.textContent=Math.round(forecast.hourly.surface_pressure[currentTime+extraTime])+' hPa';
        const uvIndex=document.querySelector('.detailed-info .UV .info__content');
        uvIndex.textContent=forecast.daily.uv_index_max[buttonNum];
        let startIndex=currentTime+extraTime;
        let endIndex=startIndex+24;
        generateHourForecast(forecast.hourly.time.slice(startIndex, endIndex), forecast.hourly.weathercode.slice(startIndex, endIndex), forecast.hourly.temperature_2m.slice(startIndex, endIndex));
        const sunrise=document.querySelector('.detailed-info .sunrise .info__content');
        sunrise.textContent=forecast.daily.sunrise[buttonNum].split('T')[1];
        const sunset=document.querySelector('.detailed-info .sunset .info__content');
        sunset.textContent=forecast.daily.sunset[buttonNum].split('T')[1];
        generateDaysForecast(forecast.daily, buttonArrowAnimation);
        createDayDiagram(forecast.daily, forecast.latitude, forecast.longitude, buttonNum);
        createRainDiagram(forecast.hourly, buttonNum);
    });
}

function generateHourForecast(timeArr, visualizationArr, temperatureArr){
    const container=document.querySelector('.hourly-forecast .info__content');
    container.innerHTML='';
    for(let i=0;i<timeArr.length;i++){
        const hourForecast=document.createElement('div');
        hourForecast.classList.add('hourly-forecast__item');
        const time=document.createElement('p');
        time.classList.add('hourly-forecast__time');
        time.textContent=timeArr[i].split('T')[1];
        const img=document.createElement('img');
        img.classList.add('hourly-forecast__img');
        img.src=weatherVisualization[visualizationArr[i]].img;
        const temperature=document.createElement('p');
        temperature.classList.add('hourly-forecast__temperature');
        temperature.innerHTML=Math.round(temperatureArr[i])+'&deg;';
        hourForecast.appendChild(time);
        hourForecast.appendChild(img);
        hourForecast.appendChild(temperature);
        container.appendChild(hourForecast);
    }

}

function generateDaysForecast(forecast, callback){
    const container=document.querySelector('.days-forecast');
    const dayForecastTemplate=document.querySelector('.days-forecast .day-forecast');
    displayDayData(forecast, dayForecastTemplate, 0);
    const COUNT_DAYS=14;
    for(let i=1;i<COUNT_DAYS;i++){
        const dayForecast=document.createElement('div');
        dayForecast.classList.add('day-forecast');
        dayForecast.innerHTML=dayForecastTemplate.innerHTML;
        displayDayData(forecast, dayForecast, i);
        container.appendChild(dayForecast);
    }
    callback();
}

function cleanDayData(){
    const container=document.querySelector('.days-forecast');
    for(let i=container.children.length - 1; i>0 ;i--) {
        container.children[i].remove();
    }
}

function displayDayData(forecast, dayForecast, index){
    const weekArr=[ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const mainInfo=dayForecast.querySelector('.day-forecast__main-info');
    if(index===0){
        mainInfo.querySelector('.date-time').textContent='Today';
    }
    else {
        mainInfo.querySelector('.date-time').textContent = weekArr[new Date(forecast.time[index]).getDay()] + ", " + formatDate(forecast.time[index]);
    }
    mainInfo.querySelector('.weather-visualization__text').textContent=weatherVisualization[forecast.weathercode[index]].text;
    mainInfo.querySelector('.weather-visualization__img').src=weatherVisualization[forecast.weathercode[index]].img;
    mainInfo.querySelector('.temperature-range').innerHTML=Math.round(forecast.temperature_2m_max[index])+'&deg;'+'<br>'+Math.round(forecast.temperature_2m_min[index])+'&deg;';
    const additionalInfo=dayForecast.querySelector('.day-forecast__additional-info');
    additionalInfo.querySelector('.wind .info__content').textContent=forecast.windspeed_10m_max[index]+' km/h';
    additionalInfo.querySelector('.rain .info__content').textContent=+forecast.precipitation_probability_max[index]+' %';
    additionalInfo.querySelector('.sunrise .info__content').textContent=forecast.sunrise[index].split('T')[1];
    additionalInfo.querySelector('.sunset .info__content').textContent=forecast.sunset[index].split('T')[1];
}

function formatDate(str){
    const dateArray=str.split('-');
    const Year=['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    return Year[+dateArray[1]-1]+' '+dateArray[2];
}

const clear={
    img: '../resources/images/visualization/clear.png',
    text: 'Clear'
}
const cloudyAndSun={
    img: '../resources/images/visualization/cloudy%20and%20sun.png',
    text: 'Cloudy'
}
const cloudy={
    img: '../resources/images/visualization/cloudy.png',
    text: 'Cloudy'
}
const foggy={
    img: '../resources/images/visualization/foggy.png',
    text: 'Foggy'
}
const drizzly={
    img: '../resources/images/visualization/drizzly.png',
    text: 'Drizzly'
}
const rainy={
    img: '../resources/images/visualization/rainy.png',
    text: 'Rainy'
}
const freezingRainy={
    img: '../resources/images/visualization/freezingRainy.png',
    text: 'Sleety'
}
const snowy={
    img: '../resources/images/visualization/snowy.png',
    text: 'Snowy'
}
const stormy={
    img: '../resources/images/visualization/stormy.png',
    text: 'Stormy'
}
const weatherVisualization={
    '0': clear,
    '1': cloudyAndSun,
    '2': cloudyAndSun,
    '3': cloudy,
    '45': foggy,
    '48': foggy,
    '51': drizzly,
    '53': drizzly,
    '55': drizzly,
    '56': drizzly,
    '57': drizzly,
    '61': rainy,
    '63': rainy,
    '65': rainy,
    '80': rainy,
    '81': rainy,
    '82': rainy,
    '66':freezingRainy,
    '67':freezingRainy,
    '71':snowy,
    '73':snowy,
    '75':snowy,
    '77':snowy,
    '85':snowy,
    '86':snowy,
    '95':stormy,
    '96':stormy,
    '99':stormy,
}