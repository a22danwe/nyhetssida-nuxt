import { defineEventHandler } from 'h3'
import { readFileSync } from 'fs'
import { resolve } from 'path'

export default defineEventHandler(() => {
  const filePath = resolve(process.cwd(), 'public/datasetSmall.json')
  const rawData = readFileSync(filePath, 'utf-8')
  return JSON.parse(rawData)
})
