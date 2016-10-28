'use strict';

const Hashmap  = require( 'hashmap' );
const Duid     = require( 'short-duid' );
const Redis    = require( './redis' );
const Sqlite   = require( './sqlite' );
const db       = new Sqlite();
const config   = require( '../config/custom' );
const util     = require( 'util' );
const iterator = new Hashmap();
const redis    = new Redis();
const duid     = new Duid.init();

class Short {
    *index() {
        this.body = {
            result : "Welcome!",
            fork_me: "https://github.com/fyibmsd/biturl.git"
        }
    }

    *redirect() {
        let hash = this.params.hash;
        let url  = iterator.get( hash );

        if (util.isUndefined( url ))
            url = yield redis.get( hash );

        if (util.isUndefined( url )) {
            let ret = yield db.find( hash );
            if (!util.isUndefined( ret )) {
                url = ret.url;
                yield redis.set( url, hash );
            }
        }

        if (util.isUndefined( url ))
            return this.response.redirect( '/' );

        if (!iterator.has( hash ))
            iterator.set( hash, url );

        this.response.status = 301;
        return this.response.redirect( url );
    }

    *generate() {
        if (util.isUndefined( this.request.body ) || util.isUndefined( this.request.body.url )) {
            this.body = {
                status : 400,
                message: "Please check your params!"
            };

            return this.body;
        }

        let url = this.request.body.url;

        let id, hash;

        if (iterator.has( url )) {
            hash = iterator.get( url );
        } else {
            id   = yield redis.getCode();
            hash = Short.hash( id );

            iterator.set( url, hash );
            yield redis.set( url, hash );
            db.save( url, hash );
        }

        this.body = {
            status   : 0,
            short_url: `${config.host}${hash}`
        };
    }

    static hash( id ) {
        return duid.hashidEncode( [id] );
    }
}

module.exports = Short;