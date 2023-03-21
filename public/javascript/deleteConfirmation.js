//In a try, so no error in console shows when patient is logged in
try {
    document.getElementById('delete').addEventListener('click', function(event) {
        //Ask for confirmation
        if (confirm('Are you sure you want to permanently delete this program? Press OK to delete the trip or press cancel to keep the program.') === false) {
            event.preventDefault();
        }
    });
} catch (err) {
}
