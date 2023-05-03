
var admins = [];
var patients = [];
var bannedUsers = [];


async function makeTable() {
    var paginationSizeSelector = [10, 20, 30];
    var paginationSize = 10;
    fetch('/users/usersJSON').then((response) => {
        if (response.ok) {
            return response.json();
        }
        throw new Error('Something went wrong');
    })
        .then((users) => {
            for (let i = 0; i < users.length; i++) {
                let user = users[i];
                if (user.status === 'banned') {
                    bannedUsers.push(user);
                }
                if (user.role === 'admin')
                    admins.push(user);
                if (user.role === 'patient')
                    patients.push(user);





            }
            console.log(admins);
            //console.log(users);
            const adminTable = new Tabulator("#adminTable", {
                data: admins, //assign data to table
                layout: "fitColumns", //fit columns to width of table (optional)
                pagination: "local",
                paginationSize: paginationSize,
                paginationSizeSelector: paginationSizeSelector,
                paginationCounter: "rows",
                columns: [ //Define Table Columns
                    {
                        title: "Name", field: "name", formatter: "link", formatterParams: {
                            labelField: "name",
                            urlPrefix: "/users/profile/",
                            urlField: "id"
                        }
                    },
                    { title: "Email", field: "email"  },
                    { title: "Member Since", field: "date",  headerSort: false },
                ],
            });

            var adminButton = function (cell, formatterParams, onRendered) { //plain text value
                let id = cell.getRow().getData().id;
                return "<form><button class='action-button make-admin' type='submit' formmethod='POST' formaction='/users/" + id + "/make-admin?_method=PUT'>Make Admin</button></form>";
            };

            var banButton = function (cell, formatterParams, onRendered) { //plain text value
                let id = cell.getRow().getData().id;
                return "<form><button class='action-button ban-user' type='submit' formmethod='POST' formaction='/users/" + id + "/ban?_method=PUT'>Ban User</button></form>";
            };
            const patientTable = new Tabulator("#patientTable", {
                data: patients, //assign data to table
                layout: "fitColumns", //fit columns to width of table (optional)
                pagination: "local",
                paginationSize: paginationSize,
                paginationSizeSelector: paginationSizeSelector,
                paginationCounter: "rows",
                columns: [ //Define Table Columns
                    {
                        title: "Name", field: "name", formatter: "link", formatterParams: {
                            labelField: "name",
                            urlPrefix: "/users/profile/",
                            urlField: "id"
                        }
                    },
                    { title: "Email", field: "email" },
                    { title: "Member Since", field: "date", headerSort: false },
                    { title: "Make Admin", formatter: adminButton, width: "fitCell", hozAlign: "center", headerSort: false, cellClick: function (e, cell) { alert("Printing row data for: " + cell.getRow().getData().id) } },
                    { title: "Ban User", formatter: banButton, width: "fitColumn", hozAlign: "center", headerSort: false, cellClick: function (e, cell) { alert("Printing row data for: " + cell.getRow().getData().id) } }

                ],
            });
            

        })
        .catch((error) => {
            const hidden = document.querySelectorAll(".hidden");
            for (let i = 0; i < hidden.length; i++) {
                hidden[i].style.display = "none";
            }
            document.getElementById("errorMessage").innerHTML = "<h1>Error fetching users</h1>";
            document.getElementById("errorMessage").innerHTML += "<h2>Please try again</h2>";
        });
}

makeTable();

function buttonFormatter(cell) {
    var cellEl = cell.getElement(); //get cell DOM element

    // create elements
    var linkBut = document.createElement("button");
    var edtiBut = document.createElement("button");
    var otherBut = document.createElement("button");

    //add event bindings
    linkBut.addEventListener("click", function (e) {
        //do something when link button clicked
    });
    linkBut.value = 'yes';
    //add buttons to cell
    cellEl.appendChild(linkBut);
    cellEl.appendChild(edtiBut);
    cellEl.appendChild(otherBut);
}

var tabledata = [
    { id: 1, name: "Oli Bob", age: "12", col: "red", dob: "" },
    { id: 2, name: "Mary May", age: "1", col: "blue", dob: "14/05/1982" },
    { id: 3, name: "Christine Lobowski", age: "42", col: "green", dob: "22/05/1982" },
    { id: 4, name: "Brendon Philips", age: "125", col: "orange", dob: "01/08/1980" },
    { id: 5, name: "Margret Marmajuke", age: "16", col: "yellow", dob: "31/01/1999" },
];



