// Placeholder API object - will be replaced when Convex is initialized
// Run `npx convex dev` to generate the real API

export const api = {
  users: {
    getByClerkId: "users:getByClerkId",
    getOrCreate: "users:getOrCreate",
    updateCredits: "users:updateCredits",
    deductCredits: "users:deductCredits",
    addCredits: "users:addCredits",
  },
  generations: {
    save: "generations:save",
    listByUser: "generations:listByUser",
    getById: "generations:getById",
    remove: "generations:remove",
  },
  transactions: {
    listByUser: "transactions:listByUser",
  },
} as const;
