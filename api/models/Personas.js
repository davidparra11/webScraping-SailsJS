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
		ORIGEN_LISTA: {
			type: 'string',
			defaultsTo: 'COLOMBIA'
		},
		TIPO_LISTA: {
			type: 'string',
			defaultsTo: 'CONTRATISTAS DEL ESTADO'
		},
		CODIGO: {
			type: 'string',
			defaultsTo: 'TMP12345678'
		},
		NOMBRECOMPLETO: {
			type: 'string'
		},
		PRIMER_NOMBRE: {
			type: 'string',
		},
		SEGUNDO_NOMBRE: {
			type: 'string'
		},
		PRIMER_APELLIDO: {
			type: 'string'
		},
		SEGUNDO_APELLIDO: {
			type: 'string'
		},
		TIPO_PERSONA: {
			type: 'string',
			defaultsTo: 'INDIVIDUO' //defaultsTo: 'COLOMBIA'
		},
		TIPO_ID: {
			type: 'string',
			defaultsTo: 'CC'
		},
		IDs: {
			type: 'string'
		},
		RELACIONADO_CON: {
			type: 'string'
		},
		ROL_O_DESCRIPCION1: {
			type: 'string'
		},
		ROL_O_DESCRIPCION2: {
			type: 'string'
		},
		AKA: {
			type: 'string'
		},
		FUENTE: {
			type: 'string',
			defaultsTo: 'HTTP://WWW.CONTRALORIAGEN.GOV.CO'
		},
		FECHA_UPDATE: {
			columnName: 'FECHA_UPDATE',
			type: 'string',
		},
		FECHA_FINAL_ROL: {
			type: 'string'
		},		
		NACIONALIDAD_PAISDEORIGEN: {
			type: 'string',
			defaultsTo: 'COLOMBIA' 
		},
		DIRECCION: {
			type: 'string',
		},
		ESTADO: {
			type: 'string'
		},
		LLAVEIMAGEN: {
			type: 'string'
		},
		REGISTRO: {
			type: 'integer'
		},
	}
};