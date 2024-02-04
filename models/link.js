const mongoose = require('mongoose');
const shortId = require('shortid')
const linkSchema = new mongoose.Schema({
    full:{
        type:String,
        required: true
    },
    tiny:{
        type:String,
        required: true,
        default: ()=> shortId.generate()
    },
    clicks:{
        type: Number,
        required:true,
        default:0
    }
})

const LINK = mongoose.model("link", linkSchema);

module.exports = LINK