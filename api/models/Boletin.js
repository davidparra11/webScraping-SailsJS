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
        ORIGEN_LISTA: {
            type: 'string',
            defaultsTo: 'COLOMBIA'
        }
    }
};

