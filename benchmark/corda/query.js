/**
* Copyright 2017 CIeNET. All Rights Reserved.
*
* SPDX-License-Identifier: Apache-2.0
*
*/

'use strict';

const Util = require('../../src/comm/util');

module.exports.info  = 'querying accounts';


let bc, contx;
let parties;
module.exports.init = function(blockchain, context, args) {
    if(!args.hasOwnProperty('parties')) {
        return Promise.reject(new Error('simple.iou - \'parties\' is missed in the arguments'));
    }
    parties = args.parties;
    bc = blockchain;
    contx = context;
    return Promise.resolve();
};

/**
 * Generates simple workload
 * @param {List} parties A list of all parties.
 * @returns {Object} array of json objects
 */
function generateWorkload(parties) {
    let workload = [];
    for(let i= 0; i < parties.length; i++) {
        let acc = {
            'action': 'iou_query',
            'from': parties[i]
        };
        workload.push(acc);
    }
    return workload;
}

module.exports.run = function() {
    const key  = generateWorkload(parties);
    // Util.log('==== Corda ==== iou query', key);
    return bc.queryState(contx, 'simple', 'v0', key);
};

module.exports.end = function() {
    // do nothing
    return Promise.resolve();
};
