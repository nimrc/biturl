'use strict';

const sqlite3  = require( "sqlite3" );
const bluebird = require( "bluebird" );
const config   = require( "../config/db" );

class Sqlite {
    constructor() {
        this.handler = new sqlite3.Database( `${__dirname}/../${config.path}` );

        this.init();
    }

    init() {
        this.handler.run( "CREATE TABLE IF NOT EXISTS bitm (id integer primary key AutoIncrement, url text, hash varchar(20), timestamp integer)", () => {
            this.handler.run( "CREATE UNIQUE INDEX IF NOT EXISTS hash_index on bitm (hash)" );
            this.save_scheme = this.handler.prepare( "INSERT INTO bitm (url, hash, timestamp) VALUES (?, ?, ?)" );
            this.find_scheme = this.handler.prepare( "SELECT * FROM bitm where hash = ?" );

            this.find_scheme.get = bluebird.promisify( this.find_scheme.get );
        } );

    }

    *find( hash ) {
        return yield this.find_scheme.get( hash );
    }

    save( url, hash ) {
        this.save_scheme.run( url, hash, (new Date()).getTime() );
    }
}

module.exports = Sqlite;
