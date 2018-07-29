const Validator = require('validator');
const isEmpty = require('./is-empty');


module.exports = function validateEducationInput(data) {
    let errors = {};
    //important about empty string.
    data.school = !isEmpty(data.school) ? data.school : '';
    data.degree = !isEmpty(data.degree) ? data.degree : '';
    data.fieldOfStudy = !isEmpty(data.fieldOfStudy) ? data.fieldOfStudy : '';
    data.from = !isEmpty(data.from) ? data.from : '';



    if (Validator.isEmpty(data.school)) {
        errors.school = 'School name is required';
    }

    if (Validator.isEmpty(data.degree)) {
        errors.degree = 'Please specify your degree';
    }
    if (Validator.isEmpty(data.fieldOfStudy)) {
        errors.fieldOfStudy = 'What was you field of study?';
    }
    if (Validator.isEmpty(data.from)) {
        errors.from = 'From date is required';
    }




    return {
        errors,
        isValid: isEmpty(errors)
    };
};