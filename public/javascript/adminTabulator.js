var admins = [];
var patients = [];
var bannedUsers = [];

var adminButton = function (cell, formatterParams, onRendered) { //plain text value
    let id = cell.getRow().getData().id;
    return "<form><button class='action-button-table' type='submit' formmethod='POST' formaction='/users/" + id + "/make-admin?_method=PUT'>Make Admin</button></form>";
};

var removeAdminButton = function (cell, formatterParams, onRendered) { //plain text value
    let id = cell.getRow().getData().id;
    return "<form><button class='action-button-table red-button' type='submit' formmethod='POST' formaction='/users/" + id + "/remove-admin?_method=PUT'>Remove Admin</button></form>";
};

var banButton = function (cell, formatterParams, onRendered) { //plain text value
    let id = cell.getRow().getData().id;
    return "<form><button class='action-button-table red-button' type='submit' formmethod='POST' formaction='/users/" + id + "/ban?_method=PUT'>Ban User</button></form>";
};

var unbanButton = function (cell, formatterParams, onRendered) { //plain text value
    let id = cell.getRow().getData().id;
    return "<form><button class='action-button-table yellow-button' type='submit' formmethod='POST' formaction='/users/" + id + "/unban?_method=PUT'>Unban User</button></form>";
};



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
                    continue;
                }

                if (user.role === 'admin')
                    admins.push(user);
                if (user.role === 'patient')
                    patients.push(user);

            }

            console.log(bannedUsers);
            //console.log(users);
            const adminTable = new Tabulator("#adminTable", {
                data: admins, //assign data to table
                layout: "fitColumns", //fit columns to width of table (optional)
                pagination: "local",
                paginationSize: paginationSize,
                paginationSizeSelector: paginationSizeSelector,
                paginationCounter: "rows",
                paginationCounter: function (pageSize, currentRow, currentPage, totalRows, totalPages) {
                    return "Showing " + pageSize + " admins of " + totalRows + " total";
                },
                columns: [ //Define Table Columns
                    {
                        title: "Name", field: "name", formatter: "link", frozen: true, formatterParams: {
                            labelField: "name",
                            urlPrefix: "/users/profile/",
                            urlField: "id"
                        }
                    },
                    { title: "Email", field: "email" },
                    { title: "Member Since", field: "date", headerSort: false },
                    {
                        title: "Remove Admin", formatter: removeAdminButton, width: "fitColumn", hozAlign: "center", headerSort: false,
                        cellClick: function (e, cell) {
                            if (confirm('Are you sure want to remove ' + cell.getRow().getData().name + ' as an admin? Press OK to continue or press cancel.') === false) {
                                e.preventDefault();
                            }
                        }
                    },
                ],
            });

            
            const patientTable = new Tabulator("#patientTable", {
                data: patients, //assign data to table
                layout: "fitColumns", //fit columns to width of table (optional)
                pagination: "local",
                paginationSize: paginationSize,
                paginationSizeSelector: paginationSizeSelector,
                paginationCounter: function (pageSize, currentRow, currentPage, totalRows, totalPages) {
                    return "Showing " + pageSize + " patients of " + totalRows + " total";
                },
                columns: [ //Define Table Columns
                    {
                        title: "Name", field: "name", formatter: "link", frozen: true, formatterParams: {
                            labelField: "name",
                            urlPrefix: "/users/profile/",
                            urlField: "id"
                        }
                    },
                    { title: "Email", field: "email",  },
                    { title: "Member Since", field: "date", headerSort: false },
                    {
                        title: "Make Admin", formatter: adminButton, width: "fitColumn", hozAlign: "center", headerSort: false,
                        cellClick: function (e, cell) {
                            if (confirm('Are you sure make ' + cell.getRow().getData().name + ' an admin? Press OK to continue or press cancel.') === false) {
                                e.preventDefault();
                            }
                        }
                    },
                    {
                        title: "Ban User", formatter: banButton, width: "fitColumn", hozAlign: "center", headerSort: false,
                        cellClick: function (e, cell) {
                            if (confirm('Are you sure ban ' + cell.getRow().getData().name + '? Press OK to continue or press cancel.') === false) {
                                e.preventDefault();
                            }
                        }
                    }

                ],
            });

            const bannedTable = new Tabulator("#bannedTable", {
                data: bannedUsers, //assign data to table
                layout: "fitColumns", //fit columns to width of table (optional)
                pagination: "local",
                paginationSize: paginationSize,
                paginationSizeSelector: paginationSizeSelector,
                paginationCounter: "rows",
                paginationCounter: function (pageSize, currentRow, currentPage, totalRows, totalPages) {
                    return "Showing " + pageSize + " banned users of " + totalRows + " total";
                },
                columns: [ //Define Table Columns
                    {
                        title: "Name", field: "name", formatter: "link", frozen: true, formatterParams: {
                            labelField: "name",
                            urlPrefix: "/users/profile/",
                            urlField: "id"
                        }
                    },
                    { title: "Email", field: "email"},
                    { title: "Member Since", field: "date", headerSort: false },
                    {
                        title: "Unban User", formatter: unbanButton, width:"fitColumn", hozAlign: "center", headerSort: false,
                        cellClick: function (e, cell) {
                            if (confirm('Are you sure unban ' + cell.getRow().getData().name + '? Press OK to continue or press cancel.') === false) {
                                e.preventDefault();
                            }
                        }
                    }

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




