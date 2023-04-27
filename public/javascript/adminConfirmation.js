let makeAdminButtons = document.querySelectorAll('.make-admin');
let banUserButtons = document.querySelectorAll('.ban-user');
let unbanUserButtons = document.querySelectorAll('.unban-user');

console.log("mab: " + JSON.stringify(makeAdminButtons));
for (i of makeAdminButtons) {
    i.addEventListener('click', function(event) {
        //Ask for confirmation
        console.log(i.value);
        if (confirm('Are you sure make ' + this.value  + ' an admin? Press OK to continue or press cancel.') === false) {
            event.preventDefault();
        }
    });
}

for (i of banUserButtons) {
    i.addEventListener('click', function(event) {
        //Ask for confirmation
        if (confirm('Are you sure ban ' + this.value + '? Press OK to continue or press cancel.') === false) {
            event.preventDefault();
        }
    });
}

for (i of unbanUserButtons) {
    i.addEventListener('click', function(event) {
        //Ask for confirmation
        if (confirm('Are you sure unban ' + this.value + '? Press OK to continue or press cancel.') === false) {
            event.preventDefault();
        }
    });
}
