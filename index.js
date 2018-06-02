const sinon = require('sinon');
const AWS = require('aws-sdk-mock');
const log = require('bunyan-wrapper')('aws-mock');

const AWS_SERVICES = {
  CodeBuild: [
    'startBuild',
  ],
  'DynamoDB.DocumentClient': [
    'batchGet',
    'batchWrite',
    'delete',
    'get',
    'put',
    'query',
    'scan',
    'update',
  ],
};

class AWSMock {
  constructor(config) {
    this.config = config;
    this.services = config.services || Object.keys(AWS_SERVICES);
    this.init();
  }

  init() {
    this.stubs = this.services.map(service => ({
      [service]: AWS_SERVICES[service].map(method => ({
        [method]: this.mock(service, method),
      })).reduce(Object.assign),
    })).reduce(Object.assign);
  }

  mock(service, method) {
    const prop = `${service}.${method}`;
    log.trace('setting up mock for', prop);

    // mock service methods with a reusable sinon stub
    const stub = sinon.stub();

    // default implementaion returns an error
    stub.callsFake((params, cb) => {
      const message = `${prop}: Stub not implemented`;
      log.warn(message);
      cb(new Error(message));
    });

    AWS.mock(service, method, (params, cb) => {
      log.trace('%s(%j)', prop, params);

      if (this.config.promise) {
        stub(params)
          .then(x => cb(null, x), cb);
      } else {
        stub(params, cb);
      }
    });

    return stub;
  }

  stub(service, method) {
    return this.stubs[service][method];
  }

  restore() {
    this.services.forEach(service =>
      AWS.restore(service));
  }
}

module.exports = AWSMock;
