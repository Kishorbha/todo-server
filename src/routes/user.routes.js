import { Router } from 'express'
import passport from 'passport'
import { UserRolesEnum } from '../constants.js'
import {
  assignRole,
  changeCurrentPassword,
  forgotPasswordRequest,
  getCurrentUser,
  handleSocialLogin,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  resendEmailVerification,
  resetForgottenPassword,
  updateUserAvatar,
  verifyEmail,
} from '../controllers/auth/user.controllers.js'
import { verifyJWT, verifyPermission } from '../middlewares/auth.middlewares.js'
import '../passport/index.js' // import the passport config
import {
  userAssignRoleValidator,
  userChangeCurrentPasswordValidator,
  userForgotPasswordValidator,
  userLoginValidator,
  userRegisterValidator,
  userResetForgottenPasswordValidator,
} from '../validators/user/user.validators.js'
import { validate } from '../validators/validate.js'
import { upload } from '../middlewares/multer.middlewares.js'
import { mongoIdPathVariableValidator } from '../validators/common/mongodb.validators.js'

const router = Router()

// Unsecured route
router.route('/register').post(userRegisterValidator(), validate, registerUser)
router.route('/login').post(userLoginValidator(), validate, loginUser)
router.route('/refresh-token').get(refreshAccessToken)
router.route('/verify-email/:verificationToken').get(verifyEmail)

router
  .route('/forgot-password')
  .post(userForgotPasswordValidator(), validate, forgotPasswordRequest)
router
  .route('/reset-password/:resetToken')
  .post(userResetForgottenPasswordValidator(), validate, resetForgottenPassword)

// Secured routes
router.route('/logout').post(verifyJWT, logoutUser)
router
  .route('/avatar')
  .patch(verifyJWT, upload.single('avatar'), updateUserAvatar)
router.route('/current-user').get(verifyJWT, getCurrentUser)
router
  .route('/change-password')
  .post(
    verifyJWT,
    userChangeCurrentPasswordValidator(),
    validate,
    changeCurrentPassword
  )
router
  .route('/resend-email-verification')
  .post(verifyJWT, resendEmailVerification)
router
  .route('/assign-role/:userId')
  .post(
    verifyJWT,
    verifyPermission([UserRolesEnum.ADMIN]),
    mongoIdPathVariableValidator('userId'),
    userAssignRoleValidator(),
    validate,
    assignRole
  )

// SSO routes
router.route('/google').get(
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  }),
  (req, res) => {
    res.send('redirecting to google...')
  }
)

router
  .route('/auth0')
  .get(
    passport.authenticate('auth0', { scope: ['openid', 'email', 'profile'] }),
    (req, res) => {
      res.setHeader('Content-Type', 'text/html')
      res.send('redirecting to auth0...')
    }
  )

router.route('/google/callback').get(
  passport.authenticate('google', {
    failureRedirect: `${process.env.CLIENT_SSO_REDIRECT_URL}/400`,
  }),
  handleSocialLogin
)

router
  .route('/auth0/callback')
  .get(
    passport.authenticate('auth0', {
      failureRedirect: `${process.env.CLIENT_SSO_REDIRECT_URL}/400`,
    }),
    handleSocialLogin
  )

export default router
