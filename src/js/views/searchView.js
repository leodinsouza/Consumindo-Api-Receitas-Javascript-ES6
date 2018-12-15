import { elements } from './base';

export const getInput = () => elements.searchInput.value;

export const clearInput = () => {
    elements.searchInput.value = '';
}

export const clearResults = () => {
    elements.searchResultList.innerHTML = '';
    elements.searchResPages.innerHTML = '';
}

/**
 *  'Pasta with tomato and spinach'
 * acc:0 / acc+cur.length = 5 / newTitle = ['Pasta']
 * acc:5 / acc+cur.length = 9 / newTitle = ['Pasta', 'with']
 * acc:9 / acc+cur.length = 15 / newTitle = ['Pasta', 'with', 'tomato']
 * acc:15 / acc+cur.length = 18 / newTitle = ['Pasta', 'with', 'tomato']
 * acc:18 / acc+cur.length = 25 / newTitle = ['Pasta', 'with', 'tomato']
 */
const limitRecipeTitle = (title, limit = 17) => {
    const newTitle = [];
    if (title.length > limit) {
        //divide o título
        title.split(' ').reduce((acc, cur) => {
            if (acc + cur.length <= limit) {
                newTitle.push(cur);
            }
            return acc + cur.length;
        }, 0);
        //retorna o resultado
        return `${newTitle.join(' ')}...`;
    }
    return title;
}

const renderRecipe = recipe => {
    const markup = `
        <li>
            <a class="results__link" href="#${recipe.recipe_id}">
                <figure class="results__fig">
                    <img src="${recipe.image_url}" alt="Test">
                </figure>
                <div class="results__data">
                    <h4 class="results__name">${limitRecipeTitle(recipe.title)}</h4>
                    <p class="results__author">${recipe.publisher}</p>
                </div>
            </a>
        </li>
    `;
    elements.searchResultList.insertAdjacentHTML('beforeend', markup);
}
//type: 'prev' ou 'next'
const createButton = (page, type) => `
        <button class="btn-inline results__btn--${type}" data-goto=${type === 'prev' ? page - 1 : page + 1}>
            <span>Page ${type === 'prev' ? page - 1 : page + 1}</span>
            <svg class="search__icon">
                <use href="img/icons.svg#icon-triangle-${type === 'prev' ? 'left' : 'right'}"></use>
                </svg>
        </button>
`;

const renderButtons = (page, numResults, resPerPage) => {
    //total de páginas. Quantidade de resultados(30 neste caso) divido pelo número de resultados por página(10 por poadrão neste caso)
    //Math.ceil arredondará o resultado para o próximo inteiro
    const pages = Math.ceil(numResults / resPerPage);
    let button;
    if (page === 1 && pages > 1) {
        //somente o Botão para ir para a próxima página
        button = createButton(page, 'next');
    } else if (page < pages) {
        //Botão para ir para a página anterior e botão para ir para a próxima página
        button = `
                ${createButton(page, 'prev')}
                ${createButton(page, 'next')}
            `;
    } else if (page === pages && pages > 1) {
        //última página - somente botão para volta para a página anterior
        button = createButton(page, 'prev');
    }
    elements.searchResPages.insertAdjacentHTML('afterbegin', button);
}

export const renderResults = (recipes, page = 1, resPerPage = 10) => {
    //renderiza os resultados da página atual
    const start = (page - 1) * resPerPage;
    const end = page * resPerPage;
    recipes.slice(start, end).forEach(renderRecipe);

    //renderiza os botões de paginação
    renderButtons(page, recipes.length, resPerPage);
}