import { Encoder } from '../index.js'
import assert from 'assert'
import { Console } from 'console'

const small = [ 
	{ bn: '/3303/0/5700', bt: 1278887, v: 35.5 },{ t: 10, v: 34 },{ t: 20, v: 33 },{ t: 30, v: 32 },{ t: 40, v: 31 },{ t: 50, v: 30 } 
]


let large = []

for (let i = 0; i < 1000; i++) large.push({ t: 100+i, n: '1', vs: 'value-'+i } )

let senmlKeys = { bs: -6, bv: -5, bu: -4, bt: -3, bn: -2, n: 0, u: 1, v: 2, vs: 3, t: 6, ut: 7, vd: 8 }

function preMap(data) { 
  let maps = []
  for (let r of data) { 
    let map = new Map()
    Object.entries(r).map(([k,v]) => map.set(senmlKeys[k], v))
    maps.push(map)
  }
  console.log(maps[0])
  return maps
}

function perfTest(data, label) {
  let basic = test(data, {useRecords: false})
  let maps = preMap(data)
  compare(`Basic  No Recs: ${label}`, basic, basic)
  compare(`PreMap No Recs: ${label}`, test(maps, {useRecords: false}), basic)
  compare(`KeyMap No Recs: ${label}`, test(data, {useRecords: false, keyMap: senmlKeys}), basic)
  compare(`Optima No Recs: ${label}`, test(data, {useRecords: false, _keyMap: senmlKeys}), basic)
  compare(`Basic  Wi Recs: ${label}`, test(data, {useRecords: true}), basic)
  compare(`PreMap Wi Recs: ${label}`, test(maps, {useRecords: true}), basic)
  compare(`KeyMap Wi Recs: ${label}`, test(data, {useRecords: true,  keyMap: senmlKeys}), basic) 
  compare(`Optima Wi Recs: ${label}`, test(data, {useRecords: true,  _keyMap: senmlKeys}), basic) 
   
 }

function compare(label, r1, r2) {
  if (!r2) r2 = r1
  console.log(label) 
  let pct = (n1, n2) => Math.round(100 * (n2/n1)) 
  console.log(`  Buffer: ${pct(r2.bufLen, r1.bufLen)}% \t(${r1.bufLen})`)
  console.log(`  Encode: ${pct(r2.encAvg, r1.encAvg)}% \t(${r1.encAvg})`)
  console.log(`  Decode: ${pct(r2.decAvg, r1.decAvg)}% \t(${r1.decAvg})`)
}

function test(data, opts, its=1000) { 
  let cbor = new Encoder(opts)
  let buff = cbor.mapEncode(data)
  let t1 = Date.now()
  for (let i = 0; i < its; i++) cbor.mapEncode(data)
  let t2 = Date.now()
  for (let i = 0; i < its; i++) cbor.mapDecode(buff)
  let t3 = Date.now()
  assert.deepEqual(cbor.mapDecode(buff), data)
  return {bufLen: buff.length, encAvg: (t2-t1)/its, decAvg: (t3-t2)/its }
}

perfTest(small, 'Small')
perfTest(large, 'Large')
