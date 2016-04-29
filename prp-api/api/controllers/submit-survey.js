'use strict';

var mysql = require('mysql');
var moment = require('moment');

var connection = mysql.createConnection({
   host     : 'localhost',
   user     : 'root',
   password : 'root',
   database : 'prp_development'
 });

module.exports = {
  submitSurvey: submitSurvey
}

function submitSurvey(req, res) {

    const surveyInstanceID = req.swagger.params.body.value.surveyInstanceID;
    const questionInstArr = [];
    const currentDate = new Date();
    const endDate = moment(currentDate).add(2, 'day').toDate();

    connection.query('SELECT * from survey_instance where id = ?', [surveyInstanceID] ,function(err, surveyInstance, fields) {
       connection.query('SELECT * from question_result',function(err, questionResults, fields) {
         connection.query('SELECT * from question_option',function(err, questionOptions, fields) {

           connection.beginTransaction(function(err) {
              connection.query('INSERT INTO survey_instance SET id=?, startTime=?, endTime=?, userSubmissionTime=?, actualSubmissionTime=?, state=?, createdAt=?, updatedAt=?, patientId=?, surveyTemplateId=?',
                  [surveyInstanceID, currentDate, endDate, currentDate, currentDate, 'pending',currentDate, currentDate, 1, 2], function(err, result) {

                   if(err) {
                     console.log('in execution'+err);
                    res.statusCode = 400;
                    res.json();
                  } else {

                    connection.commit(function(err) {
                      if (err) {
                       return connection.rollback(function() {
                          throw err;
                       });
                      }
                     console.log('success!');

                    });

                    res.statusCode = 201;
                    res.setHeader('Location', 'http://localhost:10010/survey');
                    var processedSurveyInstances = {
                            message: 'Survey Instance Created',
                            surveyInstanceID: surveyInstanceID
                    };

                    res.json(processedSurveyInstances);

                  }

              });

              });
         });
      });
    });

}
