import React from 'react'

function LanguageInput() {
  return (
    <div className="d-flex justify-content-end ">
    <select className="form-select form-select-sm" style={{ width: 'auto' }}>
      <option value="en">EN</option>
      <option value="fr">FR</option>
      <option value="es">ES</option>
    </select>
  </div>
  )
}

export default LanguageInput