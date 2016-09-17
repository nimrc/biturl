'use strict';

const koa    = require( 'koa' );
const router = require( 'koa-router' )();
const app    = koa();
const Short  = require( './libs/short' );
const short  = new Short();
const port   = 4000;

app.use( require( 'koa-body-parser' )() );
app.use( require( 'koa-json' )() );

router
    .get( '/', short.index )
    .get( '/:hash', short.redirect )
    .post( '/generate', short.generate );

app.use( router.routes() );

app.listen( port, () => {
    console.log( `Server running at 127.0.0.1:${port}` );
} );
