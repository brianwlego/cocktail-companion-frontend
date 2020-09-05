
const baseURL = 'http://localhost:3000/'
const ingredients = 'ingredients'
const cocktails = 'cocktails'

const ingreInput = document.querySelector('input#ingredient')
const searchDiv = document.getElementById('main-search')
const modal = document.getElementById('form-div-container')
const ingInp = document.getElementById('ingredients-form')

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
}


searchDiv.addEventListener('click', e => {
  if (e.target.matches('button#ingredient-remove')){
    e.target.parentElement.remove()
  } else if (e.target.matches('button#new-cocktail')){
    modal.style.display = "flex"
    autocomplete(ingInp, ingredientsArray)
  }
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

function autocomplete(ingInp, ingArray) {
  let currentFocus;
  ingInp.addEventListener("input", e => {
      let val = e.target.value;
      console.log(e.target.value)
      closeAllLists()
      if (!val) { return false}
      currentFocus = -1

      let a = document.createElement("div")
      a.id = e.target.id + "autocomplete-list"
      a.classList.add('autocomplete-items')
      e.target.parentNode.appendChild(a)

    for (const i of ingArray){
      if (i.name.substr(0, val.length).toUpperCase() == val.toUpperCase()){
        let b = document.createElement('div')
        b.innerHTML = `
        <strong>${i.name.substr(0, val.length)}</strong>${i.name.substr(val.length)}
        <input type='hidden' value="${i.name}">
        `
        b.addEventListener('click', e => {
          ingInp.value = e.target.getElementsByTagName('input')[0].value
          closeAllLists()
        })
        a.appendChild(b)
      }
    }

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
      e.preventDefault()
      if (currentFocus > -1){
        if (x) x[currentFocus].click()
      }
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
  document.addEventListener("click", e => {closeAllLists(e.target)})
  })
}


//----------------------------------------------------------//

//FUNCTIONS DEALING WITH COCKTAIL LIST//
function renderCocktailDiv(foundIngre){


}
