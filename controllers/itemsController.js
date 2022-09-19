const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Items = require('../models/itemsModel');

exports.getAllItems = catchAsync(async (request, response, next) => {
  const items = await Items.find();

  response.status(200).json({
    status: 'success',
    message: 'eluwa',
    numOfItems: items.length,
    data: {
      items,
    },
  });
});

exports.createItem = catchAsync(async (request, response, next) => {
  const { name, amount, description, dateAdded, itemType } = request.body;

  const item = await Items.create({
    itemType,
    name,
    amount,
    description,
    dateAdded,
  });

  response.status(201).json({
    status: 'success',
    data: {
      item,
    },
  });
});

exports.updateItem = catchAsync(async (request, response, next) => {
  const { itemId } = request.params;
  const { body: newValues } = request;

  const updatedItem = await Items.findByIdAndUpdate(itemId, newValues);

  if (!updatedItem)
    next(new AppError('Item with that ID does not exist.', 404));

  response.status(200).json({
    status: 'success',
    message: 'Item has been successfuly updated',
    data: {
      updatedItem,
    },
  });
});

exports.getOneTypeOfItems = catchAsync(async (request, response, next) => {
  const { itemType } = request.params;

  const items = await Items.find({ itemType });

  if (!items.length)
    return next(new AppError('Could not find this type of items', 400));

  response.status(200).json({
    status: 'success',
    itemsFound: items.length,
    data: {
      items,
    },
  });
});
