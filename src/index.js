

const ingredients = 'ingredients'
const cocktails = 'cocktails'

fetch('http://localhost:3000/' + ingredients)
  .then(resp => resp.json())
  .then(fillInDropdown)
  

function fillInDropdown(ingredsArray) {
  const ingredDD = document.querySelector('#ingredients-dropdown')
  for (const i of ingredsArray) {
    ingredDD.insertAdjacentHTML('afterbegin', `
      <option value='${i.name}'>
    `)
  }
  }



