
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
  // console.dir(found)
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
    // TODO:
    // remove cocktail results from page of removed ingredient
  } 
})
//-------------------------------------------------------//

//FUNCTIONS DEALING WITH COCKTAIL LIST//
function findCocktailsWithIngre(ingreObj) {
  fetch(baseURL + ingredients + ingreObj.id)
    .then(resp => resp.json())
    .then(renderCocktailDiv)
}

function renderCocktailDiv(foundObj){
  const cocktailList = document.querySelector('#ingre-cocktails')
  for (cocktail of foundObj.cocktails) {
    cocktailList.insertAdjacentHTML('afterbegin', `
    <button data-cocktail-id=${cocktail.id} type='cocktail-button' id='cocktail-btn'>${cocktail.name}</button>
    `)
  }

  cocktailList.addEventListener('click', e => {
    const click = e.target
    if (click.matches('#cocktail-btn')) {
      loadCocktail(click.dataset.cocktailId)
    }
  })

  function loadCocktail(cocktailId) {
    fetch(baseURL + cocktails + cocktailId)
      .then(resp => resp.json())
      .then(renderCocktailDetail)
  }

  function renderCocktailDetail(cocktail) {
    console.log(cocktail)
    const ingreArray = []
    const measurmentArray = []
    let ingreMeasureHTML = ''
    for (ingredient of cocktail.ingredients) {
      ingreArray.push(ingredient.name)
    }

    for (measurment of cocktail.measurements) {
      measurmentArray.push(measurment.amount)
    }

    for (let i = 0; i < ingreArray.length; i++){
      ingreMeasureHTML += ` 
      <li>${measurmentArray[i]} ${ingreArray[i]}</li> 
      `
    }
    const cocktailDetail = document.querySelector('#cocktail-detail')
    const cocktailTitleId = cocktailDetail.querySelector('#cocktail-title')
    cocktailDetail.innerHTML = ''
    cocktailDetail.innerHTML = `
    <img style="max-width:50%;" src="${cocktail.thumbnail}">
    <h3 id="cocktail-title">${cocktail.name}</h4>
    <ul>
    ${ingreMeasureHTML}
    </ul
    <p>${cocktail.glass}</p>
    <p>${cocktail.instructions}
    `
    

  }

  //FUNCTIONS DEALING WITH COCKTAIL SHOW PAGE//
  

}