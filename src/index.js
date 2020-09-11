
const baseURL = 'http://localhost:3000/'
const ingredients = 'ingredients/'
const cocktails = 'cocktails/'
//MAIN SEARCH ELEMENTS
const ingreInput = document.getElementById('main-ing-search')
const list = document.getElementById('ingredient-list')
const cockInput = document.getElementById('main-cocktail-search')
const searchDiv = document.getElementById('main-search')
const alcList = document.getElementById('alcohol-list')
//FIGURE ICONS
const allIcons = document.querySelectorAll('figure.alc-icon')


//FORM ELEMENTS
const modal = document.getElementById('form-div-container')
const formDiv = document.getElementById('form').children
const detailClose = document.getElementById('detail-close')
const formIngDiv = document.querySelector('div#ingre-list-placeholder')

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
//USED TO KEEP USER FROM ADDING SAME ING TWICE
let ingListDataIds = []



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
  list.insertAdjacentHTML('beforeend', `
  
    <div data-id="${ingreObj.id}" class="ing-form-div" style="margin: 5px 0;">
      ${ingreObj.name}
      <button id="ingredient-remove" data-name="${ingreObj.name}">x</button>
    </div>

  `)
  ingListDataIds.push(ingreObj.id)
}

// ----------------- CLICK LISTENER ----------------------//

document.addEventListener('click', e => {
  //REMOVE USER-ING FROM LIST & ASSOCIATED COCKTAILS FROM DIV//
  if (e.target.matches('button#ingredient-remove')){
    const name = e.target.dataset.name
    const found = findIngre(name)
    ingListDataIds = ingListDataIds.filter(e => e != found.id)
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
    document.querySelector('button#form-submit-btn').innerText = "Create New Cocktail"
    document.querySelector('h3#form-header').innerText = "Create New Cocktail"
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
  autocomplete(cockInput, cocktailsArray)
  formDiv[0].dataset.id = ""
  formDiv[1].value = "", formDiv[4].value = "", formDiv[5].value = "", formDiv[7].value = "", formDiv[8].value = ""
  formIngDiv.innerHTML = ""
}
window.onclick = e => {
  if (e.target == modal || e.target == detailClose){
    closeModal()
  }
}
// ----------------- AUTO COMPLETE FUNCTIONALITY -------------//

function autocomplete(input, inputArray){
  let currentFocus
  input.addEventListener("input", e => {
    allIcons.forEach( e => e.classList.remove('active'))  
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
            if (!ingListDataIds.includes(found.id)){
              findIngFromDB(found)
              cocktailDetail.style.display = "none"
              renderIngreToList(found)
              input.value = ""
              closeAllLists();
            }
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
  formIngDiv.insertAdjacentHTML('afterbegin', `
    <div class="ing-form-div" data-drink-id="${ingObj.id}" data-amt="${amtString}">
      <p >${amtString} - ${ingObj.name}</p>
      <button id="ingredient-remove-form">x</button>
    </div>
    
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
    const h3 = document.querySelector('h3#form-header')  
    const submitBtn = document.querySelector('#form-submit-btn')
      submitBtn.addEventListener('click', e => {
        // e.preventDefault()
        if (e.target.matches('button#form-submit-btn')){
          const form = e.target.parentElement.children
          const measurementUls = [...document.querySelector('div#ingre-list-placeholder').children]
          const measArrayNewObjs = createNewMeasurements(measurementUls)
          const newCocktail = {
            name: form[1].value, 
            category: form[5].value, 
            glass: form[4].value, 
            instructions: form[8].value, 
            thumbnail: form[7].value,
            measurements_attributes: measArrayNewObjs
          }
          if (h3.dataset.id){
            newCocktail.id = h3.dataset.id
            fetchPatchCocktail(newCocktail, h3.dataset.id)
          } else {
            newCocktail.user_made = true
            fetchPostNewCocktail(newCocktail)
          }
        }  
        autocomplete(ingreInput, ingredientsArray)
      })

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
    if (result.id){
      cocktailsArray.push(result)
      renderCocktailDetail(result)
      closeModal()
    } else {
      modal.style.display = "none"
    }
  })
}

// ------------- EDIT FORM FUNCTIONALITY --------------//

function populateFormWithCockTailData(cocktailId){
  const div = document.querySelector('div#ingre-list-placeholder')
  document.querySelector('button#form-submit-btn').innerText = "Update Cocktail"
  const h3 = document.querySelector('h3#form-header')
  h3.innerText = "Update Cocktail"
  fetch(baseURL + cocktails + cocktailId)
    .then(resp => resp.json())
    .then(result => {
      formDiv[1].value = result.name
      formDiv[5].value = result.category
      formDiv[4].value = result.glass
      formDiv[8].value = result.instructions
      formDiv[7].value = result.thumbnail
      div.innerHTML = ""
      h3.dataset.id = cocktailId
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
      closeModal()
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
  let renderCocktails = []

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
    renderCocktails.sort((a, b) => (a.name > b.name) ? 1 : -1)
    for (const cocktail of renderCocktails) {
      cocktailList.insertAdjacentHTML('beforeend', `
      <button onclick="loadCocktail(${cocktail.id})" type='cocktail-button' class='cocktail-btn fade-in' data-hover="View Recipe"><div>${cocktail.name}</div></button>
    `)
    }
    cocktailList.insertAdjacentHTML('afterbegin', `
      <button class="close fade-in" type="button" onclick="closeDetail()">×</button>
    `)
  } else {
    const cocktailsNew = getDuplicateArrayElements(renderCocktails)
    cocktailsNew.sort((a, b) => (a.name > b.name) ? 1 : -1)
    for (const cocktail of cocktailsNew){
      cocktailList.insertAdjacentHTML('beforeend', `
      <button onclick="loadCocktail(${cocktail.id})" type='cocktail-button' class='cocktail-btn fade-in' data-hover="View Recipe"><div>${cocktail.name}</div></button>
    `)
    }
    cocktailList.insertAdjacentHTML('afterbegin', `
      <button class="close" type="button" onclick="closeDetail()">×</button>
    `)
  }
}


// ----- FETCH TO GET SINGLE COCKTAIL ----- //
function loadCocktail(cocktailId) {
  fetch(baseURL + cocktails + cocktailId)
    .then(resp => resp.json())
    .then(renderCocktailDetail)
}

//-------- CLOSE DIV'S FROM BUTTON -------//

function closeDetail(id) {
  //CLOSE COCKTAIL DETAILS
  if (id) {
    cocktailDetail.style.display = "none"

  //CLOSE COCKTAIL LIST
  } else {
    cocktailList.style.display = 'none'
    list.innerHTML = ""
    ingArray.length = 0
    allIcons.forEach( e => e.classList.remove('active'))

  }
}

function renderCocktailDetail(cocktail) {
  cocktailDetail.innerHTML = ''
  let ingreMeasureHTML = ''
  for (const meas of cocktail.measurements){
    for (const ing of cocktail.ingredients){
      if (meas.ingredient_id == ing.id)
      ingreMeasureHTML += `
      <div id="meas-and-ing-wrapper">
        <span id="one">${meas.amount}</span><span id="two">${ing.name}</span>
      </div>
      `
    }
  }
  cocktailDetail.style.display = "flex"
  
  cocktailDetail.innerHTML = `
  <button class="close fade-in" type="button" onClick="closeDetail(${cocktail.id})">×</button>
  <img class='fade-in' id='thumbnail' style="max-width:50%;" src="${cocktail.thumbnail}">
  <h3 class='fade-in' id="cocktail-title">${cocktail.name}</h4>
  <div class='fade-in' id="detail-list-wrapper">
    ${ingreMeasureHTML}
    <p class='fade-in' id='glass-type'>Served in a ${cocktail.glass}</p>
  </div>
  <p class='fade-in' id='cocktail-desc'>${cocktail.instructions}</p>
  <button class='fade-in' id="edit-cocktail" data-id="${cocktail.id}">Edit Cocktail</button>
  `

  if (cocktail.user_made === true) {
    cocktailDetail.insertAdjacentHTML('beforeend', `
    <button id='cocktail-stat'>User Created</button>
    `)
  }
  cocktailDetail.classList.add('fade-in')
}

{/* <h4 class='c-titles'>Ingredients</h4>
<h4 class='c-titles'>Instructions</h4> */}
//-------------- CLICK LISTENER FOR ALCOHOL ICONS ----------------- //


alcList.addEventListener('click', e => {
  if (e.target.matches('div#alcohol-list')){
  } else {
    cocktailByAlcArray.length = 0
    cocktailList.style.display = 'flex'
    cocktailList.innerHTML = ''
    cocktailDetail.style.display = "none"
    if (e.target.parentElement.matches('figure')){
      allIcons.forEach( e => e.classList.remove('active'))
      e.target.parentElement.classList.add('active')
    }
    for (const ingre of ingredientsArray) {
      if (e.target.parentElement.id === ingre.category) {
          cocktailByAlcArray.push(ingre)
      }
    }
    const bigArray = []
    for (const ingre of cocktailByAlcArray) {
      for (const cocktail of ingre.cocktails) {
        bigArray.push(cocktail)
      }
    }
    const result = []
    const map = new Map()
    for (const item of bigArray) {
        if(!map.has(item.name)){
            map.set(item.name, true);
            result.push({
                name: item.name,
                id: item.id,
            });
        }
    }
    result.sort((a, b) => (a.name > b.name) ? 1 : -1)
    for (const cocktail of result){
    cocktailList.insertAdjacentHTML('beforeend', `
        <button onclick="loadCocktail(${cocktail.id})" type='cocktail-button' class='cocktail-btn fade-in' data-hover="View Recipe"><div>${cocktail.name}</div></button>
        `)
    }
    cocktailList.insertAdjacentHTML('afterbegin', `
    <button class="close" type="button" onclick="closeDetail()">×</button>
    `)
  }
})