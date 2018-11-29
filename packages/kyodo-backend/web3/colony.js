import Colony from '@kyodo/contracts/build/contracts/Colony.json';
import { getKyodo } from './kyodo';

let colony;

export const getColony = async () => {
  if (colony) return colony;

  const kyodo = await getKyodo();
  const colonyAddress = await kyodo.colony();
  colony = await Colony.at(colonyAddress);
  return colony;
};
