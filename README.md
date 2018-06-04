# aws-sinon-mock

## Usage

const AWS = require('aws-sdk');
const AWSMock = require('aws-sinon-mock');

const awsmock = new AWSMock({
  AWS,
});

const mod = require('./module-to-test');

awsmock.stub('SQS', 'receiveMessage').callsFake((params, cb) => {
  console.log('params', params);
  cb(null, {
    Messages: [],
  });
});

mod.getMessage();
