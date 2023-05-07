async function makeTable() {
    var paginationSizeSelector = [10, 20, 30];
    var paginationSize = 10;
    let url = window.location.href;
    let id = url.substring(url.lastIndexOf('/') + 1, url.length);
    console.log('url: ' + url);
    console.log('id: ' + id);
    fetch("/users/rsvpsProgramJSON/" + id).then((response) => {
        if (response.ok) {
            return response.json();
        }
        throw new Error('Something went wrong');
    })
        .then((programs) => {
            console.log("users: " + JSON.stringify(programs));
            const rsvpsProgramTable = new Tabulator("#rsvpsProgramTable", {
                data: programs, //assign data to table
                layout: "fitColumns", //fit columns to width of table (optional)
                pagination: "local",
                paginationSize: paginationSize,
                paginationSizeSelector: paginationSizeSelector,
                paginationCounter: "rows",
                paginationCounter: function (pageSize, currentRow, currentPage, totalRows, totalPages) {
                    return "Showing " + pageSize + " RSVPs of " + totalRows + " total";
                },
                columns: [ //Define Table Columns
                    {
                        title: "Name", field: "name", formatter: "link", frozen: true, formatterParams: {
                            labelField: "name",
                            urlPrefix: "/users/profile/",
                            urlField: "id"
                        }
                    },
                    { title: "Email", field: "user.email" }
                    
                ]
            });
        })
        .catch((error) => {
            console.log(error);
            const hidden = document.querySelectorAll(".hidden");
            for (let i = 0; i < hidden.length; i++) {
                hidden[i].style.display = "none";
            }
            document.getElementById("errorMessage").innerHTML = "<h1>Error fetching rsvps</h1>";
            document.getElementById("errorMessage").innerHTML += "<h2>Please try again</h2>";
        });
}

makeTable();
