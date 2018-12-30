import { Colony } from './db.js';

export const createColony = async colonyAddress => {
  const colony = new Colony({
    colonyName: 'Test colony',
    colonyId: 0,
    colonyAddress: colonyAddress,
    creationDate: Date.now(),
  });
  colony.save((err, colony) => {
    if (err) return console.error(err);
  });

  return colony;
};
