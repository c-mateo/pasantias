import { BinaryLike, createHash } from 'crypto'

export const sha256 = (data: BinaryLike) => {
  return createHash('sha256').update(data).digest('hex')
}

export default { sha256 }
