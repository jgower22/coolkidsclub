//In a try, so no error in console shows when patient is logged in
try {
    document.getElementById('delete').addEventListener('click', function(event) {
        //Ask for confirmation
        if (confirm('Are you sure you want to permanently delete this program? \nCancellation emails will be sent to those who have RSVP\'d as \'Yes\'. \nPress OK to delete the program or press cancel to keep the program.') === false) {
            event.preventDefault();
        }
    });
} catch (err) {
}
