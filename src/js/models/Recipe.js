import axios from 'axios';
import { key, proxy } from '../config';
export default class Recipe {
    constructor(id) {
        this.id = id;
    }
    async getRecipe() {

        try {
            const res = await axios(`${proxy}https://www.food2fork.com/api/get?key=${key}&rId=${this.id}`);
            this.title = res.data.recipe.title;
            this.author = res.data.recipe.publisher;
            this.img = res.data.recipe.image_url;
            this.url = res.data.recipe.source_url;
            this.ingredients = res.data.recipe.ingredients;

        } catch (error) {
            console.log(error);
        }
    }
    //Tempo de preparo
    calcTime() {
        //Assumindo grosseiramente que precisamos de 15 minutos a cadas 3 ingredientes
        const numIng = this.ingredients.length;
        const periods = Math.ceil(numIng / 3);
        this.time = periods * 15;
    }
    //Número de pessoas servidas
    calcServings() {
        this.servings = 4;
    }
    //criar um novo array, com alguns ingredientes novos baseados nos antigos
    parseIngredients() {
        const unitsLong = ['tablespoon', 'tablespoons', 'ounces', 'ounce', 'teaspoons', 'teaspoon', 'cups', 'pounds'];
        const unitsShort = ['tbsp', 'tbsp', 'oz', 'oz', 'tsp', 'tsp', 'cup', 'pound'];
        //adicioar mais unidades usando destructuring. Usando os três pontos para desestruturar o unitShort.
        const units = [...unitsShort, 'kg', 'g'];
        const newIngredients = this.ingredients.map(el => {
            // 1) unidades padronizadas - as unidades devem ser todas iguais
            let ingredient = el.toLowerCase();
            unitsLong.forEach((unit, i) => {
                ingredient = ingredient.replace(unit, unitsShort[i]);
            });
            // 2) remover parenteses
            ingredient = ingredient.replace(/ *\([^)]*\) */g, ' ');

            // 3) passar a contagem de ingredientes, unidade e ingredient
            //array de ingredientes, dividindo
            const arrIng = ingredient.split(' ');
            /** encontrar o índice onde a unidade está localizada - não sabemos qual unidade estamos procurando, por isso usamos findIndex()
            * na funçãio findIndex passamos uma função callback, então pra cada elemento(el2) será feito um teste e o que queremos testar aqui
            * são as unidades. Includes é um novo método de array, ele retorna true se o elemento que estamos passando está no array e falso
            * caso não esteja. Isto é como um loop
            */
            const unitIndex = arrIng.findIndex(el2 => units.includes(el2));
            //objeto de ingredientes a ser retornado
            let objIng;
            if (unitIndex > -1) {
                //tem unidade
                //Ex. 4 1/2 cups, arrCount será [4, 1/2]
                // 4cups, arrCount será [4]
                const arrCount = arrIng.slice(0, unitIndex);
                let count;
                //Erro ao acessar com if abaxo o produto: JELLO COOKIES (CRISP PASTELS)
                if (arrCount.length === 1) {
                    count = eval(arrIng[0].replace('-', '+'));
                } else {
                    //Ex. 4 1/2 cups, arrCount será [4, 1/2] --> eval('4+1/2') --> 4.5
                    count = eval(arrIng.slice(0, unitIndex).join('+'));
                }

                objIng = {
                    count,
                    unit: arrIng[unitIndex],
                    ingredient: arrIng.slice(unitIndex + 1).join(' ')
                }
            } else if (parseInt(arrIng[0], 10)) {
                //Não tem unidade, mas o primeiro elemento é um número
                objIng = {
                    count: parseInt(arrIng[0], 10),
                    //primeiro elemento(arrIng[0]) é para o numero(qtde) e o restantee o ingrediente em si
                    //entao voltamos os elementos a uma string novamente usando o join()
                    unit: '',
                    ingredient: arrIng.slice(1).join(' ')
                }
            } else if (unitIndex === -1) {
                //Não tem unidade e nem número na primeira posição
                objIng = {
                    count: 1,
                    unit: '',
                    ingredient
                }
            }
            return objIng;


        });
        this.ingredients = newIngredients;
    }
    updateServings(type) {
        //Servings
        const newServings = type === 'dec' ? this.servings - 1 : this.servings + 1;

        //Ingredients
        this.ingredients.forEach(ing => {
            ing.count *= (newServings / this.servings);
        });

        this.servings = newServings;
        console.log(`O tipo passado foi ${type} e o numero de porções é de ${this.servings}`);
    }
}