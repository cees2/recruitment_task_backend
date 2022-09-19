const { model, Schema } = require('mongoose');

const itemsModel = new Schema({
  name: {
    type: String,
    required: [true, 'An Item must have a name'],
    unique: true,
    trim: true,
    maxLength: [30, 'An item name must have less or equal than 30 characters'],
    minLength: [3, 'An item name must have at least 3 characters'],
  },
  itemType: {
    type: String,
    required: [true, 'An Item must have a type'],
    lowerCase: true,
    enum: [
      'pen',
      'printer',
      'tractor',
      'battery',
      'window',
      'computer',
      'office space',
    ],
  },
  amount: {
    type: Number,
    required: [true, 'An Item must have an amount'],
    min: 1,
    max: 10000,
  },
  description: {
    type: String,
    required: [true, 'An Item must have a description'],
    trim: true,
  },
  dateAdded: Date,
});

itemsModel.pre('save', function (next) {
  this.dateAdded = Date.now();
  next();
});

const Items = model('Items', itemsModel);

module.exports = Items;
