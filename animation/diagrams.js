function createDayDiagram(forecast, latitude,  longitude, buttonNum) {
    const url=`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max&timezone=Europe%2FMoscow&past_days=7&forecast_days=14`
    let date=new Date(forecast.time[buttonNum]);
    let weekDay=date.getDay();
    fetch(url).then((response) => {
        response.json().then(resp=>{
            const currentDay=resp.daily.time.indexOf(forecast.time[buttonNum]);
            const container=document.querySelector('.day-forecast .info__diagram');
            container.innerHTML='';
            const canvasPlot = document.createElement('canvas');
            canvasPlot.classList.add('.days-diagram');
            container.appendChild(canvasPlot);
            let ctx = canvasPlot.getContext('2d');
            const weekArr=["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
            let weekTemp;
            if(weekDay !== 0) {
                weekTemp=resp.daily.temperature_2m_max.slice(currentDay-weekDay+1, currentDay+currentDay-weekDay+1);
            }
            else if(weekDay === 0 && currentDay === 8){
                weekTemp=resp.daily.temperature_2m_max.slice(2, 9);
            } else if(weekDay === 0 && currentDay === 7) {
                weekTemp=resp.daily.temperature_2m_max.slice(1, 8);
            } else weekTemp=resp.daily.temperature_2m_max.slice(8, 15);
            let rangeMin;
            const STEP=5;
            for(let i=0;i<STEP;i++){
                if((Math.floor(Math.min.apply(Math,weekTemp))-i)%STEP===0){
                    rangeMin=Math.floor(Math.min.apply(Math,weekTemp))-i;
                }
            }
            let speedData = {
                labels: weekArr,
                datasets: [{
                    label: "max temperature",
                    data: weekTemp,
                    borderColor: "#21005D",
                    fontColor: "#000"
                },{
                    data: [{
                        x: weekDay===0 ? "Sun" : weekArr[weekDay-1],
                        y: rangeMin
                    },{
                        x: weekDay===0 ? "Sun" : weekArr[weekDay-1],
                        y: weekTemp[weekDay-1]
                    }],
                    borderColor: "grey",
                    fontColor: "#000",
                    borderWidth: 1
                }]
            };
            let chartOptions = {
                legend: {
                    display: false,
                },
                scales:{
                    yAxes: [{
                        ticks: {
                            callback: function(value, index, ticks) {
                                return value+'°';
                            },
                            stepSize: STEP
                        }
                    }],
                    xAxes: [
                        {
                            gridLines: {
                                display: false,
                            },
                        },
                    ],
                }
            };
            let chart = new Chart(ctx, {
                type: 'line',
                data: speedData,
                options: chartOptions
            });

        })
    });
}

function createRainDiagram(forecast, buttonNum){
    const container=document.querySelector('.chance-of-rain .info__diagram');
    container.innerHTML='';
    let i, condition;
    if(buttonNum===0){
        i=0;
        condition=24;
    }
    else{
        i=24;
        condition=48;
    }
    for(i;i<condition;i=i+4){
        const probability=document.createElement('div');
        probability.classList.add('rain-probability');
        const time=document.createElement('p');
        time.classList.add('rain-probability__time');
        time.textContent=forecast.time[i].split('T')[1];
        const visualizationContainer=document.createElement('div');
        visualizationContainer.classList.add('rain-probability__visualization');
        const visualizationValue=document.createElement('div');
        visualizationValue.classList.add('rain-probability__visualization_colored');
        visualizationValue.style.width=forecast.precipitation_probability[i].toString()+'%';
        visualizationContainer.appendChild(visualizationValue);
        const percent=document.createElement('p');
        percent.classList.add('rain-probability__percent');
        percent.textContent=forecast.precipitation_probability[i]+'%';
        probability.appendChild(time);
        probability.appendChild(visualizationContainer);
        probability.appendChild(percent);
        container.appendChild(probability);
    }
}
