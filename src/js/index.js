import Search from './models/Search';
import Recipe from './models/Recipe';
import * as searchView from './views/searchView';
import { elements, renderLoader, clearLoader } from './views/base';

/** State Global 
 * - Search object
 * - Current recipe object
 * - Shopping list object
 * - Liked Recipes
*/
const state = {};

/** 
 * SEARCH CONTROLLER 
 */
const controlSearch = async () => {
    // 1) Pega a query da view
    const query = searchView.getInput();
    if (query) {
        // 2) Nova objeto de busca e adiciona ao estado(state)
        state.search = new Search(query);
        console.log(query);
        // 3) Prepara a interface de usuário(UI) para os resultados
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);
        try {
            // 4) Buscar por receitas
            await state.search.getResults();
            // 5) Renderizar os resultados na interface de usuário
            clearLoader();
            searchView.renderResults(state.search.result);
        } catch (error) {
            alert('Erro ao processar a busca!');
        }
    }
}
elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
});

elements.searchResPages.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline');
    if (btn) {
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);
    }
});

/** 
 * RECIPE CONTROLLER 
 */
const controlRecipe = async () => {
    //pega o id através do hash na url e da um replace na tralha
    const id = window.location.hash.replace('#', '');

    if (id) {
        //Prepara a UI para mudanças

        //Cria novo objeto de Receita
        state.recipe = new Recipe(id);
        try {
            //Pega os dados da receita e parse ingredientes
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();

            // state.recipe.parseIngredients();
            //Calcula porções e tempo de preparo
            state.recipe.calcTime();
            state.recipe.calcServings();
            //Renderiza a receita
            console.log(state.recipe);
        } catch (error) {
            alert('Erro ao processar receita!');
        }
    }
};
// window.addEventListener('hashchange', controlRecipe);
//'Corrigindo' a busca caso o usuario acesse diretamente o link usando o id da receita
// window.addEventListener('load', controlRecipe);
//adicionar o mesmo EventListener pra diferentes eventos
['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));
