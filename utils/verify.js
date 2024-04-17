export default function escapeHtmlText(value) {
  const stringValue = value.toString()
  const entityMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
    '`': '&grave;',
    '=': '&#x3D;'
  }

  // Match any of the characters inside /[ ... ]/
  const regex = /[&<>"'`=/]/g
  return stringValue.replace(regex, match => entityMap[match])
}
