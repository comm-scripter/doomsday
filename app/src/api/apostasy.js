// Apostasy & Gospel Spread — GDELT news tone on church decline / secularism
// Baseline 46 calibrated from: Pew 2024 — self-identified Christians fell from 75%→63% of US
// adults in a decade; ~3,500 churches close annually in the US. Gospel spread offsets this
// (Joshua Project: 97% of world now has some gospel access), holding the score below midpoint.
import { gdeltHybridScore } from './_gdeltHybrid'

const BASE = 46

export async function fetchApostasyScore() {
  return gdeltHybridScore(
    '"church decline" OR "leaving church" OR apostasy OR secularism OR "loss of faith" OR "dechurching" OR "nones"',
    BASE,
  )
}
