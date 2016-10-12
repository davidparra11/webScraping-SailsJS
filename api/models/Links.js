/**
 * Links.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
	autoCreatedAt: false,
	autoUpdatedAt: false,

  attributes: {
        id: {
            type: 'integer',
            autoIncrement: true,
            primaryKey: true
        },
        link: {
            type: 'string'
        },
        creationDate: {
	        columnName: 'cre_dt',
	        type: 'datetime',
	        defaultsTo: function() {return new Date();}
    	}
    }
};

