const validator = require('validator');

exports.unescapeProgramTitles = (programs) => {
    //Unescape names for calendar view
    for (let i = 0; i < programs.length; i++) {
        let program = programs[i];
        program.title = validator.unescape(program.title);
    }
};

exports.unescapeProgramNames = (programs) => {
    //Unescape names for calendar view
    for (let i = 0; i < programs.length; i++) {
        let program = programs[i];
        program.name = validator.unescape(program.name);
    }
};

exports.unescapeProgram = (program) => {
    //Unescape program fields for program view
    program.name = validator.unescape(program.name);
    program.location = validator.unescape(program.location);
    program.details = validator.unescape(program.details);
}