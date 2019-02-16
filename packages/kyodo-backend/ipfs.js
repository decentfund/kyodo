import IPFS from 'ipfs';
import bs58 from 'bs58';

let ipfs;

export const initiateIpfs = async () => {
  ipfs = new IPFS();
};

export const generateIpfsHash = async spec => {
  const data = ipfs.types.Buffer.from(JSON.stringify(spec));
  const files = await ipfs.add(data);
  const { hash } = files[0];
  console.log('>>>>>>HASH<<<<<<', hash);

  const convertedHash = `0x${bs58
    .decode(hash)
    .slice(2)
    .toString('hex')}`;
  return convertedHash;
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
