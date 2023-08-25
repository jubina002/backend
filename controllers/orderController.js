const authGuard = require('../auth/authGuard');
const orderModal = require('../model/orderModal');

const router = require('express').Router();

router.get('/', (req, res) => {
    res.send('Order API')
});

router.post('/create', authGuard, async (req, res) => {
    const {cart, totalAmount, shippingAddress} = req.body;

    if(!cart || !totalAmount || !shippingAddress){
        return res.send({error: "order fields are empty!"})
    }
try{
const order = new orderModal({
    cart,
    totalAmount,
    shippingAddress,
    user: req.user.id
})
await order.save();
res.send({
    message: "Order create Successfully",
    order
})
}catch(error){
    res.send({error: error.message})
}
});

//get order by user id
router.get('/myOrders', authGuard, async (req, res) => {
    try{
const orders= await orderModal.find({user: req.user.id}).sort({orderedDate: -1})
res.status(200).send({
    success: true,
    orders
});
    }catch(error){
        console.log(error.message);
        res.status(500).send({error: error.message})
    }
});

//admin all orders
router.get('/allorders',  async (req, res) => {
    try{
        const orders = await orderModal.find({}).sort({orderedDate: -1})
        res.status(200).send({
            success: true,
            orders
        })
    }catch(error){
        console.log(error.message);
        res.status(500).send({error: error.message})
    }
})

router.put('/change_status/:id', async (req, res) => {
try{
const order = await orderModal.findById(req.params.id);
order.status = req.body.status;
await order.save();
res.status(200).send({
    success: true,
    message: "Order status updated successfully!",
})
}catch(error){
    res.status(500).send({error: error.message})
}
});

module.exports = router;