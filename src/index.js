const EventEmitter = require('events');

const noop = () => {};

class MicroCron extends EventEmitter {

    constructor() {

        super();

        this.jobs = {};
        this.timeouts = {};
        this.started = false;

    }

    addJob(task, options = {}, interval) {

        if (Number.isInteger(options)) {
            interval = options;
            options = {};
        }

        if (!Number.isInteger(interval) || interval < 1 || interval > 2147483647) {
            throw new Error('Invalid interval supplied. It should be between 1 - 2147483647.');
        }

        if (!task.name || this.jobs.hasOwnProperty(task.name)) {
            throw new Error('Your job must have a unique function name.');
        }

        this.jobs[task.name] = {
            task: task,
            options: options,
            interval: interval
        };

    }

    stopJob(job) {

        let taskName = job;

        if ((job instanceof Function) && job.name) {
            taskName = job.name;
        }

        if (typeof taskName !== 'string') {
            throw new Error('Invalid job argument provided.');
        }

        clearTimeout(this.timeouts[job]);

        this.timeouts[job] = 0;
        this.started = (Object.keys(this.timeouts).filter((timeout) => (this.timeouts[timeout] !== 0)).length > 0) ? true : false;

    }

    startJob(job) {

        let taskName = job;

        if ((job instanceof Function) && job.name) {
            taskName = job.name;
        }

        if (typeof taskName !== 'string') {
            throw new Error('Invalid job argument provided.');
        }

        if (!this.timeouts.hasOwnProperty(taskName) && this.jobs.hasOwnProperty(taskName)) {
            this.runJob(this.jobs[taskName]);
        }

        this.timeouts[taskName] = 1;
        this.started = (Object.keys(this.timeouts).filter((timeout) => (this.timeouts[timeout] !== 0)).length > 0) ? true : false;

    }

    runJob(job) {

        const {
            task,
            options
        } = job;

        const started = Date.now();

        task(options).then((result) => this.onJobSuccess(task.name, result)).catch((error) => this.onJobFailure(task.name, error)).finally(() => this.onJobCompletion(job, started));

    }

    onJobSuccess(taskName, result) {

        this.emit('success', {
            task: taskName,
            result: result
        });

        this.emit(`${taskName}:success`, result);

    }

    onJobFailure(taskName, error) {

        this.emit('failure', {
            task: taskName,
            error: error
        });

        this.emit(`${taskName}:failure`, error);

    }

    onJobCompletion(job, started) {

        const {
            task,
            interval
        } = job;

        this.emit('completion', {
            task: task.name
        });

        this.emit(`${task.name}:completion`);

        if (this.started) {

            const now = Date.now();
            const elapsed = now - started;
            const diff = interval - elapsed;

            if (diff < 1) {

                this.runJob(job);

            } else {

                this.timeouts[task.name] = setTimeout(() => {
                    this.runJob(job);
                }, diff);

            }



        }

    }

    start(callback = noop) {

        if (!this.started) {

            try {

                ///////////////////////////////

                for (let taskName in this.jobs) {
                    this.startJob(taskName);
                }

                ///////////////////////////////

                callback();

            } catch (err) {

                this.stop();

                callback(err);

            }

        }

    }

    stop(callback = noop) {

        try {

            for (let taskName in this.timeouts) {
                this.stopJob(taskName);
            }

            callback();

        } catch (err) {
            callback(err);
        }

    }

}

module.exports = MicroCron;