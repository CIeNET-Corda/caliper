/**
* Copyright 2017 CIeNET. All Rights Reserved.
*
* SPDX-License-Identifier: Apache-2.0
*
*/

'use strict';

const Util = require('../../src/comm/util');

module.exports.info  = 'opening accounts';

let initMoney;
let bc, contx;
let parties;
//args <- config.json-test-rounds-"label":"iou"-arguments
module.exports.init = function(blockchain, context, args) {
    if(!args.hasOwnProperty('money')) {
        return Promise.reject(new Error('simple.iou - \'money\' is missed in the arguments'));
    }
    if(!args.hasOwnProperty('parties')) {
        return Promise.reject(new Error('simple.iou - \'parties\' is missed in the arguments'));
    }
    initMoney = args.money;
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
    for(let i= 0; i < parties.length-1; i++) {
        for(let j=i+1; j < parties.length; j++) {
            let acc = {
                'action': 'iou',
                'from': parties[i],
                'to': parties[j],
                'money': initMoney
            };
            workload.push(acc);
            let acc_2 = {
                'action': 'iou',
                'from': parties[j],
                'to': parties[i],
                'money': initMoney
            };
            workload.push(acc_2);
        }
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
