import { z } from "zod"

export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse({ body: req.body, params: req.params, query: req.query })
    if (!result.success) return res.status(400).json({ message: "Invalid request", errors: result.error.flatten() })
    req.body = result.data.body
    next()
  }
}
