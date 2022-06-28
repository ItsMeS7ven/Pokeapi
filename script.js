class Pokemon {
    constructor(name, stats, dexEntries) {
        this.name = name;
        this.stats = stats;
        this.dexEntries = dexEntries;
    }
    toString() {
        return this.name;
    }
}
// asociamos los data

const pokeCard = document.querySelector('[data-poke-card]');
const pokeName = document.querySelector('[data-poke-name]');
const pokeImg = document.querySelector('[data-poke-img]');
const imgBack = document.querySelector('[data-poke-back]');
const pokeImgContainer = document.querySelector('[data-poke-img-container]');
const pokeId = document.querySelector('[data-poke-id]');
const pokeTypes = document.querySelector('[data-poke-types]');
const pokeStats = document.querySelector('[data-poke-stats]');
const pokeMeasurements = document.querySelector('[data-poke-measurements]')
const pokedex = document.querySelector('[data-get-dex-entries]')
const searchList = document.querySelector('[data-poke-list]')

// los colores que asocias a los tipos ( sacados de la tabla de colores hex)

const typeColors = {

    electric: '#FFF417',

    normal: '#FFFFFF',

    fire: '#FF1300',

    water: '#3F8AFF',

    ice: '#ADFBFF',

    rock: '#9A5405',

    flying: '#7CC4C2',

    grass: '#32FF19',

    psychic: '#DD66C5',

    ghost: '#600A7B',

    bug: '#078E44',

    poison: '#D14CE3',

    ground: '#E9CB66',

    dragon: '#8E1354',

    steel: '#A7A7A7',

    fighting: '#FFE57A',

    fairy: '#F783E3',

    dark: '#705746',

    default: '#FFFFFF',

};
let lang = "pt-BR"
const statNames = ["", "", "", "", "", ""]


async function setLang(idLang) {
    for (let i = 1; i <= statNames.length; i++) {
        statNames[i - 1] = getNameLang(await getData(`https://pokeapi.co/api/v2/stat/${i}/`), idLang);
    }
}



// getData(url) devuelve una promesa que si funciona devuelve el objeto correspondiente a la URL que le hayamos pasado
// La URL debe ser válida
async function getData(url) {
    const res = await fetch(url)
    const data = await res.json()
    return data
}
// getNameLang (obj, lang) recibe el objeto y un código de idioma y devuelve el nombre en el idioma.
// Si el código de idioma no coincide con los disponibles devuelve inglés (en).
// El objeto recibido debe poseer las estructuras obj.names[].name obj.names[].language.name
function getNameLang(obj, lang) {
    let en;
    for (let i = 0; i < obj.names.length; i++) {

        if (obj.names[i].language.name === lang) {
            return obj.names[i].name
        } else if (obj.names[i].language.name === "en") {
            en = obj.names[i].name
        }
    }
    return en
}

async function getPokemon(species, lang) {
    let pkmn = new Pokemon("", await getData(species.varieties[0].pokemon.url), getDexEntries(species, lang));
    for (let i = 0; i < species.names.length; i++) {
        if (species.names[i].language.name === lang) {
            pkmn.name = species.names[i].name;
            return pkmn;
        } else if (species.names[i].language.name === "en") {
            pkmn.name = species.names[i].name;
        }
    }
    return pkmn
}

async function searchMatches(string, lang) {
    const allData = await getData("https://pokeapi.co/api/v2/pokemon-species/?limit=20000");
    string = string.toLowerCase();
    let pkmnArr = new Array;
    for (let i = 0; i < allData.count; i++) {
        let pkmn = await getPokemon(await getData(allData.results[i].url), lang);
        if (pkmn.name.toLowerCase().includes(string)) {
            pkmnArr.push(pkmn);
        }
    }
    return pkmnArr
}

//quickRender(pkmn, name) genera cada una de las piezas de la lista de pokemon a elegir
function quickRender(pkmn) {
    fragment = document.createDocumentFragment();
    const square = document.createElement("div")
    square.addEventListener("click", event => {
        pokeName.textContent = pkmn.name;
        renderPokemonData(pkmn.stats);
        const dex = pkmn.dexEntries;
        renderDexEntry(dex[Math.floor(Math.random() * dex.length)]);
    });
    const img = document.createElement("img");
    img.setAttribute("src", pkmn.stats.sprites.front_default);
    img.style.backgroundColor = typeColors[pkmn.stats.types[0].type.name];
    const txt = document.createElement("p");
    txt.append(document.createTextNode(pkmn.name));
    square.appendChild(img);
    square.appendChild(txt)
    fragment.appendChild(square);
    return fragment;
}

function listPokemon(pkmnArr) {
    pkmnArr.forEach(element => {
        searchList.appendChild(quickRender(element))
    });
}

// getDexEntries (obj, lang) recibe el objeto y un código de idioma y devuelve un array con las entradas de pokedex en el idioma.
// Si el código de idioma no coincide con los disponibles devuelve inglés (en).
// El objeto recibido debe poseer las estructuras obj.flavor_text_entries[].flavor_text obj.flavor_text_entries[].language.name
function getDexEntries(obj, lang) {
    let enArr = new Array;
    let langArr = new Array;
    for (let i = 0; i < obj.flavor_text_entries.length; i++) {

        if (obj.flavor_text_entries[i].language.name === lang) {
            langArr.push(obj.flavor_text_entries[i].flavor_text)
        } else if (obj.flavor_text_entries[i].language.name === "en") {
            enArr.push(obj.flavor_text_entries[i].flavor_text)
        }
    }
    if (langArr.length > 0) {
        return langArr
    } else {
        return enArr
    }
}

// getAllSpecies(string, lang) recibe un string y un código de idioma y devuelve un array con todos las especies de pokemon cuyo nombre contenga el string.
// Si el código de idioma no coincide con los disponibles  devolverá un array vacío.
//
async function getAllSpecies(string, lang) {
    string = string.toLowerCase();
    let pkmnArr = new Array;
    const allData = await getData("https://pokeapi.co/api/v2/pokemon-species/?limit=20000");
    for (let i = 0; i < allData.count; i++) {
        const pkmn = await getData(allData.results[i].url);
        if (getNameLang(pkmn, lang).toLowerCase().includes(string)) {
            pkmnArr.push(pkmn)
        }
    }
    return pkmnArr
}


/*creamos la funcion searchPokemon asociada al onsubmit del hmtl ;
en el fetch pondremos el enlace de la api que utilicemos y ToLowerCase para
que no de problemas al usuario si utiliza mayusculas; por ultimo renderPokemonData es para obtener los sprites*/

const searchPokemon = event => {
    event.preventDefault();
    const { value } = event.target.pokemon;
    searchList.innerHTML = "";
    pokedex.innerHTML = "";
    searchMatches(value, lang).then(pkmnArr => {
        console.log(pkmnArr);
        if (pkmnArr.length == 0) {
            renderNotFound()
        } else if (pkmnArr.length > 1) {
            listPokemon(pkmnArr);
        } else {
            pokeName.textContent = pkmnArr[0].name;
            renderPokemonData(pkmnArr[0].stats)
            const dex = pkmnArr[0].dexEntries;
            renderDexEntry(dex[Math.floor(Math.random() * dex.length)])
        }
    })

}

const renderPokemonData = data => {
    searchList.innerHTML = "";
    const sprite = data.sprites.front_default;
    const spriteBack = data.sprites.back_default;
    const { stats, types } = data;
    pokeImg.setAttribute('src', sprite);
    imgBack.setAttribute('src', spriteBack);
    pokeId.textContent = `Nº ${data.id}`;
    setCardColor(types);
    renderPokemonMeasurements(data);
    renderPokemonTypes(types);
    renderPokemonStats(stats);

}

const setCardColor = types => {
    const colorOne = typeColors[types[0].type.name];
    const colorTwo = types[1] ? typeColors[types[1].type.name] : typeColors.default;
    pokeImg.style.background = `-gradient(${colorTwo} 33%, ${colorOne} 33%)`;
    pokeImg.style.backgroundSize = ' 10px 10px';
}

const renderPokemonTypes = types => {
    pokeTypes.innerHTML = '';
    types.forEach(type => {
        const typeTextElement = document.createElement("div");
        typeTextElement.style.color = typeColors[type.type.name];
        typeTextElement.textContent = type.type.name;
        pokeTypes.appendChild(typeTextElement);
    });
}

const renderPokemonStats = stats => {
    pokeStats.innerHTML = '';
    for (let i = 0; i < stats.length; i++) {
        const stat = stats[i];
        const statElement = document.createElement("div");
        const statElementName = document.createElement("div");
        const statElementAmount = document.createElement("div");
        statElementName.textContent = statNames[i];
        statElementAmount.textContent = stat.base_stat;
        statElement.appendChild(statElementName);
        statElement.appendChild(statElementAmount);
        pokeStats.appendChild(statElement);
    };
}

function renderPokemonMeasurements(pokemon) {
    pokeMeasurements.innerHTML = `${pokemon.weight/10} kg ${pokemon.height*10} cm`;
}


const renderNotFound = () => {
    pokeName.textContent = 'No encontrado';
    pokeImg.setAttribute('src', 'sadge.png');
    pokeImg.style.background = '#fff';
    pokeTypes.innerHTML = '';
    pokeStats.innerHTML = '';
    pokeId.textContent = '';
    renderDexEntry("????????????????????????????????????????")
    pokeMeasurements.innerHTML = '';

}

function renderDexEntry(entry) {
    listPokemon.innerHTML = "";
    pokedex.textContent = entry;
}
setLang(lang);