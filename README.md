# micro-cron

[![Build Status](https://travis-ci.org/syd619/micro-cron.svg?branch=master)](https://travis-ci.org/syd619/micro-cron)
[![npm version](https://badge.fury.io/js/micro-cron.svg)](https://badge.fury.io/js/micro-cron)
[![Known Vulnerabilities](https://snyk.io/test/github/syd619/micro-cron/badge.svg?targetFile=package.json)](https://snyk.io/test/github/syd619/micro-cron?targetFile=package.json)

## Installation

``` bash
$ npm install micro-cron
```

## Usage

### Basic

```javascript
const MicroCron = require('micro-cron');
const mc = new MicroCron();

const myFirstJob = (options) => {

    return new Promise((resolve, reject) => {

        setTimeout(() => {
            resolve({
                a: 1
            });
        }, 250);

    });

};

const mySecondJob = (options) => {

    return new Promise((resolve, reject) => {

        setTimeout(() => {
            resolve({
                b: 1
            });
        }, 250);

    });

};

/**
 * 
 * Jobs should have a unique function name 
 * 
 */

// second argument is the job options and it's optional
mc.addJob(myFirstJob, {}, 5000); 
mc.addJob(mySecondJob, {}, 5000);

// start all jobs
mc.start((err) => {
    if (err) {
        console.error(err);
    }
});

// stop all jobs
mc.stop((err) => {
    if (err) {
        console.error(err);
    }
});

// start only a specific job - string or job (function) expected
mc.startJob(myFirstJob);

// stop only a specific job - string or job (function) expected
mc.stopJob(myFirstJob);

```

### Events

```javascript

/**
 * 
 * Global events fired for each job
 * 
 */

// job promise then
mc.on('success', (data) => {

    console.log(data);

    // data.task    -> job function name
    // data.result  -> job result

});

// job promise catch
mc.on('failure', (data) => {

    console.log(data);

    // data.task    -> job function name
    // data.error   -> job error

});

// job promise finally
mc.on('completion', (data) => {

    console.log(data);

    // data.task    -> job function name

});

/**
 * 
 * You may listen for a specific job event
 * 
 */

mc.on(`${myFirstJob.name}:success`, (result) => {});
mc.on(`${myFirstJob.name}:failure`, (error) => {});
mc.on(`${myFirstJob.name}:completion`, () => {});

```

## License

(The MIT License)

Copyright (c) 2019 Panagiotis Raditsas

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.