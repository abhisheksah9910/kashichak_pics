const slugifyLib = require('slugify');

// Normalizes a place name so "Kashichak", "kashichak", "KASHICHAK" all
// resolve to the same record. `normalizedName` is used for duplicate checks,
// `slug` is used in URLs.
const normalizeName = (name = '') =>
  name.trim().toLowerCase().replace(/\s+/g, ' ');

const makeSlug = (name = '', parentSlug = '') => {
  const base = slugifyLib(name, { lower: true, strict: true });
  return parentSlug ? `${parentSlug}-${base}` : base;
};

module.exports = { normalizeName, makeSlug };
