'use strict';

const Koa        = require( 'koa' );
const router     = require( 'koa-router' )();
const config     = require( './config/custom' );
const bodyParser = require( 'koa-bodyparser' );
const Short      = require( './libs/short' );
const app        = new Koa();

global.logger = require( 'log4js' ).getLogger( config.host );

app.use( async(ctx, next) => {
    logger.info( `[${ctx.request.method}] ${ctx.request.originalUrl} ${ctx.request.ip}` );
    await next();
} );

app.use(bodyParser());

router
    .get( '/', Short.index )
    .get( '/:hash', Short.redirect )
    .post( '/generate', Short.generate );

app.use( router.routes(), router.allowedMethods() );

module.exports = app.listen( config.port, () => logger.info( `Server running at 127.0.0.1:${config.port}` ) );
