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
        },
        TIPO_LISTA: {
            type: 'string',
            defaultsTo: 'BOLETINES PROCURADURIA'
        },
        CODIGO: {
            type: 'string',
            defaultsTo: 'BOL12345678'
        },
        NOMBRECOMPLETO: {
            type: 'string',
            defaultsTo: ''
        },
        PRIMER_NOMBRE: {
            type: 'string',
            defaultsTo: ''
        },
        SEGUNDO_NOMBRE: {
            type: 'string',
            defaultsTo: ''
        },
        PRIMER_APELLIDO: {
            type: 'string',
            defaultsTo: ''
        },
        SEGUNDO_APELLIDO: {
            type: 'string',
            defaultsTo: ''
        },
        TIPO_PERSONA: {
            type: 'string',
            defaultsTo: 'INDIVIDUO' 
        },
        TIPO_ID: {
            type: 'string',
            defaultsTo: 'CC'
        },
        IDs: {
            type: 'string',
            defaultsTo: ''
        },
        RELACIONADO_CON: {
            type: 'string',
            defaultsTo: '',
            size: 5000
        },
        ROL_O_DESCRIPCION1: {
            type: 'string',
            defaultsTo: '',
            size: 3000
        },
        ROL_O_DESCRIPCION2: {
            type: 'string',
            defaultsTo: ''
        },
        AKA: {
            type: 'string',
            defaultsTo: ''
        },
        FUENTE: {
            type: 'string',
            defaultsTo: 'HTTP://WWW.PROCURADURIA.GOV.CO',
        },
        FECHA_UPDATE: {
            type: 'string',
            defaultsTo: ''
        },
        FECHA_FINAL_ROL: {
            type: 'string',
            defaultsTo: ''
        },      
        NACIONALIDAD_PAISDEORIGEN: {
            type: 'string',
            defaultsTo: 'COLOMBIA' 
        },
        DIRECCION: {
            type: 'string',
            defaultsTo: ''
        },
        ESTADO: {
            type: 'string',
            defaultsTo: ''
        },
        LLAVEIMAGEN: {
            type: 'string',
            defaultsTo: ''
        },
        REGISTRO: {
            type: 'integer'
        }
    }
};

