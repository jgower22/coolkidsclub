const cron = require('node-cron');
const Program = require('../models/program');
const validator = require('validator');
const { message } = require('../public/javascript/email.js');
const { DateTime } = require('luxon');

exports.initScheduledJobs = () => {
    //Email reminders for events
    cron.schedule('* * * * *', () => {
        console.log('running a task every minute ' + new Date().toLocaleString());

        let options = {
            timeZone: 'America/New_York',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: 'numeric',
            minute: 'numeric',
            hourCycle: 'h23'
          },
        formatter = new Intl.DateTimeFormat([], options);
        
        //Get current date
        let dateNow = new Date();
        //Add one day to date
        dateNow.setDate(dateNow.getDate() + 1);
        //Format date and time
        let dateTmr = formatter.format(dateNow);
        let startTimeString = dateTmr.split(',')[1].trim();
        let startDateTmrString = dateTmr.split(',')[0].trim();
        
        startDateTmrString = startDateTmrString.replace(/(\d\d)\/(\d\d)\/(\d{4})/, "$3-$1-$2");
        
        Program.aggregate([
            {
                $match: {
                    startDate: startDateTmrString,
                    startTime: startTimeString
                }
            },
            {
                $lookup: {
                    from: 'rsvps',
                    localField: '_id',
                    foreignField: 'program',
                    as: 'Attending'
                }
            },
            {
                '$addFields': {
                    'Attending': {
                        '$filter': {
                            'input': '$Attending',
                            'as': 'att',
                            'cond': {
                                '$eq': ['$$att.response', 'yes']
                            }
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'Attending.user',
                    foreignField: '_id',
                    as: 'profiles',
                    pipeline: [
                        { $project: { firstName: 1, lastName: 1, email: 1 } }
                    ]
                }
            },

        ])
            .then(results => {
                if (!results) {
                    console.log('No event reminders sent.');
                    return;
                }
                console.log('RESULTS: ' + results);
                for (let i = 0; i < results.length; i++) {
                    let event = results[i];
                    console.log(i + ' EVENT: ' + JSON.stringify(event));

                    let eventName = validator.unescape(event.name);
                    let eventDetails = validator.unescape(event.details);
                    let eventLocation = validator.unescape(event.location);

                    const dateFormat = { 
                        ...DateTime.DATE_FULL, 
                        weekday: 'short',
                        month: 'short'
                    };
                    const startDate = DateTime.fromISO(event.startDate);
                    const formattedStartDate = startDate.toLocaleString(dateFormat);
    
                    const endDate = DateTime.fromISO(event.endDate);
                    const formattedEndDate = endDate.toLocaleString(dateFormat);
    
                    const startTime = DateTime.fromISO(event.startTime);
                    const formattedStartTime = startTime.toLocaleString(DateTime.TIME_SIMPLE);

                    const endTime = DateTime.fromISO(event.endTime);
                    const formattedEndTime = endTime.toLocaleString(DateTime.TIME_SIMPLE);

                    let eventStartDetails = formattedStartDate + ' @ ' + formattedStartTime;
                    let eventEndDetails = formattedEndDate + ' @ ' + formattedEndTime;
                    console.log('EVENT PROFILES: ' + JSON.stringify(event.profiles));
                    if (event.profiles.length > 0) {
                        for (let j = 0; j < event.profiles.length; j++) {
                            let profile = event.profiles[j];
                            console.log(profile);
                            let firstName = profile.firstName;
                            let lastName = profile.lastName;
                            let email = profile.email;
                            let messageOptions = ({
                                from: `${process.env.EMAIL}`,
                                to: "" + email + "", //receiver
                                subject: "Program Reminder for " + eventName,
                                html: "Hello, " + firstName +
                                    "<br><br>This is a 24 hour reminder for " + eventName +
                                    "<br><br>Start Date: " + eventStartDetails +
                                    "<br>End Date: " + eventEndDetails +
                                    "<br><br>Location: " + eventLocation + 
                                    "<br>Details: " + eventDetails
                            });
                            message(null, null, messageOptions, null, null, null, null);
                            console.log('SENDING EMAIL');
                        }
                    } else {
                        console.log('No one is attending this event');
                    }
                    console.log('-----------------------------------------');
                }
            })
            .catch(err => console.log(err));

    }, {
        scheduled: true,
        timezone: 'America/New_York'
    });
}

