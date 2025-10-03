import type { VBase } from '@vtex/api'

const VBASE_BUCKET = 'returnApp'
const SEQUENCE_KEY = 'independentReturnSequence'

interface SequenceData {
  counter: number
}

/**
 * Generates a unique sequence number for independent returns
 * Format: IND-00001, IND-00002, etc.
 */
export const generateIndependentSequenceNumber = async (
  vbase: VBase
): Promise<string> => {
  try {
    // Get current sequence data
    const sequenceData = await vbase.getJSON<SequenceData>(
      VBASE_BUCKET,
      SEQUENCE_KEY,
      true
    )

    const currentCounter = sequenceData?.counter ?? 0
    const newCounter = currentCounter + 1

    // Save updated counter
    await vbase.saveJSON(VBASE_BUCKET, SEQUENCE_KEY, {
      counter: newCounter,
    })

    // Format: IND-00001
    return `IND-${String(newCounter).padStart(5, '0')}`
  } catch (error) {
    // If file doesn't exist, start from 1
    await vbase.saveJSON(VBASE_BUCKET, SEQUENCE_KEY, {
      counter: 1,
    })

    return 'IND-00001'
  }
}
