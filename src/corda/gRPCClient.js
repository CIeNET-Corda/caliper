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

/**
 * Return the context associated with the given callback module name.
 * @return {Promise<object>} The created Corda gRPC context.
 */
function getClient() {
    // commUtils.log('==== Corda ==== getClient');
    const np_proto = grpc.loadPackageDefinition(packageDefinition).np;
    let client = new np_proto.NPGRPCAdapter('localhost:50051', grpc.credentials.createInsecure());
    return Promise.resolve({client: client});
}

module.exports.getClient = getClient;

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
    commUtils.log('==== Corda ==== invokebycontext', context, args, args.length, timeout);
    let txID = Date.now().toString();
    let txStatus = new TxStatus(txID);
    txStatus.SetFlag(0);
    txStatus.Set('time_endorse', Date.now());
    txStatus.SetResult('invokeSmartContract_txId_' + txID);
    txStatus.SetVerification(true);
    if (context.client === null || context.client === 'undefined') {
        commUtils.log('Greeting: no client found.');
    }
    if(context && context.engine) {
        context.engine.submitCallback(1);
    }
    try {
        const resolved = (response) => {
            commUtils.log('Greeting:', response.output);
            txStatus.Set('time_order', Date.now());
            txStatus.Set('status', 'submitted');
            txStatus.SetStatusSuccess();
        };
        const rejected = (err) => {
            commUtils.log('Greeting err:', err);
            txStatus.SetStatusFail();
        };
        const processNPReq = () =>
            new Promise((resolve, reject) => context.client.processNPReq({inputs: args}, function(err, response) {
                commUtils.log('processNPReq');
                if (err) {
                    reject(err);
                    return;
                }
                resolve(response);
            }));
        commUtils.log('==== Corda ==== await processNPReq');
        processNPReq().then(resolved, rejected);
        commUtils.log('==== Corda ==== await processNPReq Done');
    } catch (err)
    {
        commUtils.log('Failed to complete transaction [' + txID.substring(0, 5) + '...]:' + (err instanceof Error ? err.stack : err));
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
    if (context.client === null || context.client === 'undefined') {
        commUtils.log('Greeting: no client found.');
    }
    try {
        const resolved = (response) => {
            commUtils.log('Greeting:', response.output);
            txStatus.SetResult('queryState_' + id);
            txStatus.SetStatusSuccess();
        };
        const rejected = (err) => {
            commUtils.log('Greeting err:', err);
            txStatus.SetStatusFail();
        };
        const processNPReq = () =>
            new Promise((resolve, reject) => context.client.processNPReq({inputs: name}, function(err, response) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(response);
            }));
        commUtils.log('==== Corda ==== await processNPReq');
        processNPReq().then(resolved, rejected);
        commUtils.log('==== Corda ==== await processNPReq Done');
    } catch (err)
    {
        commUtils.log('Failed to complete transaction [' + id.substring(0, 5) + '...]:' + (err instanceof Error ? err.stack : err));
    }
    if(context && context.engine) {
        context.engine.submitCallback(1);
    }
    commUtils.log('==== Corda ==== return txStatus');
    return txStatus;
}

module.exports.querybycontext = querybycontext;
