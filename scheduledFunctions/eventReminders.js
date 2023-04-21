const cron = require('node-cron');
const Program = require('../models/program');
const rsvp = require('../models/rsvp');
const validator = require('validator');

exports.initScheduledJobs = () => {
    //Email reminders for events
    cron.schedule('* * * * *', () => {
        console.log('running a task every minute ' + new Date().toLocaleString());

        let startDateString = '2023-04-20';
        let startDateTomorrowString = '2023-04-21';
        let startTimeString = '18:00';

        Program.aggregate([
            {
                $match: {
                    'startDate': {
                        '$gt': startDateString,
                        '$lte': startDateTomorrowString,
                    }, startTime: startTimeString
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
                        { $project: { firstName: 1, lastName: 1, email: 1 }}
                    ]
                }
            },

        ])
            .then(results => {
                //console.log('RESULTS: ' + JSON.stringify(results));
                for (let i = 0; i < results.length; i++) {
                    let event = results[i];
                    console.log('EVENT: ' + JSON.stringify(event));
                    console.log(validator.unescape(event.name));
                    console.log(validator.unescape(event.details));
                    console.log(validator.unescape(event.location));
                    console.log(event.startDate + ' ' + event.startTime);
                    console.log(event.endDate + ' ' + event.endTime);
                    console.log(event.profiles[i].firstName);
                    console.log(event.profiles[i].lastName);
                    console.log(event.profiles[i].email);
                    console.log('-----------------------------------------');
                }
            })
            .catch(err => console.log(err));

    }, {
        scheduled: true,
        timezone: 'America/New_York'
    });
}

