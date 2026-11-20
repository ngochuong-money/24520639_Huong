// Pure, immutable LIFO stack. The top is the LAST element, the same order as GET /api/swipes.
export function push(stack, item) {
  return [...stack, item]
}

export function pop(stack) {
  if (stack.length === 0) {
    return { stack, item: null }
  }
  return { stack: stack.slice(0, -1), item: stack[stack.length - 1] }
}

export function peek(stack) {
  return stack.length === 0 ? null : stack[stack.length - 1]
}
