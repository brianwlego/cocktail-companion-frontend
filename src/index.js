
const baseURL = 'http://localhost:3000/'
const ingredients = 'ingredients/'
const cocktails = 'cocktails/'

const ingreInput = document.getElementById('main-ing-search')
const cockInput = document.getElementById('main-cocktail-search')
const searchDiv = document.getElementById('main-search')
const modal = document.getElementById('form-div-container')
const form = document.getElementById('form')
const input = document.getElementById('ingredients-input')
const alcList = document.getElementById('alcohol-list')

const ingredientsArray = []
const ingArray = []
const cocktailsArray = []

fetch(baseURL + ingredients)
  .then(resp => resp.json())
  .then(result => {
    autocomplete(ingreInput, result)
    for (const i of result) {
      ingredientsArray.push(i)
    }
  })
  
fetch(baseURL + cocktails)
  .then(resp => resp.json())
  .then(result => {
    autocomplete(cockInput, result)
    for (const i of result) {
      cocktailsArray.push(i)
    }
  })


//FUNCTIONS FOR ADDING/DELETING INGREDIENTS FROM SEARCH//
function findIngre(ingreName){
  return ingredientsArray.find(ingre=>{return ingre.name === ingreName})
}

function findCocktail(cocktailName) {
  return cocktailsArray.find(cocktail=>{return cocktail.name == cocktailName})
}
function renderIngreToList(ingreObj){
  const list = document.getElementById('ingredient-list')
  list.insertAdjacentHTML('beforeend', `
  <li data-id="${ingreObj.id}">
  ${ingreObj.name}
  <button id="ingredient-remove">x</button>
  </li>
  `)
}


document.addEventListener('click', e => {
  //REMOVE ING FROM LIST & REMOVE ASSOCIATED COCKTAILS FROM COCKTAIL LIST//
  if (e.target.matches('button#ingredient-remove')){
    const name = e.target.parentElement.innerText.split(' x')
    const found = findIngre(name[0])
    findIngFromDB(found)
    e.target.parentElement.remove()
    // TO POP UP NEW COCKTAIL FORM//
  } else if (e.target.matches('button#new-cocktail')){
    modal.style.display = "flex"
    const editinput = document.getElementById('ingredients-input')
    autocomplete(editinput, ingredientsArray)
    const array = getCategoryArray(ingredientsArray)
    createCategoryDatalist(array)
  }  
})

//------------------- MODAL FUNCTIONALITY -------------------//
function closeModal(){
  modal.style.display = "none"
  autocomplete(ingreInput, ingredientsArray)
}
window.onclick = e => {
  if (e.target == modal){
    modal.style.display = "none"
    autocomplete(ingreInput, ingredientsArray)
  }
}

// ----------------- AUTO COMPLETE FUNCTIONALITY -------------//

function autocomplete(input, inputArray){
  let currentFocus
  input.addEventListener("input", e => {
      let val = e.target.value    
      closeAllLists()
      if (!val) { return false}
      currentFocus = -1

      let a = document.createElement("div")
      a.id = e.target.id + "autocomplete-list"
      a.classList.add('autocomplete-items')
      e.target.parentNode.appendChild(a)

    for (const i of inputArray) {
      if (i.name.substr(0, val.length).toUpperCase() == val.toUpperCase()) {
        let b = document.createElement('div')
        b.innerHTML = `
        <strong>${i.name.substr(0, val.length)}</strong>${i.name.substr(val.length)}
        <input type='hidden' value="${i.name}">
        `
        b.addEventListener('click', e => {
          if (e.target.parentElement.matches('#main-ing-searchautocomplete-list')) {
            const name = e.target.getElementsByTagName('input')[0].value
            const found = findIngre(name)
            findIngFromDB(found)
            if (!modal.style.display || modal.style.display === "none") {
              cocktailDetail.style.display = "none"
              renderIngreToList(found)
              input.value = ""
            } else if (modal.style.display === "flex") {
              const amt = document.querySelector('input#measurement')
              addIngreToPageEditForm(found, amt.value)
              input.value = ""
              amt.value = ""
            }
            closeAllLists();
          } else if (e.target.parentElement.matches("#main-cocktail-searchautocomplete-list")) {
            const name = e.target.getElementsByTagName('input')[0].value
            fetchCocktailObj(name)
            input.value = ''
          }
        });
        a.appendChild(b);
      }
    }
  });

  input.addEventListener('keydown', e => {
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
      if (elmnt != i && elmnt != input){
        i.parentNode.removeChild(i)
      }
    }
  }
  document.addEventListener("click", e => {
    closeAllLists(e.target)
  })
}

//------------------FORM FUNCTIONALITY--------------------//
function addIngreToPageEditForm(ingObj, amtString){
  const div = document.querySelector('div#ingre-list-placeholder')
  div.insertAdjacentHTML('afterbegin', `
    <p data-drink-id="${ingObj.id}" data-amt="${amtString}">${amtString} - ${ingObj.name} <button id="ingredient-remove">x</button></p>
  `)
}

function getCategoryArray(ingArray){
  let catArray = []
  for(const i of ingArray){catArray.push(i.category)}
  const newSet = new Set(catArray)
  return catArray = [...newSet]
}
function createCategoryDatalist(catArray){
  const datalist = document.querySelector('datalist#categorys')
  for (const cat of catArray){
    if (cat) datalist.insertAdjacentHTML('afterbegin', `<option value="${cat}">`)
  }
}


function createNewMeasurements(measurementArray){
  const measObjArray = []
  for (const mEle of measurementArray){
    measObjArray.push({amount: mEle.dataset.amt, ingredient_id: mEle.dataset.drinkId})
  }
  return measObjArray
}

function fetchPostNewCocktail(cocktailObj){
  configObj = {
    method: 'POST', 
    headers: {'Content-Type': 'application/json', 'Accept': 'application/json'}, 
    body: JSON.stringify(cocktailObj)
  }
  fetch(baseURL+cocktails, configObj)
  .then(resp => resp.json())
  .then(result => {
    if (result){
      renderCocktailDetail(result)
      modal.style.display = "none"
    }
  })
}

if (modal.querySelectorAll('div').length > 4 ){
  form.removeEventListener('submit', {})
} else {
  form.addEventListener('submit', e => {
    e.preventDefault()

    const measurementUls = [...document.querySelector('div#ingre-list-placeholder').children]
    const measArrayNewObjs = createNewMeasurements(measurementUls)
    const newCocktail = {
      name: e.target.name.value, 
      category: e.target.category.value, 
      glass: e.target.glass.value, 
      alcoholic: e.target.alcoholic.checked, 
      instructions: e.target.instructions.value, 
      thumbnail: e.target.thumbnail.value, 
      measurements_attributes: measArrayNewObjs
    }
    fetchPostNewCocktail(newCocktail)
    autocomplete(ingreInput, ingredientsArray)

  })
}

//----------FUNCTIONS DEALING WITH COCKTAIL LIST------------//
function findIngFromDB(ingObj){
  fetch(baseURL + ingredients + ingObj.id)
    .then(resp => resp.json())
    .then(result => {
      ingArrayHander(result)
    })
}

function ingArrayHander(ingObj){
  let names = ingArray.map(e=>e.name)
  if (names.includes(ingObj.name)){
    const found = ingArray.findIndex(e=>e.name === ingObj.name)
    ingArray.splice(found, 1)
    renderCocktailDiv(ingArray)
  } else {
    ingArray.push(ingObj)
    renderCocktailDiv(ingArray)
  }
}

function getDuplicateArrayElements(arr){
  let newArray = arr.map(e => e.name)
  let sorted_arr = newArray.slice().sort();
  let results = [];
  for (let i = 0; i < sorted_arr.length - 1; i++) {
      if (sorted_arr[i + (ingArray.length-1)] === sorted_arr[i]) {
          results.push(sorted_arr[i]);
      }
    }
    const foundIndex = []
    for (const name of results){
      foundIndex.push(newArray.findIndex(e => e === name))
    }
    let finalResult = []
    for (const index of foundIndex){
      finalResult.push(arr[parseInt(index, 10)])
    }
    
  return finalResult;
}


// functions for render cocktail detail

function fetchCocktailObj(name) {
  const foundCocktail = findCocktail(name)
  fetch(baseURL + cocktails + foundCocktail.id)
    .then(resp => resp.json())
    .then(renderCocktailDetail)
}

  let renderCocktails = []

//HELPER FOR AUTOCOMPLETE
let updatedIngArray = []
function fetchCocktailsAssociations(){
  for (const cocktail of renderCocktails){
    fetch(baseURL+cocktails+cocktail.id)
    .then(resp=>resp.json())
    .then(result =>{
      for (const ing of result.ingredients){
        updatedIngArray.push(ing)
      }
    })
  }
}


const cocktailList = document.querySelector('#ingre-cocktails')

function renderCocktailDiv(ingArray){
  cocktailList.style.display = "none"
  cocktailList.innerHTML = ""
  if (ingArray.length > 0){
    cocktailList.style.display = "flex"
    }


  for (const ing of ingArray){
    for (const cocktail of ing.cocktails) {
      renderCocktails.push(cocktail)
    }
  }
  if (ingArray.length === 1) {
    for (const cocktail of renderCocktails)
      cocktailList.insertAdjacentHTML('afterbegin', `
    <button data-cocktail-id=${cocktail.id} type='cocktail-button' id='cocktail-btn'>${cocktail.name}</button>
    `)
  } else {
    const cocktailsNew = getDuplicateArrayElements(renderCocktails)
    for (const cocktail of cocktailsNew)
    cocktailList.insertAdjacentHTML('afterbegin', `
    <button data-cocktail-id=${cocktail.id} type='cocktail-button' id='cocktail-btn'>${cocktail.name}</button>
    `)
  }

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


const cocktailDetail = document.querySelector('#cocktail-detail')

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
let cocktailByAlcArray = []

function loadAlcoholList() {
  alcList.addEventListener('click', e => {
    cocktailByAlcArray.length = 0
    for (const ingre of ingredientsArray) {
      if (e.target.id === ingre.category) {
          cocktailByAlcArray.push(ingre)
      }
    }

    cocktailList.style.display = 'flex'
    cocktailList.innerHTML = ''
    for (const ingre of cocktailByAlcArray) {
      for (const cocktail of ingre.cocktails) {
        cocktailList.insertAdjacentHTML('afterbegin', `
    <button data-cocktail-id=${cocktail.id} type='cocktail-button' id='cocktail-btn'>${cocktail.name}</button>
    `)
      }
    }
  })
}


// function renderCocktailsByAlc(cocktailByAlcArray) {
//   for (cocktial of cocktailByAlcArray) {
//     renderCocktails
//   }
// }

loadAlcoholList()

//click within auto complete that add's ing to ul
//find Ing obj
//put the Ing Obj's name to the ul
//push the Ing Obj into Rendered Ing's Cocktail Array

//click remove from the ul
//find the Ing obj thats being removed(based off id)
//remove the Ing's Obj from the Ing Array

// addEventListener("click", e => {
//   const name = e.target.getElementsByTagName('input')[0].value
//   findIngObjFromDb(name)
// })


