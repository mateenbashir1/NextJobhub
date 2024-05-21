const express = require('express');
const router = express.Router();
const userController = require('../controllers/usersController');
const authMiddleware = require('../middleware/auth');
const multerConfig = require('../middleware/usermulter');


// Create a user
router.post('/', userController.createUser);

// get users
router.get('/',userController.getAllUsers);

// gettotallNoUser for website
router.get('/gettotallNoUser',userController.gettotallNoUser);


// Update a user
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file.fieldname === 'profileImg') {
            cb(null, './public/userimages');
        } else if (file.fieldname === 'cv') {
            cb(null, './public/resume');
        }
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now();
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

// Multer upload configuration
const upload = multer({ storage: storage });
router.patch(
    '/:userId',
    authMiddleware,
    upload.fields([
        { name: 'profileImg', maxCount: 1 },
        { name: 'cv', maxCount: 1 }
    ]),
    userController.updateUser
);
// Delete a user
router.delete('/:userId', authMiddleware, userController.deleteUser);

router.get('/:userId', userController.getUserById);

// Middleware function to get a user by ID
router.param('id', userController.getUser);

router.post('/verification-email', userController.sendVerificationEmail);
router.post('/verifyEmailOTP', userController.verifyEmailOTP);


router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', userController.resetPassword);

module.exports = router;
