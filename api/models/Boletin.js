/**
 * Boletin.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
 
    //connection: 'mysql',
    autoCreatedAt: false,
	autoUpdatedAt: false,
	
    attributes: {
        id: {
            type: 'integer',
            autoIncrement: true,
            primaryKey: true
        },
        titulo: {
            type: 'string'
        },
        boletin: {
            type: 'string',
            size: 100
        },
        textoCompleto: {
            type: 'string', //varchar(max)
            size: 10000
        },
        textoUnoDos: {
            type: 'string',
            size: 4000
        },
        fuente: {
            type: 'string'
        },
        fecha: {
            type: 'string'
        },
        urlWeb: {
            type: 'string'
        },
        localPdf: {
            type: 'string',
            size: 120
        },
        localHtml: {
            type: 'string',
            size: 120
        },
        creationDate: {
	        columnName: 'cre_dt',
	        type: 'datetime',
	        defaultsTo: function() {return new Date();}
    	}
    }
};

