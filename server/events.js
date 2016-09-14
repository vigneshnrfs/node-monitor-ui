/**
 * Created by Vignesh on 14/09/16.
 */
'use strict';

const shortid = require('shortid');
const metrics = require('./metrics');

module.exports = class Hooks {

    constructor(label, desc = undefined) {
        this.startTime = new Date();
        this.time = process.hrtime();
        this.id = shortid.generate();
        this.label = label;
        this.desc = desc;
        this.delta = undefined;

        metrics.sendMetric({
            event: {
                label: this.label,
                desc: this.desc,
                startTime: this.startTime,
                id: this.id
            }
        })

    }

    end() {
        this.endTime = new Date();
        var hrend = process.hrtime(this.time);
        this.timeDelta = hrend[0] * 1e6 + hrend[1] / 100000; //in ms
        metrics.sendMetric({
            event: {
                label: this.label,
                desc: this.desc,
                startTime: this.startTime,
                endTime: this.endTime,
                timeDelta: this.timeDelta,
                id: this.id
            }
        })

    }

}