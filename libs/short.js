'use strict';

const Hashmap  = require( 'hashmap' );
const Duid     = require( 'short-duid' );
const redis    = require( './redis' );
const db       = require( './sqlite' );
const config   = require( '../config/custom' );
const util     = require( 'util' );
const iterator = new Hashmap();
const duid     = new Duid.init();

class Short {
    static async index(ctx, next) {
        return ctx.body = {
            result : "Welcome!",
            fork_me: "https://github.com/fyibmsd/biturl.git"
        };
    }

    static async redirect(ctx, next) {
        let hash = ctx.params.hash;
        let url  = iterator.get( hash );

        if (util.isUndefined( url )) {
            logger.info( `search hash of ${hash} from cache` );

            url = await redis.get( hash );
        }

        if (util.isUndefined( url )) {
            logger.warn( `cache of ${hash} not hit, search from db` );

            let ret = await db.find( hash );
            if (!util.isUndefined( ret )) {
                logger.info( `rebuild cache of ${hash} with link: ${ret.url}` );

                url = ret.url;
                await redis.set( url, hash );
            }
        }

        if (util.isNullOrUndefined( url )) {
            logger.warn( `hash ${hash} does not exist in db, redirect to index` );

            return ctx.response.redirect( '/' );
        }

        if (!iterator.has( hash ))
            iterator.set( hash, url );

        return ctx.response.redirect( url );
    }

    static async generate(ctx, next) {
        if (util.isUndefined( ctx.request.body ) || util.isUndefined( ctx.request.body.url )) {
            ctx.response.status = 400;

            return ctx.body = {
                status : 400,
                message: "Please check your params!"
            };
        }

        let url = ctx.request.body.url;
        let id, hash;

        if (iterator.has( url )) {
            hash = iterator.get( url );
        } else {
            id   = await redis.getCode();
            hash = Short.hash( id );

            logger.info( `generate new hash ${hash} for link ${url}` );

            iterator.set( url, hash );

            if (!iterator.has( hash ))
                iterator.set( hash, url );

            await redis.set( url, hash );
            db.save( url, hash );
        }

        return ctx.body = {
            status   : 0,
            short_url: `${config.host}/${hash}`
        };
    }

    static hash(id) {
        return duid.hashidEncode( [id] );
    }
}

module.exports = Short;
