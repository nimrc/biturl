'use strict';

const Hashmap  = require( 'hashmap' );
const Duid     = require( 'short-duid' );
const Redis    = require( './redis' );
const Mongo    = require( './mongo' );
const config   = require( '../config/custom' );
const iterator = new Hashmap();
const redis    = new Redis();
const mongo    = new Mongo();
const duid     = new Duid.init();

class Short {
    *redirect() {
        let hash = this.params.hash;
        let url  = yield redis.get( hash );

        this.response.status = 301;
        return this.response.redirect( url );
    }

    *generate() {
        let url = this.request.body.url;
        let id, hash;

        if (iterator.has( url )) {
            hash = iterator.get( url );
        } else {
            id   = yield redis.getCode();
            hash = Short.hash( id );

            iterator.set( url, hash );

            yield redis.set( url, hash );
            yield mongo.create( id, url, hash );
        }

        this.body = {
            url: `${config.host}${hash}`
        };
    }

    static hash( id ) {
        return duid.hashidEncode( [id] );
    }
}

module.exports = Short;