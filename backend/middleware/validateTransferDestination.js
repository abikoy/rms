const User = require('../models/User');

const validateTransferDestination = async (req, res, next) => {
  try {
    const { toDivision, recipientName } = req.body;

    // First check if division exists by looking for any user in that division
    const divisionExists = await User.exists({
      $or: [
        { department: toDivision },
        { school: toDivision }
      ]
    });

    if (!divisionExists) {
      return res.status(400).json({
        status: 'error',
        message: `The selected division "${toDivision}" does not exist in the system. Please select a valid division.`
      });
    }

    // Then check if recipient exists in that division
    const recipient = await User.findOne({
      fullName: { $regex: new RegExp('^' + recipientName + '$', 'i') },
      $or: [
        { department: toDivision },
        { school: toDivision }
      ]
    });

    if (recipient) {
      // Update the request body with the exact fullName from the database
      req.body.recipientName = recipient.fullName;
    }

    if (!recipient) {
      return res.status(400).json({
        status: 'error',
        message: `Recipient "${recipientName}" was not found in ${toDivision}. Please verify the recipient name.`
      });
    }

    next();
  } catch (error) {
    console.error('Error in transfer destination validation:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to validate transfer destination. Please try again.'
    });
  }
};

module.exports = validateTransferDestination;
