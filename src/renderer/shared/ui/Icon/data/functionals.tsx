import AddCircleImg, { ReactComponent as AddCircleSvg } from '@shared/assets/images/functionals/add-circle.svg';
import AddImg, { ReactComponent as AddSvg } from '@shared/assets/images/functionals/add.svg';
import CheckCutoutImg, {
  ReactComponent as CheckCutoutSvg,
} from '@shared/assets/images/functionals/checkmark-cutout.svg';
import CheckmarkOutlineImg, {
  ReactComponent as CheckmarkOutlineSvg,
} from '@shared/assets/images/functionals/checkmark-outline.svg';
import CheckImg, { ReactComponent as CheckSvg } from '@shared/assets/images/functionals/checkmark.svg';
import CloseOutlineImg, {
  ReactComponent as CloseOutlineSvg,
} from '@shared/assets/images/functionals/close-outline.svg';
import CloseImg, { ReactComponent as CloseSvg } from '@shared/assets/images/functionals/close.svg';
import CopyImg, { ReactComponent as CopySvg } from '@shared/assets/images/functionals/copy.svg';
import CurrencyImg, { ReactComponent as CurrencySvg } from '@shared/assets/images/functionals/currency.svg';
import DeleteImg, { ReactComponent as DeleteSvg } from '@shared/assets/images/functionals/delete.svg';
import DetailsImg, { ReactComponent as DetailsSvg } from '@shared/assets/images/functionals/details.svg';
import EditKeysImg, { ReactComponent as EditKeysSvg } from '@shared/assets/images/functionals/edit-keys.svg';
import EditImg, { ReactComponent as EditSvg } from '@shared/assets/images/functionals/edit.svg';
import EmptyIdenticonImg, {
  ReactComponent as EmptyIdenticonSvg,
} from '@shared/assets/images/functionals/empty-identicon.svg';
import ExportImg, { ReactComponent as ExportSvg } from '@shared/assets/images/functionals/export.svg';
import EyeSlashedImg, { ReactComponent as EyeSlashedSvg } from '@shared/assets/images/functionals/eye-slashed.svg';
import EyeImg, { ReactComponent as EyeSvg } from '@shared/assets/images/functionals/eye.svg';
import ForgetImg, { ReactComponent as ForgetSvg } from '@shared/assets/images/functionals/forget.svg';
import ImportImg, { ReactComponent as ImportSvg } from '@shared/assets/images/functionals/import.svg';
import LinkImg, { ReactComponent as LinkSvg } from '@shared/assets/images/functionals/link.svg';
import LockImg, { ReactComponent as LockSvg } from '@shared/assets/images/functionals/lock.svg';
import MagicImg, { ReactComponent as MagicSvg } from '@shared/assets/images/functionals/magic.svg';
import MinusCircleImg, { ReactComponent as MinusCircleSvg } from '@shared/assets/images/functionals/minus-circle.svg';
import MoreImg, { ReactComponent as MoreSvg } from '@shared/assets/images/functionals/more.svg';
import MultisigOutlineImg, {
  ReactComponent as MultisigOutlineSvg,
} from '@shared/assets/images/functionals/multisig-outline.svg';
import OpenGovDelegationsImg, {
  ReactComponent as OpenGovDelegationsSvg,
} from '@shared/assets/images/functionals/opengov-delegations.svg';
import OpenGovLockImg, { ReactComponent as OpenGovLockSvg } from '@shared/assets/images/functionals/opengov-lock.svg';
import OpenGovVotingLockImg, {
  ReactComponent as OpenGovVotingLockSvg,
} from '@shared/assets/images/functionals/opengov-voting-lock.svg';
import QuestionImg, { ReactComponent as QuestionSvg } from '@shared/assets/images/functionals/question.svg';
import ReferendumImg, { ReactComponent as ReferendumSvg } from '@shared/assets/images/functionals/referendum.svg';
import RefreshImg, { ReactComponent as RefreshSvg } from '@shared/assets/images/functionals/refresh.svg';
import RenameImg, { ReactComponent as RenameSvg } from '@shared/assets/images/functionals/rename.svg';
import SearchImg, { ReactComponent as SearchSvg } from '@shared/assets/images/functionals/search.svg';
import SettingsLiteImg, {
  ReactComponent as SettingsLiteSvg,
} from '@shared/assets/images/functionals/settings-lite.svg';
import ThumbDownImg, { ReactComponent as ThumbDownSvg } from '@shared/assets/images/functionals/thumb-down.svg';
import ThumbUpImg, { ReactComponent as ThumbUpSvg } from '@shared/assets/images/functionals/thumb-up.svg';
import UpdateImg, { ReactComponent as UpdateSvg } from '@shared/assets/images/functionals/update.svg';
import UploadFileImg, { ReactComponent as UploadFileSvg } from '@shared/assets/images/functionals/upload-file.svg';
import ViewValidatorsImg, {
  ReactComponent as ViewValidatorsSvg,
} from '@shared/assets/images/functionals/view-validators.svg';
import VotedImg, { ReactComponent as VotedSvg } from '@shared/assets/images/functionals/voted.svg';
import WarnCutoutImg, { ReactComponent as WarnCutoutSvg } from '@shared/assets/images/functionals/warning-cutout.svg';

const FunctionalImages = {
  copy: { svg: CopySvg, img: CopyImg },
  close: { svg: CloseSvg, img: CloseImg },
  checkmarkCutout: { svg: CheckCutoutSvg, img: CheckCutoutImg },
  checkmark: { svg: CheckSvg, img: CheckImg },
  currency: { svg: CurrencySvg, img: CurrencyImg },
  referendum: { svg: ReferendumSvg, img: ReferendumImg },
  warnCutout: { svg: WarnCutoutSvg, img: WarnCutoutImg },
  emptyIdenticon: { svg: EmptyIdenticonSvg, img: EmptyIdenticonImg },
  search: { svg: SearchSvg, img: SearchImg },
  add: { svg: AddSvg, img: AddImg },
  addCircle: { svg: AddCircleSvg, img: AddCircleImg },
  edit: { svg: EditSvg, img: EditImg },
  delete: { svg: DeleteSvg, img: DeleteImg },
  multisigOutline: { svg: MultisigOutlineSvg, img: MultisigOutlineImg },
  eyeSlashed: { svg: EyeSlashedSvg, img: EyeSlashedImg },
  eye: { svg: EyeSvg, img: EyeImg },
  checkmarkOutline: { svg: CheckmarkOutlineSvg, img: CheckmarkOutlineImg },
  closeOutline: { svg: CloseOutlineSvg, img: CloseOutlineImg },
  refresh: { svg: RefreshSvg, img: RefreshImg },
  settingsLite: { svg: SettingsLiteSvg, img: SettingsLiteImg },
  viewValidators: { svg: ViewValidatorsSvg, img: ViewValidatorsImg },
  link: { svg: LinkSvg, img: LinkImg },
  lock: { svg: LockSvg, img: LockImg },
  magic: { img: MagicImg, svg: MagicSvg },
  questionOutline: { img: QuestionImg, svg: QuestionSvg },
  uploadFile: { img: UploadFileImg, svg: UploadFileSvg },
  import: { img: ImportImg, svg: ImportSvg },
  export: { img: ExportImg, svg: ExportSvg },
  editKeys: { img: EditKeysImg, svg: EditKeysSvg },
  more: { img: MoreImg, svg: MoreSvg },
  rename: { img: RenameImg, svg: RenameSvg },
  forget: { img: ForgetImg, svg: ForgetSvg },
  update: { svg: UpdateSvg, img: UpdateImg },
  opengovLock: { svg: OpenGovLockSvg, img: OpenGovLockImg },
  opengovVotingLock: { svg: OpenGovVotingLockSvg, img: OpenGovVotingLockImg },
  opengovDelegations: { svg: OpenGovDelegationsSvg, img: OpenGovDelegationsImg },
  voted: { svg: VotedSvg, img: VotedImg },
  thumbUp: { svg: ThumbUpSvg, img: ThumbUpImg },
  thumbDown: { svg: ThumbDownSvg, img: ThumbDownImg },
  minusCircle: { svg: MinusCircleSvg, img: MinusCircleImg },
  details: { svg: DetailsSvg, img: DetailsImg },
} as const;

export type Functional = keyof typeof FunctionalImages;

export default FunctionalImages;
