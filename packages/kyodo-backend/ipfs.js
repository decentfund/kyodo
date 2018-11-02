import IPFS from 'ipfs';
import { Buffer } from 'buffer';

let ipfs;

export const initiateIpfs = async () => {
  ipfs = new IPFS();
};

export const generateIpfsHash = async spec => {
  const data = Buffer.from(JSON.stringify(spec));
  const files = await ipfs.files.add(data);
  const { hash } = files[0];
  console.log('>>>>>>HASH<<<<<<', hash);
  await this.getTaskSpecification(hash);
  return hash;
};

export const getTaskSpecification = async hash => {
  const buf = await ipfs.files.cat(`/ipfs/${hash}`);
  let spec;
  try {
    spec = JSON.parse(buf.toString());
  } catch (e) {
    throw new Error(`Could not get task specification for hash ${hash}`);
  }
  console.log(spec);
  return spec;
};
