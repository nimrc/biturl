'use strict';

const sqlite3  = require( "sqlite3" );
const bluebird = require( "bluebird" );
const config   = require( "../config/db" );
const handler  = new sqlite3.Database( `${__dirname}/../${config.path}` );

class Sqlite {
    static init(handler) {
        handler.run( "CREATE TABLE IF NOT EXISTS bitm (id integer primary key AutoIncrement, url text, hash varchar(20), timestamp integer)", () => {
            handler.run( "CREATE UNIQUE INDEX IF NOT EXISTS hash_index on bitm (hash)" );
            handler.save_scheme     = handler.prepare( "INSERT INTO bitm (url, hash, timestamp) VALUES (?, ?, ?)" );
            handler.find_scheme     = handler.prepare( "SELECT * FROM bitm where hash = ?" );
            handler.find_scheme.get = bluebird.promisify( handler.find_scheme.get );
        } );
    }

    static async find(hash) {
        return await handler.find_scheme.get( hash );
    }

    static save(url, hash) {
        handler.save_scheme.run( url, hash, (new Date()).getTime() );
    }
}

Sqlite.init( handler );

module.exports = Sqlite;
