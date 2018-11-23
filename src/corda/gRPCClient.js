'use strict';


const commUtils = require('../comm/util');
const TxStatus  = require('../comm/transaction');

const PROTO_PATH = __dirname + '/proto/np.proto';

const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');
const packageDefinition = protoLoader.loadSync(
    PROTO_PATH,
    {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
    });

const np_proto = grpc.loadPackageDefinition(packageDefinition).np;

let client = new np_proto.NPGRPCAdapter('localhost:50051', grpc.credentials.createInsecure());;

/**
 * Initialize the Fabric client configuration.
 * @param {string} config_path The path of the Fabric network configuration file.
 */
function init(config_path) {
    // commUtils.log('==== Corda ==== NPGRPCAdapter init');
    // client = 
}

module.exports.init = init;

/**
 * Submit a transaction to the given chaincode with the specified options.
 * @param {object} context The Fabric context.
 * @param {string} id The name of the chaincode.
 * @param {string} version The version of the chaincode.
 * @param {string[]} args The arguments to pass to the chaincode.
 * @param {number} timeout The timeout for the transaction invocation.
 * @return {Promise<TxStatus>} The result and stats of the transaction invocation.
 */
async function invokebycontext(context, id, version, args, timeout){
    args = args.split(' ');
    // commUtils.log('==== Corda ==== invokebycontext', context, args, args.length, timeout);
    let txID = Date.now().toString();
    let txStatus = new TxStatus(txID);
    txStatus.SetFlag(0);
    txStatus.Set('time_endorse', Date.now());
    txStatus.SetResult('invokeSmartContract_txId_' + txID);
    txStatus.SetVerification(true);
    if (client === null || client === 'undefined') {
        commUtils.log('Greeting: no client found.');
    }
    try {
        const processNPReq = () =>
            new Promise((resolve, reject) => client.processNPReq({inputs: args}, function(err, response) {
                if (err) {
                    commUtils.log('Greeting err:', err);
                    reject();
                    return;
                }
                commUtils.log('Greeting:', response.output);
                resolve();
            }));
        commUtils.log('==== Corda ==== await processNPReq');
        await processNPReq();
        commUtils.log('==== Corda ==== await processNPReq Done');
        txStatus.Set('time_order', Date.now());
        txStatus.Set('status', 'submitted');
        txStatus.SetStatusSuccess();
    } catch (err)
    {
        txStatus.SetStatusFail();
        commUtils.log('Failed to complete transaction [' + txID.substring(0, 5) + '...]:' + (err instanceof Error ? err.stack : err));
    }
    if(context !== null && context.engine) {
        context.engine.submitCallback(1);
    }
    commUtils.log('==== Corda ==== return txStatus');
    return txStatus;
}

module.exports.invokebycontext = invokebycontext;

/**
 * Submit a query to the given chaincode with the specified options.
 * @param {object} context The Fabric context.
 * @param {string} id The name of the chaincode.
 * @param {string} version The version of the chaincode.
 * @param {string} name The single argument to pass to the chaincode.
 * @param {string} fcn The chaincode query function name.
 * @return {Promise<object>} The result and stats of the transaction invocation.
 */
async function querybycontext(context, id, version, name, fcn) {
    name = name.split(' ');
    let txStatus = new TxStatus(id);
    try {
        const processNPReq = () =>
            new Promise((resolve, reject) => client.processNPReq({inputs: name}, function(err, response) {
                if (err) {
                    commUtils.log('Greeting err:', err);
                    reject();
                    return;
                }
                commUtils.log('Greeting:', response.output);
                resolve();
            }));
        await processNPReq();
        txStatus.SetResult('queryState_' + id);
        txStatus.SetStatusSuccess();
    } catch (err)
    {
        txStatus.SetStatusFail();
        commUtils.log('Failed to complete transaction [' + id.substring(0, 5) + '...]:' + (err instanceof Error ? err.stack : err));
    }
    if(context !== null && context.engine) {
        context.engine.submitCallback(1);
    }
    return txStatus;
}

module.exports.querybycontext = querybycontext;
