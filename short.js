'use strict';
var koa    = require( 'koa' );
var router = require( 'koa-router' )();
var app    = module.exports = koa();
var duid = require( 'short-duid' );

//Define app name and port for koa-cluster
var cpus        = require( 'os' ).cpus().length;
app.name        = "ShortDUID";
app.node_id     = 0;
app.nid         = process.env.NODE_APP_INSTANCE ? process.env.NODE_APP_INSTANCE : (process.pid % cpus); //nodejs instance ID
app.shard_id    = app.node_id + app.nid;
app.port        = 65000;
app.salt        = "this is my super secret salt";
app.epoch_start = 1433116800 * 1000; //Mon, 01 Jun 2015 00:00:00 GMT

//Instantiate short-duid
var duid_instance = new duid.init( app.shard_id, app.salt, app.epoch_start );

//Setup routes
router
    .get( '/', function*( next ) {
        this.body = {
            name: 'ShortDUID API'
        };
    } )
    .get( '/random_api_key/:length?', function*( next ) {
        this.body = yield([duid_instance.getRandomAPIKey( (this.params.length ? this.params.length : 64) )]);
    } )
    .get( '/random_password/:length?', function*( next ) {
        this.body = yield([duid_instance.getRandomPassword( (this.params.length ? this.params.length : 16) )]);
    } )
    .get( '/hashid_decode/:id', function*( next ) {
        this.body = yield(duid_instance.hashidDecode( this.params.id ));
    } )
    .get( '/hashid_encode/:id+', function*( next ) {
        this.body = yield([duid_instance.hashidEncode( this.params.id.split( '/' ) )]);
    } )
    .get( '/nduid/:count?', function*( next ) {
        this.body = yield(duid_instance.getDUIDInt( (this.params.count ? this.params.count : 1) ));
    } )
    .get( '/duid/:count?', function*( next ) {
        this.body = yield(duid_instance.getDUID( (this.params.count ? this.params.count : 1) ));
    } );

//Setup middleware
app
    .use( require( 'koa-json' )() )
    .use( require( 'koa-response-time' )() )
    .use( router.routes() )
    .use( router.allowedMethods() );

app.listen( app.port );