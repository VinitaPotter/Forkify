import axios from "axios";

export default class Search {
    constructor(query) {
        this.query = query;
    }

    async getResults() {
        const key = "46c8149aa32f4a4ee692f618d22d5ebb";
        try {
            const res = await axios(`http://food2fork.com/api/search?key=${key}&q=${this.query}`);
            this.result = res.data.recipes;
            // console.log(this.result);
        } catch(error) {
            alert("Error!");
        }
    }
}