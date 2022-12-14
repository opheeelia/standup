import type {HydratedDocument, Types} from 'mongoose';
import type {Thanks} from './model';
import ThanksModel from './model';
import UpdateCollection from '../update/collection';

/**
 * This files contains a class that has the functionality to explore thanks
 * stored in MongoDB, including adding, finding, updating, and deleting thanks.
 * Feel free to add additional operations in this file.
 *
 * Note: HydratedDocument<Thanks> is the output of the ThanksModel() constructor,
 * and contains all the information in Thanks. https://mongoosejs.com/docs/typescript.html
 */
class ThanksCollection {
  /**
   * Add a thanks to the collection
   *
   * @param {string} postUser - The id of the poster of the thanks
   * @param {string} updateId - The id of the update
   * @return {Promise<HydratedDocument<Thanks>>} - The newly created thanks
   */
  static async addOne(postUser: Types.ObjectId | string, updateId: string): Promise<HydratedDocument<Thanks>> {
    const thanks = new ThanksModel({
      postUser,
      updateId,
    });
    await thanks.save(); // Saves thanks to MongoDB
    return thanks.populate(['postUser', 'updateId']);
  }

  /**
   * Find a thanks by thanksId
   *
   * @param {string} thanksId - The id of the thanks to find
   * @return {Promise<HydratedDocument<Thanks>> | Promise<null> } - The thanks with the given thanksId, if any
   */
  static async findOne(thanksId: Types.ObjectId | string): Promise<HydratedDocument<Thanks>> {
    return ThanksModel.findOne({_id: thanksId}).populate(['postUser', 'updateId']);
  }

   /**
   * Find a thanks by user and update
   *
   * @param {string} thanksId - The id of the thanks to find
   * @return {Promise<HydratedDocument<Thanks>> | Promise<null> } - The thanks with the given thanksId, if any
   */
     static async findOnebyUpdateandUser(updateId: Types.ObjectId | string, postUser: Types.ObjectId | string): Promise<HydratedDocument<Thanks>> {
      return ThanksModel.findOne({updateId: updateId, postUser: postUser}).populate(['postUser', 'updateId']);
    }

  /**
   * Get all the thanks in the database
   *
   * @return {Promise<HydratedDocument<Thanks>[]>} - An array of all of the thanks
   */
  static async findAll(): Promise<Array<HydratedDocument<Thanks>>> {
    // Retrieves thanks and sorts them from most to least recent
    return ThanksModel.find({}).sort({dateModified: -1}).populate(['postUser', 'updateId']);
  }

  /**
   * Get all the thanks in by given update
   *
   * @param {string} updateId - The Id of the update getting the thanks
   * @return {Promise<HydratedDocument<Thanks>[]>} - An array of all of the thanks
   */
  static async findAllByUpdateId(updateId: Types.ObjectId | string): Promise<Array<HydratedDocument<Thanks>>> {
    return ThanksModel.find({updateId: updateId}).populate(['postUser', 'updateId']);
  }

  /**
   * Delete a thanks with given updateId and userId.
   *
   * @param {string} postUser - The id of the poster of the thanks
   * @param {string} updateId - The id of the update
   * @return {Promise<HydratedDocument<Thanks>>} - The newly created thanks
   */
  static async deleteOne(postUser: Types.ObjectId | string, updateId: string): Promise<boolean> {
    const thanks = await ThanksModel.deleteOne({updateId: updateId, postUser: postUser});
    return thanks !== null;
  }

  /**
   * Delete all the thanks by the given update
   *
   * @param {string} updateId - The id of the updates
   */
  static async deleteManybyUpdate(updateId: Types.ObjectId | string): Promise<void> {
    await ThanksModel.deleteMany({updateId});
  }

  /**
   * Delete all the thanks for the given update ids
   *
   * @param {Types.ObjectId[] | string[]} updateIds - The id of the updates
   */
   static async deleteManybyUpdateIds(updateIds: Types.ObjectId[] | string[]): Promise<void> {
    if (updateIds.length) {
      await ThanksModel.deleteMany({ updateId: { $in: updateIds } });
    }
  }

  /**
   * Delete all the thanks by the given poster
   *
   * @param {string} postUser - The id of poster of thanks
   */
     static async deleteManybyUser(postUser: Types.ObjectId | string): Promise<void> {
      await ThanksModel.deleteMany({postUser});
  }
}

export default ThanksCollection;
