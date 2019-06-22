const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const productSchema = new Schema({
    title: {
        type: String,
        required: true,
        default: 'New Product'
    },
    price: {
        type: Number,
        required: true,
        default: 0.00
    },
    description: {
        type: String,
        required: true,
        default: 'A new product to test.'
    },
    imageUrl: {
        type: String,
        required: true,
        default: 'https://www.publicdomainpictures.net/pictures/10000/velka/1-1210009435EGmE.jpg'
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }

});


module.exports = mongoose.model('Product', productSchema);