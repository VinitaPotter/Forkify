import axios from "axios";

export default class Recipe {
    constructor(id) {
        this.id = id;
    }

    async getRecipe() {
        const key = "46c8149aa32f4a4ee692f618d22d5ebb"
        try {
            const rec = await axios(`http://food2fork.com/api/get?key=${key}&rId=${this.id}`);
            this.title = rec.data.recipe.title;
            this.author = rec.data.recipe.publisher;
            this.img = rec.data.recipe.image_url;
            this.url = rec.data.recipe.source_url;
            this.ingredients = rec.data.recipe.ingredients;
            
        } catch(error) {
            console.log(error);
            alert("Oops! Something went wrong! :(");
        }
    }

    calcTime() {
        // Calculating prepration time assuming we need 15 minutes for each 3 ingredients
        const numIng = this.ingredients.length;
        const periods = Math.ceil(numIng /3);
        this.time = periods * 15;
    }

    calcServings() {
        this.servings = 4;
    }

    parseIngredients() {
        const unitsLong = ['tablespoons', 'tablespoon', 'ounces', 'ounce', 'teaspoons', 'teaspoon', 'cups', 'pounds'];
        const unitShort = ['tbsp', 'tbsp', 'oz', 'oz', 'tsp', 'tsp', 'cup', 'pound'];
        const unit = [...unitShort, 'kg', 'g'];

            const newIngredients = this.ingredients.map(el => {
                // uniform units
                let ingredient = el.toLowerCase();
                unitsLong.forEach((unit, i) => {
                    ingredient = ingredient.replace(unit, unitShort[i]);
                });

            //remove parenthesis

            ingredient = ingredient.replace(/ *\([^)]*\) */g, ' ');


            //parse ingredients into count, unit and ingredients

            const arrIng = ingredient.split(' ');
            const unitIndex = arrIng.findIndex(el2 => unit.includes(el2));

            let objIng;
            if (unitIndex > -1) {
                //There is a unit
                const arrCount = arrIng.slice(0, unitIndex);
                let count;
                if (arrCount.length === 1) {
                    count = eval(arrIng[0].replace('-', '+'));
                } else {
                    count = eval(arrIng.slice(0, unitIndex).join('+'));
                }

                objIng = {
                    count,
                    unit: arrIng[unitIndex],
                    ingredient: arrIng.slice(unitIndex + 1). join(' ')
                }


            } else if (parseInt(arrIng[0], 10)) {
                //There is no unit but there is a number
                objIng = {
                    count: parseInt(arrIng[0], 10),
                    unit: '',
                    ingredient: arrIng.slice(1).join(' ')
                }

            } else if (unitIndex === -1) {
                //There is no unit and no number 
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
    
    updateServings (type) {
        const newServing = type === 'dec'? this.servings -1: this.servings + 1;

        this.ingredients.forEach(ing => {
            ing.count *= (newServing/ this.servings);
        });


        this.servings = newServing;
    }

}






















