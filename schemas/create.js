const {Schema, model} = require('mongoose');


const pasteSchema = new Schema({
    url: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    views: {
        type: Number,
        default: 0,
        required: true
    },
    max_views: {
        type: Number,
        required: true
    },
    expires: {
        type: Date,
        index: { expires: 0 } // TTL auto-delete
    }
}) 

module.exports = new model('Paste', pasteSchema);


