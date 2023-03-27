
document.addEventListener('DOMContentLoaded', function () {
  var calendarEl = document.getElementById('calendar');

  var calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    eventTimeFormat: {
      hour: 'numeric',
      minute: '2-digit'
    },
    events: '/programs/programsJSON/',
    eventClick: function (event) {
      if (event.event.url) {
        event.jsEvent.preventDefault();
        window.open(event.event.url, "_blank");
      }
    }
  });

  calendar.render();
});

