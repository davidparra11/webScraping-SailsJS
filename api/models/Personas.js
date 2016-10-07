/**
 * Personas.js
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
		nombre: {
			type: 'string',
			size: 120
		},
		correo: {
			type: 'string'
		},
		telefono: {
			type: 'string'
		},
		otro: {
			type: 'string',
			size: 4000
		},
		creationDate: {
			columnName: 'cre_dt',
			type: 'datetime',
			defaultsTo: function() {
				return new Date();
			}
		}
	}
};