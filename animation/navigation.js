const buttons=document.getElementsByClassName('button_not-colored');

window.addEventListener('load', ()=>{
    buttons[0].classList.add('selected');
})

for (let button of buttons) {
    button.addEventListener('click', (event)=>{
        event.preventDefault();
        for (let button1 of buttons) {
            button1.classList.remove('selected');
        }
        button.classList.add('selected');
    })
}
