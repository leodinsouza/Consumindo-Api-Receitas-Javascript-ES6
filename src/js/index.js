import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
import { elements, renderLoader, clearLoader } from './views/base';

/** State Global 
 * - Search object
 * - Current recipe object
 * - Shopping list object
 * - Liked Recipes
*/
const state = {};
window.state = state;
/** 
 * SEARCH CONTROLLER 
 */
const controlSearch = async () => {
	// 1) Pega a query da view
	const query = searchView.getInput();
	if (query) {
		// 2) Nova objeto de busca e adiciona ao estado(state)
		state.search = new Search(query);
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
};
elements.searchForm.addEventListener('submit', (e) => {
	e.preventDefault();
	controlSearch();
});

elements.searchResPages.addEventListener('click', (e) => {
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
		recipeView.clearRecipe();
		renderLoader(elements.recipe);
		//Deixar marcado o item selecionado
		if (state.search) searchView.highLightSelected(id);
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
			clearLoader();
			recipeView.renderRecipe(
				state.recipe,
				state.likes.isLiked(id)
			);
		} catch (error) {
			alert('Erro ao processar receita!');
			console.log(error);
		}
	}
};
// window.addEventListener('hashchange', controlRecipe);
//'Corrigindo' a busca caso o usuario acesse diretamente o link usando o id da receita
// window.addEventListener('load', controlRecipe);
//adicionar o mesmo EventListener pra diferentes eventos
['hashchange', 'load'].forEach((event) => window.addEventListener(event, controlRecipe));

//LIST COTROLLER
const controlList = () => {
	// Cria a nova lista se ainda não houver nenhuma
	if (!state.list) state.list = new List();
	//Adiciona cada ingrediente à Lista
	state.recipe.ingredients.forEach((el) => {
		const item = state.list.addItem(el.count, el.unit, el.ingredient);
		listView.renderItem(item);
	});
};

//Deletando e atualizando a lista de itens
elements.shopping.addEventListener('click', e => {
	const id = e.target.closest('.shopping__item').dataset.itemid;
	//Deletar
	if (e.target.matches('.shopping__delete, .shopping__delete *')) {
		//deletar do state
		state.list.deleteItem(id);
		//deletar da interface de usuário
		listView.deleteItem(id);
		//atualizando a quantidade
	} else if (e.target.matches('.shopping__count-value')) {
		const val = parseFloat(e.target.value);
		state.list.updateCount(id, val);
	}
});

//LIKE CONTROLLER
const controlLike = () => {
	if (!state.likes) state.likes = new Likes();
	const currentId = state.recipe.id;
	//usuário ainda não curtiu a receita	
	if (!state.likes.isLiked(currentId)) {
		//adiciona a curtida ao state
		const newLike = state.likes.addLike(
			currentId,
			state.recipe.title,
			state.recipe.author,
			state.recipe.img
		);
		//Alterna o botão curtir
		likesView.toggleLikeBtn(true);
		//Adicionar a curtida na lista da interface de usuário
		likesView.renderLike(newLike);
		//usuário já curtiu a receita
	} else {
		//Remover a curtida ao state
		state.likes.deleteLike(currentId);
		//Alterna o botão curtir
		likesView.toggleLikeBtn(false);
		//Remover a curtida na lista da interface de usuário
		likesView.deleteLike(currentId);
	}
	likesView.toggleLikeMenu(state.likes.getNumLikes());
}

// Recupera as receitas curtidas ao carregar a página
window.addEventListener('load', () => {
	state.likes = new Likes();
	//Restaura as curtidas
	state.likes.readStorage();
	//Alterna o menu de curtidas
	likesView.toggleLikeMenu(state.likes.getNumLikes());
	//Renderiza as curtidas existentes
	state.likes.likes.forEach(like => likesView.renderLike(like));
});

//Event Delegation usando matches para incrementar ou decrementar o numero de pratos servidos
//Manipulando o clique de botões
elements.recipe.addEventListener('click', (e) => {
	// .btn-decrease * --> qualeurt elemento filho de btn-decrease
	if (e.target.matches('.btn-decrease, .btn-decrease *')) {
		//Botão diminuir foi clicado
		if (state.recipe.servings > 1) {
			state.recipe.updateServings('dec');
			recipeView.updateServingsIngredients(state.recipe);
		}
	} else if (e.target.matches('.btn-increase, .btn-increase *')) {
		//Botão aumentar foi clicado
		state.recipe.updateServings('inc');
		recipeView.updateServingsIngredients(state.recipe);
	} else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
		//Adiciona ingredientes à lista
		controlList();
	} else if (e.target.matches('.recipe__love, recipe__love *')) {
		//Like Controller
		controlLike();
	}
});
