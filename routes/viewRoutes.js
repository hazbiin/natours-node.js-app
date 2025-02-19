const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');

const router = express.Router();

// test
// router.get('/', (req, res) => {
//   res.status(200).render('base', {
//     tour: 'The Forest Hiker', // this variables are called locals in pug
//     user: 'Jonas',
//   });
// });

router.get(
  '/',
  bookingController.createBookingCheckout,
  authController.isLoggedIn,
  viewsController.getOverview,
);
router.get('/tour/:slug', authController.isLoggedIn, viewsController.getTour);
router.get('/login', authController.isLoggedIn, viewsController.getLoginForm);
router.get('/me', authController.protect, viewsController.getAccount);
router.get('/my-tours', authController.protect, viewsController.getMyTours);


// this is a new route, created for form data validation. 
router.post(
  '/submit-user-data',
  authController.protect,
  viewsController.updateUserData,
);

module.exports = router;

