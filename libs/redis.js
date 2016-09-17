'use strict';

const Mongo    = require( './mongo' );
const bluebird = require( 'bluebird' );
const redis    = require( 'redis' );
const config   = require( '../config/redis' );
const queue    = 'shorturl';

class Redis {
    constructor() {
        this.client      = redis.createClient( config.port, config.host, config.options );
        this.client.incr = bluebird.promisify( this.client.incr );
        this.client.hget = bluebird.promisify( this.client.hget );
        this.client.hset = bluebird.promisify( this.client.hset );

        if (typeof config.auth == 'string')
            this.client.auth( config.auth, ( err, result ) => console.log( "redis: ", err, result ) )
    }

    *getCode() {
        return yield this.client.incr( 'short' );
    }

    *get( hash ) {
        let url = yield this.client.hget( queue, hash );

        if (url === null) {
            let data = yield Mongo.find( hash );
            url      = data.url;

            if (url != 'undefined' && url != undefined)
                yield this.set( url, hash );
        }

        return url;
    }


    *set( url, hash ) {
        return yield this.client.hset( queue, hash, url );
    }
}

module
    .exports = Redis;
