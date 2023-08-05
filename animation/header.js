const element = document.querySelector('.header');

const isVisible = function (elem) {
    if(Math.round(window.scrollY)>=200){
        changeVisibility(true);
    }
    if(Math.round(window.scrollY)<=100){
        changeVisibility(false)
    }
};
function changeVisibility(condition){
    const header=document.querySelector('.header');
    const currentTempNominal=document.querySelector('.current-temperature_nominal');
    const currentTempReal=document.querySelector('.current-temperature_real');
    const img=document.querySelector('.weather-visualization__img');
    const text=document.querySelector('.weather-visualization__text');
    const date=document.querySelector('.date-time');
    const range=document.querySelector('.temperature-range');
    if(condition===true){
        header.classList.add('header_hidden');
        currentTempNominal.classList.add('current-temperature_nominal_hidden');
        currentTempReal.classList.add('current-temperature_real_hidden');
        img.classList.add('weather-visualization__img_hidden');
        text.classList.add('weather-visualization__text_hidden');
        date.classList.add('date-time_hidden');
        range.classList.add('temperature-range_hidden');
    }
    else{
        header.classList.remove('header_hidden');
        currentTempNominal.classList.remove('current-temperature_nominal_hidden');
        currentTempReal.classList.remove('current-temperature_real_hidden');
        img.classList.remove('weather-visualization__img_hidden');
        text.classList.remove('weather-visualization__text_hidden');
        date.classList.remove('date-time_hidden');
        range.classList.remove('temperature-range_hidden');
    }
}
window.addEventListener('scroll', function() {
    isVisible (element);
});