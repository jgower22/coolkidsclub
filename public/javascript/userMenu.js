try {
    const chevronUp = document.querySelector('.fa-chevron-up');
    const chevronDown = document.querySelector('.fa-chevron-down');
    const chevronIcon = document.querySelectorAll('.chevron-icon');
    const element = document.querySelector(".drop-down-menu-container");

    document.getElementById('userIcon').addEventListener('click', e => {
        e.preventDefault();
        //let element = document.querySelector(".drop-down-menu-container");
        console.log(element);
        element.classList.toggle('active');
        chevronDown.classList.toggle('active');
        chevronUp.classList.toggle('active');
    });

    chevronDown.addEventListener('click', e => {
        element.classlist.toggle('active');
    })

    const xBtn = document.querySelector('#profile-delete-btn');
    const dropDownContainer = document.querySelector('.drop-down-menu-container');

    xBtn.addEventListener('click', e => {
        dropDownContainer.classList.remove('active');
    })
} catch (e) {

}


