function parseCSVLine(line) {
  const fields = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          field += '"';
          i++;
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

function buildObjectFromRow(headers, values) {
  const obj = {};
  for (let i = 0; i < headers.length; i++) {
    const header = headers[i].trim();
    if (!header) continue;
    const parts = header.split('.').map(s => s.trim());
    const rawValue = values[i] !== undefined ? values[i].trim() : '';
    setNested(obj, parts, rawValue);
  }
  return obj;
}

function separateIntoColumns(nestedObj) {
  const nameObj = nestedObj.name || {};
  const firstName = nameObj.firstName || '';
  const lastName = nameObj.lastName || '';
  const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();
  let age = undefined;
  if (nestedObj.age !== undefined && nestedObj.age !== '') {
    const num = Number(nestedObj.age);
    age = Number.isNaN(num) ? null : Math.trunc(num);
  } else if (nestedObj.age === '') {
    age = null;
  }
  const address = nestedObj.address && Object.keys(nestedObj.address).length > 0 ? nestedObj.address : null;
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
