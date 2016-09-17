'use strict';

const redis  = require( 'redis' );
const config = require( '../config/redis' );
const queue  = 'shorturl';

class Redis {
    constructor() {
        this.client = redis.createClient( config.port, config.host, config.options );
        if (typeof config.auth == 'string')
            this.client.auth( config.auth, ( err, result ) => console.log( "redis: ", err, result ) )
    }


    *getCode() {
        return new Promise( ( resolve, reject ) => {
            this.client.incr( 'short', ( err, res ) => {
                if (err === null)
                    resolve( res );
                else
                    reject( err );
            } );
        } );
    }

    *get( hash ) {
        return new Promise( ( resolve, reject ) => {
            this.client.hget( queue, hash, ( err, res ) => {
                if (err === null)
                    resolve( res );
                else
                    reject( err );
            } );

        } );
    }

    set( url, hash ) {
        return new Promise( ( resolve, reject ) => {
            this.client.hset( queue, hash, url, ( err, res ) => {
                if (err === null)
                    resolve( res );
                else
                    reject( err );
            } );
        } );
    }
}

module.exports = Redis;
