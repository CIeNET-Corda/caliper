/**
* Copyright 2017 CIeNET. All Rights Reserved.
*
* SPDX-License-Identifier: Apache-2.0
*
*/

'use strict';

const Util = require('../../src/comm/util');

module.exports.info  = 'number accessing';

let initMoney;
let bc, contx;
let parties;
//args <- config.json-test-rounds-"label":"access"-arguments
module.exports.init = function(blockchain, context, args) {
    if(!args.hasOwnProperty('parties')) {
        return Promise.reject(new Error('simple.access - \'parties\' is missed in the arguments'));
    }
    parties = args.parties;
    // Util.log('==== Corda ==== parties', parties);
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
        if (!parties[i].hasOwnProperty('number')) {
            parties[i].number = parties[i].prefix * 100000000;
        }
        //  --address 10.10.11.7:10006 --flow-name access --number 18600123456
        let command = require('util').format(' --address %s --flow-name access --number %d', parties[i].address, parties[i].number);
        parties[i].number += 1;
        workload.push(command);
    }
    return workload;
}

module.exports.run = function() {
    let args = generateWorkload(parties);
    // Util.log('==== Corda ==== iou', args);
    return bc.invokeSmartContract(contx, 'simple', 'v0', args, 30);
};

module.exports.end = function() {
    return Promise.resolve();
};
