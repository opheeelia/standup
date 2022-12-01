import type {HydratedDocument} from 'mongoose';
import moment from 'moment';
import type {Project, PopulatedProject} from '../project/model';

// Update this if you add a property to the Project type!
type ProjectResponse = {
  _id: string;
  creator: string;
  active: boolean;
  projectName: string;
  scheduledUpdates: string[]; 
};

/**
 * Encode a date as an unambiguous string
 *
 * @param {Date} date - A date object
 * @returns {string} - formatted date as string
 */
const formatDate = (date: Date): string => moment(date).format('MMMM Do YYYY, h:mm:ss a');

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
  const {_id} = projectCopy.creatorId;
  delete projectCopy.creatorId;
  return {
    ...projectCopy,
    _id: projectCopy._id.toString(),
    creator: _id.toString(),
    scheduledUpdates: project.scheduledUpdates ? project.scheduledUpdates.map(formatDate) : null
  };
};

export {
  constructProjectResponse
};
