const assert = require('assert');
const MicroCron = require('../src');

const validJob = (options) => {

    return new Promise((resolve, reject) => {

        setTimeout(() => {
            resolve({
                a: 1
            });
        }, 250);

    });

}

const invalidJob = (options) => {

    return new Promise((resolve, reject) => {

        setTimeout(() => {
            reject(new Error('Something went wrong'));
        }, 250);

    });

}

let mc = null;

describe('micro-cron', () => {

    beforeEach((done) => {

        if (mc) {
            mc.stop();
        }

        mc = new MicroCron();

        done();

    });

    it('instance should not be singleton', (done) => {

        const cp = new MicroCron();

        assert.notStrictEqual(mc, cp);

        done();

    });

    it('job should result in generic success', function (done) {

        this.timeout(0);

        mc.once('success', (data) => {

            assert.strictEqual(data.task, validJob.name);

            done();

        });

        mc.addJob(validJob, 500);
        mc.start();

    });

    it('job should result in generic failure', function (done) {

        this.timeout(0);

        mc.once('failure', (data) => {

            assert.strictEqual(data.task, invalidJob.name);

            done();

        });

        mc.addJob(invalidJob, 500);
        mc.start();

    });

    it('job should result in specific success', function (done) {

        this.timeout(0);

        mc.once(`${validJob.name}:success`, (data) => {

            done();

        });

        mc.addJob(validJob, 500);
        mc.start();

    });

    it('job should result in specific failure', function (done) {

        this.timeout(0);

        mc.once(`${invalidJob.name}:failure`, (data) => {

            done();

        });

        mc.addJob(invalidJob, 500);
        mc.start();

    });

    it('job should result in specific completion', function (done) {

        this.timeout(0);

        mc.once(`${validJob.name}:completion`, (data) => {

            done();

        });

        mc.addJob(validJob, 500);
        mc.start();

    });

    it('job should result in generic completion', function (done) {

        this.timeout(0);

        mc.once('completion', (data) => {

            assert.strictEqual(data.task, validJob.name);

            done();

        });

        mc.addJob(validJob, 500);
        mc.start();

    });

    it('job should fire more than once', function (done) {

        this.timeout(0);

        let fired = 0;
        let timeout = setTimeout(() => {
            done(new Error('Job did not fire more than once'));
        }, 2000);

        mc.on(`${validJob.name}:completion`, (data) => {

            fired++;
            
            if (fired > 1) {
                clearTimeout(timeout);
                done();
            }

        });

        mc.addJob(validJob, 500);
        mc.start();

    });

    it('job should stop', function (done) {

        this.timeout(0);

        let fired = 0;
        let timeout = setTimeout(() => {
            done();
        }, 2000);

        mc.on(`${validJob.name}:completion`, (data) => {

            fired++;
            // first job starts instantly
            if (fired > 1) {

                clearTimeout(timeout);
                
                done(new Error('Did not stop'));

            }

        });

        mc.addJob(validJob, 500);
        mc.start();
        mc.stop();

    });

});