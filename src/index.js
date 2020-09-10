
const baseURL = 'http://localhost:3000/'
const ingredients = 'ingredients/'
const cocktails = 'cocktails/'
//MAIN SEARCH ELEMENTS
const ingreInput = document.getElementById('main-ing-search')
const cockInput = document.getElementById('main-cocktail-search')
const searchDiv = document.getElementById('main-search')
const alcList = document.getElementById('alcohol-list')

//FORM ELEMENTS
const modal = document.getElementById('form-div-container')
const form = document.getElementById('form')
const detailClose = document.getElementById('detail-close')

//COCKTAIL LIST DIV
const cocktailList = document.querySelector('#ingre-cocktails')

//COCTAIL SHOW DIV
const cocktailDetail = document.querySelector('#cocktail-detail')

//CONTAINS ALL INGS W/OUT ASSOCIATION//
const ingredientsArray = []
//USER ADDS-REMOVES INGS//
const ingArray = []
//CONTAINS ALL COCKTAILS W/ING ASSOCIATION//
const cocktailsArray = []
//USED TO RENDER COCKTAIL LIST BY CHOSEN ALCOHOL//
let cocktailByAlcArray = []



// ------------ FETCH FOR ALL ING W/OUT ASSOCIATIONS ----------- //
fetch(baseURL + ingredients)
  .then(resp => resp.json())
  .then(result => {
    autocomplete(ingreInput, result)
    for (const i of result) {
      ingredientsArray.push(i)
    }
  })
  
// ------------ FETCH FOR ALL COCKTAILS W/ ING ASSOCIATION -------- //
fetch(baseURL + cocktails)
  .then(resp => resp.json())
  .then(result => {
    autocomplete(cockInput, result)
    for (const i of result) {
      cocktailsArray.push(i)
    }
  })


// -------------------- QUERY FUNCTIONS -------------------- //
function findIngre(ingreName){
  return ingredientsArray.find(ingre=>{return ingre.name === ingreName})
}
function findCocktail(cocktailName) {
  return cocktailsArray.find(cocktail=>{return cocktail.name == cocktailName})
}

// ----------- FUNCTION TO ADD USER ING TO LIST ------------ //
function renderIngreToList(ingreObj){
  const list = document.getElementById('ingredient-list')
  list.insertAdjacentHTML('beforeend', `
  <li data-id="${ingreObj.id}">
  ${ingreObj.name}
  <button id="ingredient-remove">x</button>
  </li>
  `)
}

// ----------------- CLICK LISTENER ----------------------//

document.addEventListener('click', e => {
  //REMOVE USER-ING FROM LIST & ASSOCIATED COCKTAILS FROM DIV//
  if (e.target.matches('button#ingredient-remove')){
    const name = e.target.parentElement.innerText.split(' x')
    const found = findIngre(name[0])
    findIngFromDB(found)
    e.target.parentElement.remove()
    cocktailDetail.style.display = "none"

    //REMOVE ING FROM FORM//
  } else if (e.target.matches('button#ingredient-remove-form')){
    e.target.parentElement.remove()
  
    // NEW COCKTAIL FORM//
  } else if (e.target.matches('button#new-cocktail')){
    modal.style.display = "flex"
    const editinput = document.getElementById('ingredients-input')
    autocomplete(editinput, ingredientsArray)
    const array = getCategoryArray(ingredientsArray)
    createCategoryDatalist(array)
    cocktailForm()

    //EDIT COCKTAIL FORM //
  } else if (e.target.matches('button#edit-cocktail')){
    modal.style.display = "flex"
    const editinput = document.getElementById('ingredients-input')
    autocomplete(editinput, ingredientsArray)
    const array = getCategoryArray(ingredientsArray)
    createCategoryDatalist(array)
    cocktailForm()
    populateFormWithCockTailData(e.target.dataset.id)
  }
})

//------------------- CLOSE MODAL FUNCTIONALITY -------------------//
function closeModal(){
  modal.style.display = "none"
  autocomplete(ingreInput, ingredientsArray)
}
window.onclick = e => {
  if (e.target == modal){
    modal.style.display = "none"
    autocomplete(ingreInput, ingredientsArray)
  } else if (e.target == detailClose) {
    console.log('success')
    cocktailDetail.style.display = "none"
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
  // --------- CLICK LISTENER WITHIN AUTOCOMPLETE ---------- //        
        b.addEventListener('click', e => {
          // MAIN SEARCH ING 
          if (e.target.parentElement.matches('#main-ing-searchautocomplete-list')) {
            const name = e.target.getElementsByTagName('input')[0].value
            const found = findIngre(name)
            findIngFromDB(found)
            cocktailDetail.style.display = "none"
            renderIngreToList(found)
            input.value = ""
            closeAllLists();
          //FORM SEARCH ING
          } else if (e.target.parentElement.matches('div#ingredients-inputautocomplete-list')){
            const name = e.target.getElementsByTagName('input')[0].value
            const found = findIngre(name)
            const amt = document.querySelector('input#measurement')
              addIngreToPageEditForm(found, amt.value)
              input.value = ""
              amt.value = ""
              closeAllLists();
          //MAIN SEARCH COCKTAIL
          } else if (e.target.parentElement.matches("#main-cocktail-searchautocomplete-list")) {
            const name = e.target.getElementsByTagName('input')[0].value
            const found = findCocktail(name)
            loadCocktail(found.id)
            input.value = ''
            closeAllLists();
          }
        });
        a.appendChild(b);
      }
    }
  });
  // -------- LISTENER FOR ARROW KEYS W/AUTOCOMPLETE -------//
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
  // ------- HELPER FUNCTIONS FOR AUTOCOMPLETE --------- //
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

//------------------  FORM FUNCTIONALITY  --------------------//
function addIngreToPageEditForm(ingObj, amtString){
  const div = document.querySelector('div#ingre-list-placeholder')
  div.insertAdjacentHTML('afterbegin', `
    <p data-drink-id="${ingObj.id}" data-amt="${amtString}">${amtString} - ${ingObj.name} <button id="ingredient-remove-form">x</button></p>
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
  // ADDS EVENT LISTENER & GRABS ALL VALUES OFF OF FORM
  function cocktailForm(){
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
  
        if (form.dataset.id){
          newCocktail.id = form.dataset.id
          fetchPatchCocktail(newCocktail, form.dataset.id)
        } else {
          newCocktail.user_made = true
          fetchPostNewCocktail(newCocktail)
        }
        autocomplete(ingreInput, ingredientsArray)
      })
    }
  }

  // -------------------- FETCH FOR NEW COCKTAIL ---------------------- //

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

// ------------- EDIT FORM FUNCTIONALITY --------------//

function populateFormWithCockTailData(cocktailId){
  const div = document.querySelector('div#ingre-list-placeholder')
  document.querySelector('input#form-submit-btn').value = "Update Cocktail"
  document.querySelector('h3#form-header').innerText = "Update Cocktail"
  fetch(baseURL + cocktails + cocktailId)
    .then(resp => resp.json())
    .then(result => {
      form.name.value = result.name
      form.category.value = result.category
      form.glass.value = result.glass
      form.alcoholic.checked = result.alcoholic
      form.instructions.value = result.instructions
      form.thumbnail.value = result.thumbnail
      div.innerHTML = ""
      form.dataset.id = cocktailId
      for (const meas of result.measurements){
        for (const ing of result.ingredients){
          if (meas.ingredient_id == ing.id){
            addIngreToPageEditForm(ing, meas.amount)
          }
        } 
      }
    })
}

// --------------- FETCH FOR PATCH FORM ------------------ //

function fetchPatchCocktail(cocktailObj, cocktailId){
  console.dir(cocktailObj)
  console.dir(cocktailId)
  configObj = {
    method: 'PATCH', 
    headers: {'Content-Type': 'application/json', 'Accept': 'application/json'}, 
    body: JSON.stringify(cocktailObj)
  }
  fetch(baseURL+cocktails+cocktailId, configObj)
  .then(resp => resp.json())
  .then(result => {
    console.dir(result)
    if (result){
      renderCocktailDetail(result)
      modal.style.display = "none"
    }
  })
}

//-----------------FUNCTIONS DEALING WITH COCKTAIL LIST-----------------//

// -- FETCH FOR SINGLE ING -- //
function findIngFromDB(ingObj){
  fetch(baseURL + ingredients + ingObj.id)
    .then(resp => resp.json())
    .then(result => {
      ingArrayHander(result)
    })
}

// ADDS OR REMOVES ING FROM INGARRAY //
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

// ONLY RETURNS COCKTAILS THAT ARE REPEATED //
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

// -------------- RENDERS COCKTAILS TO COCKTAIL DIV ------------------- // 

function renderCocktailDiv(ingArray){
  cocktailList.style.display = "none"
  cocktailList.innerHTML = ""
  if (ingArray.length > 0){
    cocktailList.style.display = "flex"
  }

  let renderCocktails = []
  
  
  for (const ing of ingArray){
    for (const cocktail of ing.cocktails) {
      renderCocktails.push(cocktail)
    }
  }
  if (ingArray.length === 1) {
    for (const cocktail of renderCocktails)
      cocktailList.insertAdjacentHTML('beforeend', `
    <button class="close" type="button" onclick="closeDetail(${cocktail.id})">×</button>
    <button onclick="loadCocktail(${cocktail.id})" type='cocktail-button' id='cocktail-btn'>${cocktail.name}</button>
    `)
  } else {
    const cocktailsNew = getDuplicateArrayElements(renderCocktails)
    for (const cocktail of cocktailsNew)
      cocktailList.insertAdjacentHTML('beforeend', `
    <button class="close" type="button" onclick="closeDetail(${cocktail.id})">×</button>
    <button onclick="loadCocktail(${cocktail.id})" type='cocktail-button' id='cocktail-btn'>${cocktail.name}</button>
    `)
  }
}


// ----- FETCH TO GET SINGLE COCKTAIL ----- //
function loadCocktail(cocktailId) {
  fetch(baseURL + cocktails + cocktailId)
    .then(resp => resp.json())
    .then(renderCocktailDetail)
}



function closeDetail(id) {
  if (id) {
    cocktailDetail.style.display = "none"
  } else {
    cocktailList.style.display = 'none'
  }
}

function renderCocktailDetail(cocktail) {
  cocktailDetail.innerHTML = ''
  let ingreMeasureHTML = ''
  for (const meas of cocktail.measurements){
    for (const ing of cocktail.ingredients){
      if (meas.ingredient_id == ing.id)
      ingreMeasureHTML += `
        <li id='cocktail-measures'>${meas.amount} ${ing.name}</li>
      `
    }
  }
  cocktailDetail.style.display = "flex"
  
  cocktailDetail.innerHTML = `
  <button class="close" type="button" onclick="closeDetail(${cocktail.id})">×</button>
  <img style="max-width:50%;" src="${cocktail.thumbnail}">
  <h3 id="cocktail-title">${cocktail.name}</h4>
  <ul>
  ${ingreMeasureHTML}
  </ul>
  <p id='glass-type'>${cocktail.glass}</p>
  <p id='cocktail-desc'>${cocktail.instructions}</p>
  <button id="edit-cocktail" data-id="${cocktail.id}">Edit Cocktail</button>
  `

  if (cocktail.user_made === true) {
    cocktailDetail.insertAdjacentHTML('beforeend', `
    <button id='cocktail-stat'>User Created</button>
    `)
  }
}

//-------------- CLICK LISTENER FOR ALCOHOL ICONS ----------------- //


alcList.addEventListener('click', e => {
  if (e.target.matches('div#alcohol-list')){

  } else {
    const allIcons = document.querySelectorAll('figure.alc-icon')
    allIcons.forEach(e=> e.style.background = "white")

    cocktailByAlcArray.length = 0
    cocktailList.style.display = 'flex'
    cocktailList.innerHTML = ''
    cocktailDetail.style.display = "none"
    if (e.target.parentElement.matches('figure')){
      e.target.parentElement.style.background = "rgba(112, 159, 242, 0.892)"
    }
    
    
    for (const ingre of ingredientsArray) {
      if (e.target.parentElement.id === ingre.category) {
          cocktailByAlcArray.push(ingre)
      }
    }

    for (const ingre of cocktailByAlcArray) {
      for (const cocktail of ingre.cocktails) {
        cocktailList.insertAdjacentHTML('afterbegin', `
          <button onclick="loadCocktail(${cocktail.id})" type='cocktail-button' class='cocktail-btn' data-hover="View Recipe"><div>${cocktail.name}</div></button>
        `)
      }
    }
    cocktailList.insertAdjacentHTML('afterbegin', `
    <button class="close" type="button" onclick="closeDetail()">×</button>
    `)
  }
})




