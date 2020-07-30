"use strict";
/**
* This shows how to use standard Apollo client on Node.js
*/

global.WebSocket = require('ws');
require('es6-promise').polyfill();
require('isomorphic-fetch');

// Require exports file with endpoint and auth info

// Require AppSync module
const AWS = require('aws-sdk/global');
const AUTH_TYPE = require('aws-appsync/lib/link/auth-link').AUTH_TYPE;
const AWSAppSyncClient = require('aws-appsync').default;

// Import gql helper and craft a GraphQL query
const gql = require('graphql-tag');
const query = gql(`
query AllPosts {
allPost {
    __typename
    id
    title
    content
    author
    version
}
}`);

// Set up a subscription query
const subquery = gql(`
subscription NewPostSub {
newPost {
    __typename
    id
    title
    author
    version
}
}`);

const config = {
    url: process.env.APPSYNC_ENDPOINT,
    region: process.env.AWS_REGION,
    auth: {
      type: AUTH_TYPE.AWS_IAM,
      credentials: AWS.config.credentials,
    },
    disableOffline: true
};

// Set up Apollo client
const client = new AWSAppSyncClient(config);

exports.handler = (event, context, callback) => {
    client.hydrated().then(function (client) {
        //Now run a query
        client.query({ query: query })
        client.query({ query: query, fetchPolicy: 'network-only' })   //Uncomment for AWS Lambda
            .then(function logData(data) {
                console.log('results of query: ', data);
            })
            .catch(console.error);

        // //Now subscribe to results
        // const observable = client.subscribe({ query: subquery });

        // const realtimeResults = function realtimeResults(data) {
        //     console.log('realtime data: ', data);
        // };

        // observable.subscribe({
        //     next: realtimeResults,
        //     complete: console.log,
        //     error: console.log,
        // });
    });
}