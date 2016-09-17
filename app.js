'use strict';

const koa    = require( 'koa' );
const router = require( 'koa-router' )();
const app    = koa();
const Short  = require( './libs/short' );
const short  = new Short();

app.use( require( 'koa-body-parser' )() );

router
    .get('/:hash', short.redirect)
    .post( '/generate', short.generate );

app.use( require( 'koa-json' )() );
app.use( router.routes() );

app.listen( 4000 );
