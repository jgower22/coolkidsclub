let makeAdminButtons = document.querySelectorAll('.make-admin');
let banUserButtons = document.querySelectorAll('.ban-user');

for (i of makeAdminButtons) {
    i.addEventListener('click', function(event) {
        //Ask for confirmation
        if (confirm('Are you sure make this user an admin? Press OK to continue or press cancel.') === false) {
            event.preventDefault();
        }
    });
}

for (i of banUserButtons) {
    i.addEventListener('click', function(event) {
        //Ask for confirmation
        if (confirm('Are you sure ban this user? Press OK to continue or press cancel.') === false) {
            event.preventDefault();
        }
    });
}
