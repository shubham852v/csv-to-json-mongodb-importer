// csvParser.js
// Responsible for: parsing CSV lines (handles quotes) and converting row -> nested object

/**
 * parseCSVLine
 * Parses a single CSV line into an array of fields.
 * Supports:
 *  - quoted fields with commas: "Hello, world"
 *  - escaped quotes inside quotes: "He said ""hello"""
 *  - unquoted fields
 */
function parseCSVLine(line) {
  const fields = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        // check if escaped quote
        if (i + 1 < line.length && line[i + 1] === '"') {
          field += '"';
          i++; // skip next quote
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        fields.push(field.trim());
        field = '';
      } else {
        field += ch;
      }
    }
  }
  fields.push(field.trim());
  return fields;
}

/**
 * setNested(obj, pathArray, value)
 * sets nested property defined by pathArray into obj, creating nested objects as needed.
 */
function setNested(obj, pathArray, value) {
  let cursor = obj;
  for (let i = 0; i < pathArray.length; i++) {
    const key = pathArray[i];
    if (i === pathArray.length - 1) {
      cursor[key] = value;
    } else {
      if (cursor[key] === undefined || typeof cursor[key] !== 'object') {
        cursor[key] = {};
      }
      cursor = cursor[key];
    }
  }
}

/**
 * buildObjectFromRow
 * headers: array of header strings (like 'address.line1', 'gender')
 * values: array of string values
 *
 * returns nested object where dotted headers become nested objects
 */
function buildObjectFromRow(headers, values) {
  const obj = {};
  for (let i = 0; i < headers.length; i++) {
    const header = headers[i].trim();
    // skip empty header names
    if (!header) continue;
    const parts = header.split('.').map(s => s.trim());
    const rawValue = values[i] !== undefined ? values[i].trim() : '';
    // leave empty string as '', do not coerce to null here; caller can decide
    setNested(obj, parts, rawValue);
  }
  return obj;
}

/**
 * separateIntoColumns
 * From the nested object, produce:
 *  - name (first + last)
 *  - age (number)
 *  - address object (all address.*)
 *  - additional_info object (remaining properties)
 *
 * Assumptions:
 *  - name.firstName and name.lastName keys exist at nested path if provided.
 *  - age is top-level key 'age' (or present in object)
 */
function separateIntoColumns(nestedObj) {
  // Extract name
  const nameObj = nestedObj.name || {};
  const firstName = nameObj.firstName || '';
  const lastName = nameObj.lastName || '';
  const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();

  // age - try top-level or nested presence
  let age = undefined;
  if (nestedObj.age !== undefined && nestedObj.age !== '') {
    const num = Number(nestedObj.age);
    age = Number.isNaN(num) ? null : Math.trunc(num);
  } else if (nestedObj.age === '') {
    age = null;
  }

  // address
  const address = nestedObj.address && Object.keys(nestedObj.address).length > 0 ? nestedObj.address : null;

  // additional_info: everything except name, age, address
  const additional_info = {};
  for (const key of Object.keys(nestedObj)) {
    if (key === 'name' || key === 'age' || key === 'address') continue;
    additional_info[key] = nestedObj[key];
  }

  return {
    name: fullName,
    age,
    address,
    additional_info: Object.keys(additional_info).length ? additional_info : null
  };
}

module.exports = {
  parseCSVLine,
  buildObjectFromRow,
  separateIntoColumns
};


