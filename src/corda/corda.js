/**
 * Copyright 2018 CIeNET Technologies. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 *
 * @file, definition of the Corda class, which implements the caliper's NBI for R3 Corda
 */

'use strict';

const BlockchainInterface = require('../comm/blockchain-interface.js');
const commUtils = require('../comm/util');
const TxStatus = require('../comm/transaction');

/**
 * Implements {BlockchainInterface} for a Corda backend.
 */
class Corda extends BlockchainInterface{
    /**
     * Create a new instance of the {Corda} class.
     * @param {string} config_path The path of the Corda network configuration file.
     */
    constructor(config_path) {
        // commUtils.log('==== Corda ==== config_path:', config_path);
        super(config_path);
    }

    /**
     * Initialize the {Corda} object.
     * @return {Promise} The return promise.
     */
    init() {
        // commUtils.log('==== Corda ==== init');
        return Promise.resolve();
    }

    /**
     * Deploy the chaincode specified in the network configuration file to all peers.
     * @return {Promise} The return promise.
     */
    installSmartContract() {
        // commUtils.log('==== Corda ==== installSmartContract');
        return Promise.resolve();
    }

    /**
     * Return the context associated with the given callback module name.
     * @param {string} name The name of the callback module as defined in the configuration files.
     * @param {object} args Unused.
     * @return {object} The assembled Corda context.
     */
    getContext(name, args) {
        commUtils.log('==== Corda ==== getContext', name, args);
        //TODO create gRPC client
        return Promise.resolve();
    }

    /**
     * Release the given context.
     * @param {object} context The Corda context to release.
     * @return {Promise} The return promise.
     */
    releaseContext(context) {
        commUtils.log('==== Corda ==== releaseContext', context);
        return Promise.resolve();
    }

    /**
     * Invoke the given chaincode according to the specified options. Multiple transactions will be generated according to the length of args.
     * @param {object} context The Corda context returned by {getContext}.
     * @param {string} contractID The name of the chaincode.
     * @param {string} contractVer The version of the chaincode.
     * @param {Array} args Array of JSON formatted arguments for transaction(s). Each element containts arguments (including the function name) passing to the chaincode. JSON attribute named transaction_type is used by default to specify the function name. If the attribute does not exist, the first attribute will be used as the function name.
     * @param {number} timeout The timeout to set for the execution in seconds.
     * @return {Promise<object>} The promise for the result of the execution.
     */
    invokeSmartContract(context, contractID, contractVer, args, timeout) {
        // commUtils.log('==== Corda ==== invokeSmartContract', contractID, contractVer, args, args.length, timeout);
        // TODO add grpc logic here for issue token.
        let promises = [];
        for (let i=0; i<args.length; i++) {
            if(context.engine) {
                context.engine.submitCallback(1);
            }
            let txID = args[i].account + Date.now().toString();
            let txStatus = new TxStatus(txID);
            txStatus.SetFlag(0);
            txStatus.Set('time_endorse', Date.now());
            txStatus.SetResult('invokeSmartContract_txId_' + txID);
            txStatus.SetVerification(true);
            txStatus.Set('time_order', Date.now());
            txStatus.Set('status', 'submitted');
            txStatus.SetStatusSuccess();
            promises.push(Promise.resolve(txStatus));
        }
        // commUtils.log(txStats);
        return Promise.all(promises);
    }

    /**
     * Query the given chaincode according to the specified options.
     * @param {object} context The Corda context returned by {getContext}.
     * @param {string} contractID The name of the chaincode.
     * @param {string} contractVer The version of the chaincode.
     * @param {string} key The argument to pass to the chaincode query.
     * @param {string} [fcn=query] The chaincode query function name.
     * @return {Promise<object>} The promise for the result of the execution.
     */
    queryState(context, contractID, contractVer, key, fcn = 'query') {
        // commUtils.log('==== Corda ==== queryState', context, contractID, contractVer, key, fcn);
        // TODO add grpc logic here for query token state.
        if(context.engine) {
            context.engine.submitCallback(1);
        }
        let txStatus = new TxStatus(key);
        txStatus.SetResult('queryState_' + key);
        txStatus.SetStatusSuccess();
        return Promise.resolve(txStatus);
    }
}
module.exports = Corda;