
const baseURL = 'http://localhost:3000/'
const ingredients = 'ingredients/'
const cocktails = 'cocktails/'

const ingreInput = document.getElementById('main-ing-search')
const searchDiv = document.getElementById('main-search')
const modal = document.getElementById('form-div-container')
const ingInp = document.getElementById('ingredients-input')

const ingredientsArray = []


fetch(baseURL + ingredients)
  .then(resp => resp.json())
  .then(result => {
    autocomplete(ingreInput, result)
    for (const i of result) {
      ingredientsArray.push(i)
    }
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
  } else if (e.target.matches('button#new-cocktail')){
    modal.style.display = "flex"
    const editIngInp = document.getElementById('ingredients-input')
    autocomplete(editIngInp, ingredientsArray)
  }
    // TODO:
    // remove cocktail results from page of removed ingredient
  
})

//------------------- MODAL FUNCTIONALITY -------------------//
function closeModal(){
  modal.style.display = "none"
}
window.onclick = e => {
  if (e.target == modal){
    modal.style.display = "none"
  }
}

// ----------------- AUTO COMPLETE FUNCTIONALITY -------------//

function autocomplete(ingInp, ingArray){
  let currentFocus
  ingInp.addEventListener("input", e => {
      let val = e.target.value    
      closeAllLists()
      if (!val) { return false}
      currentFocus = -1

      let a = document.createElement("div")
      a.id = e.target.id + "autocomplete-list"
      a.classList.add('autocomplete-items')
      console.dir(e.target.parentNode)
      e.target.parentNode.appendChild(a)

    for (const i of ingArray){
      if (i.name.substr(0, val.length).toUpperCase() == val.toUpperCase()){
        let b = document.createElement('div')
        b.innerHTML = `
        <strong>${i.name.substr(0, val.length)}</strong>${i.name.substr(val.length)}
        <input type='hidden' value="${i.name}">
        `
        b.addEventListener('click', e => {
          const name = e.target.getElementsByTagName('input')[0].value
          const found = findIngre(name)
          if (!modal.style.display) {
            renderIngreToList(found)
            ingInp.value = ""
          } else if (modal.style.display === "flex"){
            const amt = document.querySelector('input#measurement')
            console.log(amt)
            addIngreToPageEditForm(found, amt.value)
            ingInp.value = ""
            amt.value = ""
          }
          closeAllLists();
        });
        a.appendChild(b);
      }
    }
  });

  ingInp.addEventListener('keydown', e => {
    let x = document.getElementById(e.target.id + "autocomplete-list")
    if (x) x = x.getElementsByTagName('div')
    if (e.keyCode == 40){
      currentFocus++
      addActive(x)
    } else if (e.keyCode == 38){
      currentFocus--
      addActive(x)
    } else if (e.keyCode = 13){
      if (currentFocus > -1 && x ) x[currentFocus].click() 
    }
  })

  function addActive(x) {
    if (!x) return false
    removeActive(x)
    if (currentFocus >= x.length) currentFocus = 0
    if (currentFocus < 0) currentFocus = (x.length - 1)
    x[currentFocus].classList.add("autocomplete-active")
  }
  function removeActive(x){
    for (const i of x){
      i.classList.remove("autocomplete-active")
    }
  }
  function closeAllLists(elmnt) {
    const array = document.getElementsByClassName("autocomplete-items")
    for (const i of array){
      if (elmnt != i && elmnt != ingInp){
        i.parentNode.removeChild(i)
      }
    }
  }
  document.addEventListener("click", e => {
    closeAllLists(e.target)
  })
}

//------------------EDIT FORM FUNCTIONALITY--------------------//
function addIngreToPageEditForm(ingObj, amtString){
  const div = document.querySelector('div#ingre-list-placeholder')
  div.insertAdjacentHTML('afterbegin', `
    <p data-id="${ingObj.id}">${amtString} - ${ingObj.name}</p>
  `)
}





//----------FUNCTIONS DEALING WITH COCKTAIL LIST------------//
function findCocktailsWithIngre(ingreObj) {
  fetch(baseURL + ingredients + ingreObj.id)
    .then(resp => resp.json())
    .then(renderCocktailDiv)
}

function renderCocktailDiv(foundObj){
  const cocktailList = document.querySelector('#ingre-cocktails')
  cocktailList.style.display = "flex"
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
    cocktailDetail.style.display = "flex"
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
}