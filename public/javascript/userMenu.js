try {
    document.getElementById('userIcon').addEventListener('click', e => {
        e.preventDefault();
        let element = document.querySelector(".drop-down-menu-container");
        console.log(element);
        element.classList.toggle('active');
    });

    const xBtn = document.querySelector('#profile-delete-btn');
    const dropDownContainer = document.querySelector('.drop-down-menu-container');

    xBtn.addEventListener('click', e => {
        dropDownContainer.classList.remove('active');
    })
} catch (e) {

}


