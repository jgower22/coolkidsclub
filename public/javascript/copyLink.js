document.getElementById("copyLink").addEventListener("click", () => {
    let currentURL = window.location.href;

    navigator.clipboard.writeText(currentURL).then(
        () => {
            //Success
            if (document.getElementById('shareMessage') !== null) {
                document.getElementById('shareMessage').remove();
            }
            let div = document.createElement('div');
            div.setAttribute('id', 'shareMessage');
            div.setAttribute('class', 'successCopy float-right');
            div.innerHTML = "<span class='closebtn' onclick='this.parentElement.style.display=\"none\"';>&times;</span>";
            div.innerHTML += "Link copied!";
            document.getElementById('buttons-container').append(div);
        },
        () => {
            //Error
            if (document.getElementById('shareMessage') !== null) {
                document.getElementById('shareMessage').remove();
            }
            let div = document.createElement('div');
            div.setAttribute('id', 'shareMessage');
            div.setAttribute('class', 'errorCopy');
            div.innerHTML = "<span class='closebtn' onclick='this.parentElement.style.display=\"none\"';>&times;</span>";
            div.innerHTML += "Unknown error. Please try again.";
            document.getElementById('buttons-container').append(div);
        }
    );
});