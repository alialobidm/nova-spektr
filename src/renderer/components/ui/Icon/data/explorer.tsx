import PolkascanImg, { ReactComponent as PolkascanSvg } from '@images/explorers/polkascan.svg';
import SubIdImg, { ReactComponent as SubIdSvg } from '@images/explorers/subid.svg';
import SubscanImg, { ReactComponent as SubscanSvg } from '@images/explorers/subscan.svg';
import StatescanImg, { ReactComponent as StatescanSvg } from '@images/explorers/statescan.svg';

const ExplorerImages = {
  polkascan: { svg: PolkascanSvg, img: PolkascanImg },
  subid: { svg: SubIdSvg, img: SubIdImg },
  subscan: { svg: SubscanSvg, img: SubscanImg },
  statescan: { svg: StatescanSvg, img: StatescanImg },
} as const;

export type Explorer = keyof typeof ExplorerImages;

export default ExplorerImages;