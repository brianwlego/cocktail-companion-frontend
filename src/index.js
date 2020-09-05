
const baseURL = 'http://localhost:3000/'
const ingredients = 'ingredients/'
const cocktails = 'cocktails/'

const ingreInput = document.querySelector('input#ingredient')
const searchDiv = document.getElementById('main-search')

const ingredientsArray = []


fetch(baseURL + ingredients)
  .then(resp => resp.json())
  .then(fillInDropdown)
  

function fillInDropdown(array) {
  const ingreDD = document.querySelector('#ingredients-dropdown')
  for (const i of array) {
    ingredientsArray.push(i)
    ingreDD.insertAdjacentHTML('afterbegin', `
      <option value='${i.name}'>
    `)
  }
}

ingreInput.addEventListener('change', e => {
  const found = findIngre(e.target.value)
  renderIngreToList(found)
  ingreInput.value = ""
  console.dir(found)
  // renderCocktailDiv(found)
})


//FUNCTIONS FOR ADDING/DELETING INGREDIENTS FROM SEARCH//
function findIngre(ingreName){
  return ingredientsArray.find(ingre=>{return ingre.name === ingreName})
}
function renderIngreToList(ingreObj){
  const list = document.getElementById('ingredient-list')
  list.insertAdjacentHTML('afterbegin', `
  <li data-id="${ingreObj.id}">
  ${ingreObj.name}
  <button id="ingredient-remove">x</button>
  </li>
  `)
  findCocktailsWithIngre(ingreObj)
}
searchDiv.addEventListener('click', e => {
  if (e.target.matches('button#ingredient-remove')){
    e.target.parentElement.remove()

  }
})
//-------------------------------------------------------//

//FUNCTIONS DEALING WITH COCKTAIL LIST//
function findCocktailsWithIngre(foundObj) {
  fetch(baseURL + ingredients + foundObj.id)
    .then(resp => resp.json())
    .then(renderCocktailDiv)
}

function renderCocktailDiv(foundObj){
  const cocktailList = document.querySelector('#all-cocktails')
  for (cocktail of foundObj.cocktails) {
    cocktailList.insertAdjacentHTML('afterbegin', `
    <button type='cocktail-button' id='cocktail-btn'>${cocktail.name}</button>
    `)
  }


}