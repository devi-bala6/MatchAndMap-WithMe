import test from "node:test"

import assert from "node:assert/strict"

import { buildCsvContent } from "./csv.js"

test("buildCsvContent quotes values and joins rows correctly", () => {
  const csv = buildCsvContent(
    ["Name", "Email"],

    [
      ["Aryan", "aryan@example.com"],

      ["Ava, Smith", "ava@example.com"],
    ],
  )

  assert.equal(
    csv,

    'Name,Email\n"Aryan","aryan@example.com"\n"Ava, Smith","ava@example.com"\n',
  )
})
