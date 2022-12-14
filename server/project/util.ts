import type {HydratedDocument} from 'mongoose';
import moment from 'moment';
import type {Project, PopulatedProject} from '../project/model';

// Update this if you add a property to the Project type!
type ProjectResponse = {
  _id: string;
  creator: string;
  active: boolean;
  projectName: string;
  participants: string[];
  invitedUsers: string[];
  scheduledUpdates: string[]; 
  tags: string[];
};

/**
 * Encode a date as an unambiguous string
 *
 * @param {Date} date - A date object
 * @returns {string} - formatted date as string
 */
const formatDate = (date: Date): string => moment.utc(date).format('MMMM Do, YYYY');

/**
 * Given a Tags array, cleans it to remove duplicates and trim whitespace.
 * Also returns all tags as lowercase.
 *
 * @param {string[]} tags - An array of strings
 * @returns {string} - formatted date as string
 */
 const cleanTags = (tags: string[]): string[] => {
   const processedTags = tags.map((tag) => tag.toLowerCase().trim());
   return [...new Set(processedTags)];
 }

/**
 * Transform a raw Project object from the database into an object
 * with all the information needed by the frontend
 *
 * @param {HydratedDocument<Project>} project - A project
 * @returns {ProjectResponse} - The project object formatted for the frontend
 */
const constructProjectResponse = (project: HydratedDocument<Project>): ProjectResponse => {
  const projectCopy: PopulatedProject = {
    ...project.toObject({
      versionKey: false // Cosmetics; prevents returning of __v property
    })
  };
  const {email} = projectCopy.creatorId;
  delete projectCopy.creatorId;
  const participantEmails = projectCopy.participants.map(user => user.email);
  delete projectCopy.participants;
  const inviteesEmails = projectCopy.invitedUsers.map(user => user.email);
  delete projectCopy.invitedUsers;
  return {
    ...projectCopy,
    _id: projectCopy._id.toString(),
    creator: email.toString(),
    participants: participantEmails,
    invitedUsers: inviteesEmails,
    scheduledUpdates: project.scheduledUpdates ? project.scheduledUpdates.map(formatDate) : null
  };
};

export {
  constructProjectResponse,
  cleanTags,
};
