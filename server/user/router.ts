import type {Request, Response} from 'express';
import express from 'express';
// import FreetCollection from '../freet/collection';
import UserCollection from './collection';
import * as userValidator from '../user/middleware';
import * as util from './util';
import ProjectCollection from '../project/collection';
import UpdateCollection from '../update/collection';
import ThanksCollection from '../thanks/collection';
import EyesWantedCollection from '../eyeswanted/collection';

const router = express.Router();

/**
 * Get the signed in user
 * TODO: may need better route and documentation
 * (so students don't accidentally delete this when copying over)
 *
 * @name GET /api/users/session
 *
 * @return - currently logged in user, or null if not logged in
 */
router.get(
  '/session',
  [],
  async (req: Request, res: Response) => {
    const user = await UserCollection.findOneByUserId(req.session.userId);
    res.status(200).json({
      message: 'Your session info was found successfully.',
      user: user ? util.constructUserResponse(user) : null
    });
  }
);

/**
 * Sign in user.
 *
 * @name POST /api/users/session
 *
 * @param {string} email - The user's email
 * @param {string} password - The user's password
 * @return {UserResponse} - An object with user's details
 * @throws {403} - If user is already signed in
 * @throws {400} - If username or password is  not in the correct format,
 *                 or missing in the req
 * @throws {401} - If the user login credentials are invalid
 *
 */
router.post(
  '/session',
  [
    userValidator.isUserLoggedOut,
    userValidator.isValidEmail,
    userValidator.isValidPassword,
    userValidator.isAccountExists
  ],
  async (req: Request, res: Response) => {
    const user = await UserCollection.findOneByEmailAndPassword(
      req.body.email, req.body.password
    );
    req.session.userId = user._id.toString();
    res.status(201).json({
      message: 'You have logged in successfully',
      user: util.constructUserResponse(user)
    });
  }
);

/**
 * Sign out a user
 *
 * @name DELETE /api/users/session
 *
 * @return - None
 * @throws {403} - If user is not logged in
 *
 */
router.delete(
  '/session',
  [
    userValidator.isUserLoggedIn
  ],
  (req: Request, res: Response) => {
    req.session.userId = undefined;
    res.status(200).json({
      message: 'You have been logged out successfully.'
    });
  }
);

/**
 * Create a user account.
 *
 * @name POST /api/users
 *
 * @param {string} firstName - first name of user
 * @param {string} lastName - last name of user
 * @param {string} email - email of user
 * @param {string} password - user's password
 * @return {UserResponse} - The created user
 * @throws {400} - If names, email, or password are not formatted correctly
 * @throws {403} - If there is a user already logged in
 * @throws {409} - If username is already taken
 *
 */
router.post(
  '/',
  [
    userValidator.isUserLoggedOut,
    userValidator.isValidEmail,
    userValidator.isValidName,
    userValidator.isEmailNotAlreadyInUse,
    userValidator.isValidPassword
  ],
  async (req: Request, res: Response) => {
    const user = await UserCollection.addOne(req.body.firstName, req.body.lastName, req.body.email, req.body.password);
    req.session.userId = user._id.toString();
    // Add to global/default project for user testing purposes
    const globalProjId = '6399272fe8406a194eec57a3';
    const globalProj = await ProjectCollection.findOne(globalProjId);
    globalProj.participants.push(req.session.userId);
    await globalProj.save();
    await EyesWantedCollection.addUserToAllInProject(req.session.userId, globalProjId);
    res.status(201).json({
      message: `Your account was created successfully. You have been logged in as ${user.firstName + ' ' + user.lastName}`,
      user: util.constructUserResponse(user)
    });
  }
);

/**
 * Update a user's profile.
 *
 * @name PATCH /api/users
 *
 * @param {string} firstName - first name of user
 * @param {string} lastName - last name of user
 * @param {string} email - The user's new email
 * @param {string} password - The user's new password
 * @return {UserResponse} - The updated user
 * @throws {403} - If user is not logged in
 * @throws {409} - If email already taken
 * @throws {400} - If email or password are not of the correct format
 */
router.patch(
  '/',
  [
    userValidator.isUserLoggedIn,
    userValidator.isValidOrUndefinedEmail,
    userValidator.isValidOrUndefinedFirstName,
    userValidator.isValidOrUndefinedLastName,
    userValidator.isEmailNotAlreadyInUse,
    userValidator.isValidOrUndefinedPassword
  ],
  async (req: Request, res: Response) => {
    const userId = (req.session.userId as string) ?? ''; // Will not be an empty string since its validated in isUserLoggedIn
    const user = await UserCollection.updateOne(userId, req.body);
    res.status(200).json({
      message: 'Your profile was updated successfully.',
      user: util.constructUserResponse(user)
    });
  }
);

/**
 * Delete a user.
 *
 * @name DELETE /api/users
 *
 * @return {string} - A success message
 * @throws {403} - If the user is not logged in
 */
router.delete(
  '/',
  [
    userValidator.isUserLoggedIn
  ],
  async (req: Request, res: Response) => {
    const userId = (req.session.userId as string) ?? ''; // Will not be an empty string since its validated in isUserLoggedIn
    
    // delete updates authored by the user, and eyeswanted/thanks corresponding to those
    const authoredUpdates = await UpdateCollection.findAllByAuthorId(userId);
    const authoredUpdateIds = authoredUpdates.map((update) => update._id);
    await EyesWantedCollection.deleteMany(authoredUpdateIds);
    await ThanksCollection.deleteManybyUpdateIds(authoredUpdateIds);
    await UpdateCollection.deleteManyByAuthorId(userId);

    // delete thanks given by the user
    await ThanksCollection.deleteManybyUser(userId);

    // also delete updates and corresponding thanks/eyes wanted in projects owned by the user
    // which may not necessarily be authored by the user
    const projects = await ProjectCollection.findAllByCreator(userId);
    const projectIds = projects.map((project) => project._id);
    const updates = await UpdateCollection.findAllByProjectIds(projectIds);
    const updateIds = updates.map((update) => update._id);
    await EyesWantedCollection.deleteMany(updateIds);
    await ThanksCollection.deleteManybyUpdateIds(updateIds);
    await UpdateCollection.deleteMany(updateIds);
    await ProjectCollection.deleteMany(userId);

    // pull user from projects they were part of 
    await ProjectCollection.removeUser(userId);

    await UserCollection.deleteOne(userId);
    
    req.session.userId = undefined;
    res.status(200).json({
      message: 'Your account has been deleted successfully.'
    });
  }
);

export {router as userRouter};
