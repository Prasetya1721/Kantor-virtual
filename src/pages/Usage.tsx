import { PageTitle } from '../ui.tsx'
import { TokenUsage } from './TokenUsage.tsx'

/** Token usage of the whole crew as its own page (also in the Office: Tokens button, and Panel → Stats). */
export function Usage() {
  return <><PageTitle eyebrow="HERMES INSIGHTS" title="Pemakaian Token">Agen, jenis pekerjaan, dan model mana yang paling banyak memakai token, dari <code>hermes insights</code> setiap agen.</PageTitle>
    <div className="usage-page"><TokenUsage/></div></>
}
