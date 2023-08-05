function buttonArrowAnimation (){
    const buttonsArrow = document.querySelectorAll('.button_arrow');
    for (let i = 0; i < buttonsArrow.length; i++) {
        buttonsArrow[i].addEventListener('click', (event) => {
            event.preventDefault();
            if (buttonsArrow[i].parentElement.parentElement.classList.contains('day-forecast_show')) {
                buttonsArrow[i].parentElement.parentElement.classList.remove('day-forecast_show');
                buttonsArrow[i].style.transform = null;
            } else {
                buttonsArrow[i].parentElement.parentElement.classList.add('day-forecast_show');
                buttonsArrow[i].style.transform = 'rotate(180deg)';
            }
        })
    }
}


