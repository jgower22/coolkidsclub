try {
    document.getElementById('userIcon').addEventListener('click', e => {
        e.preventDefault();
        let element = document.querySelector(".drop-down-menu-container");
        console.log(element);
        element.classList.toggle('active');
    });
} catch (e) {

} 
