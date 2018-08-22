import Search from './models/Search';
import Recipe from './models/recipe';
import List from './models/List';
import Likes from './models/Likes';
import * as searchView from './view/searchView';
import * as recipeView from './view/recipeView';
import * as listView from './view/listView';
import * as likesView from './view/likesView';
import {elements, renderLoader, clearLoader} from './view/base';


//Global state of the app
const state = {};
//SEARCH CONTROLLER

const controlSearch = async () => {
    //1 get query from view
    const query = searchView.getInput();
   

    if (query) {
        // 2. new search object and add it to state
        state.search = new Search(query);

        // 3. Prepare UI for results
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);

        try {
            //4. Search for recipes
            await state.search.getResults();

            //5 render result on UI
            clearLoader();
            searchView.renderResults(state.search.result);
            
        } catch (error) {
            alert ("Can not find what you're looking for");
            clearLoader();
        }   
    }
}

elements.searchFrom.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
});


elements.searchResPages.addEventListener(`click`, e => {
    const btn = e.target.closest('.btn-inline');
    if (btn) {
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);
    }
});


//RECIPE CONTROLLER

const controlRecipe = async () => {
    //Get id from URL
    const id = window.location.hash.replace('#', '');

    
    if (id) {
    // Prepare the UI for changes
    recipeView.clearRecipe();
    renderLoader(elements.recipe);

    if (state.search) searchView.highlightSelected(id);

    // Create New recipe object
    state.recipe = new Recipe(id);

    // Get the recipe data and parse the ingredients
        try {
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();

            // caltime and calserving
            state.recipe.calcTime();
            state.recipe.calcServings();

            //render the recipe to UI
            clearLoader();
            recipeView.renderRecipe(
                state.recipe,
                state.likes.isLiked(id)
            );
            
            

        } catch(error) {
            console.log(error);
            //alert("Something went wrong :(");
        }  
    }  
};
// window.addEventListener('hashchange', controlRecipe);
// window.addEventListener('load', controlRecipe);

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));


//LIST CONTROLLER 
const controlList = () => {
    //Create a list if there is not yet
    if (!state.list) state.list = new List(); 

    //Add each ing to the list 
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItems(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    });
}

// Handle delete and update list
elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;

    //handle delete evnt

    if (e.target.matches('.shopping__delete, .shopping__delete *')) {
        //delete from state
        state.list.deleteItem(id);

        //delete from ui
        listView.deleteItem(id);

        //Handle the count update
    } else if (e.target.matches(".shopping__count-value")) {
        const val = parseFloat(e.target.value, 10);
        state.list.updateCount(id, val);
        
    }
});

//LIKE CONTROLLER
const controlLike = () => {
    if (!state.likes) state.likes = new Likes();
    const currentID = state.recipe.id;
    //User has not yet liked the current recipe
    if (!state.likes.isLiked(currentID)) {
        //add like to the recipe
        const newLike = state.likes.addLike(
            currentID,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        );

        //toggle the like button
        likesView.toggleLikeBtn(true);
        //add recipe to the like list
        likesView.renderLikes(newLike);

    // User has liked the current recipe
    } else {
        //remove like from state
        state.likes.deleteLike(currentID);
        //toggle the like button
        likesView.toggleLikeBtn(false);
        //remove recipe from the like list
        likesView.deleteLike(currentID);
    }

    likesView.toggleLikeMenu(state.likes.getNumLikes());
}

//restore like recipes on page load
window.addEventListener('load', () => { 
    state.likes = new Likes();
    state.likes.readStorage();
    likesView.toggleLikeMenu(state.likes.getNumLikes());
    state.likes.likes.forEach(like => likesView.renderLikes(like));
});

//RECIPE CONTROLLER

elements.recipe.addEventListener('click', e => {
    if (e.target.matches('.btn-decrease, .btn-decrease *')) {
        if (state.recipe.servings > 1) {
            state.recipe.updateServings('dec');
        } 
        recipeView.updateServingsIngredients(state.recipe);
    } else if (e.target.matches('.btn-increase, .btn-increase *')) {
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);
    } else if (e.target.matches(`.recipe__btn-add, .recipe__btn-add *`)) {
        //add ingredients to shopping list
        controlList();
    } else if (e.target.matches('.recipe__love, .recipe__love *')) {
        //Like controller
        controlLike();
    }
});

