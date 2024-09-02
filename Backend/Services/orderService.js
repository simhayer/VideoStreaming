const {User, Order} = require('../models/user');

async function handleOrderCreation(
  buyerUsername,
  sellerUsername,
  amount,
  product,
) {
  try {
    console.log(
      'Creating order:',
      buyerUsername,
      sellerUsername,
      amount,
      product,
    );
    // Find the buyer and seller by their usernames
    const buyer = await User.findOne({username: buyerUsername});
    const seller = await User.findOne({username: sellerUsername});

    if (!buyer || !seller) {
      console.log('Buyer or seller not found.');
      return {success: false, message: 'Buyer or seller not found'};
    }

    // Create and save the order
    const newOrder = new Order({
      buyer: buyer._id,
      seller: seller._id,
      amount,
      product, // Assuming products is passed correctly
      status: 'Pending',
      paymentMethod: 'Stripe', // or the appropriate payment method
    });

    await newOrder.save();

    console.log('Order saved successfully:', newOrder);
    return {success: true, order: newOrder};
  } catch (error) {
    console.error('Error saving order:', error);
    return {success: false, message: 'Error saving order', error};
  }
}

const getAllOrdersForBuyer = async (req, res) => {
  console.log('Getting all orders for buyer');
  console.log('Request body:', req.body);
  const {buyerUsername} = req.body;

  console.log('Buyer username:', buyerUsername);

  try {
    // Find the buyer by username
    const buyer = await User.findOne({username: buyerUsername});

    console.log('Buyer found:', buyer);

    if (!buyer) {
      return res.json({message: 'Buyer not found'});
    }

    console.log('Buyer found:', buyer);

    // Find all orders for this buyer
    const orders = await Order.find({buyer: buyer._id})
      .populate('seller', 'fullname email username')
      .populate('product');

    console.log('Orders found:', orders);

    return res.json({orders});
  } catch (error) {
    console.error('Error retrieving orders for buyer:', error);
    return res.json({message: 'Error retrieving orders', error});
  }
};

const getAllOrdersForSeller = async (req, res) => {
  console.log('Getting all orders for seller', req.body);
  const {sellerUsername} = req.body;
  try {
    // Find the seller by username
    const seller = await User.findOne({username: sellerUsername});

    if (!seller) {
      return res.json({message: 'Seller not found'});
    }

    // Find all orders for this seller
    const orders = await Order.find({seller: seller._id}).populate(
      'buyer',
      'fullname email username',
    );

    return res.json({orders});
  } catch (error) {
    console.error('Error retrieving orders for seller:', error);
    return res.json({message: 'Error retrieving orders', error});
  }
};

module.exports = {
  handleOrderCreation,
  getAllOrdersForBuyer,
  getAllOrdersForSeller,
};
