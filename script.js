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
    if (langArr.length < 0) {
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

// asociamos los data

const pokeCard = document.querySelector('[data-poke-card]');

const pokeName = document.querySelector('[data-poke-name]');

const pokeImg = document.querySelector('[data-poke-img]');

const pokeImgBack = document.querySelector('[data-poke-back-img]')

const pokeImgContainer = document.querySelector('[data-poke-img-container]');

const pokeId = document.querySelector('[data-poke-id]');

const pokeTypes = document.querySelector('[data-poke-types]');

const pokeStats = document.querySelector('[data-poke-stats]');

const pokeMeasurements = document.querySelector('[data-poke-measurements]')

const spriteShiny = document.querySelector('[data-img-shiny]')

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

    default: '#FFFFFF',

};


/*creamos la funcion searchPokemon asociada al onsubmit del hmtl ;
en el fetch pondremos el enlace de la api que utilicemos ; por ultimo renderPokemonData es para obtener los sprites*/

const searchPokemon = event => {
    event.preventDefault();
    const { value } = event.target.pokemon;
    getAllSpecies(value, "en").then(pkmnArr => {
        if (pkmnArr.length === 1) {
            getData(pkmnArr[0].varieties[0].pokemon.url).then(pokemon => {
                renderPokemonData(pokemon)
            })
        } else {
            renderNotFound();
        }
    });

}




const renderPokemonData = data => {
    const sprite = data.sprites.front_default;
    const spriteBack = data.sprites.back_default;
    const { stats, types } = data;
    pokeName.textContent = data.name;
    pokeImg.setAttribute('src', sprite);
    pokeImgBack.setAttribute('src',spriteBack);
    pokeId.textContent = `Nº ${data.id}`;
    setCardColor(types);
    renderPokemonMeasurements(data);
    renderPokemonTypes(types);
    renderPokemonStats(stats);
}




const setCardColor = types => {
    const color = typeColors[types[0].type.name];
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
    stats.forEach(stat => {
        const statElement = document.createElement("div");
        const statElementName = document.createElement("div");
        const statElementAmount = document.createElement("div");
        statElementName.textContent = stat.stat.name;
        statElementAmount.textContent = stat.base_stat;
        statElement.appendChild(statElementName);
        statElement.appendChild(statElementAmount);
        pokeStats.appendChild(statElement);
    });
}

function renderPokemonMeasurements(pokemon) {
    pokeMeasurements.innerHTML = `${pokemon.weight/10} kg ${pokemon.height*10} cm`;
}


const renderNotFound = () => {
    pokeName.textContent = 'No encontrado';
    pokeImg.setAttribute('src', 'sadge.png');
    pokeImgBack.setAttribute('src', '');
    pokeImg.style.background = '#fff';
    pokeTypes.innerHTML = '';
    pokeStats.innerHTML = '';
    pokeId.textContent = '';


}
