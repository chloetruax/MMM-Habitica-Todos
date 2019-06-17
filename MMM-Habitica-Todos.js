/* global Module */
/* Magic Mirror
 * Module: MM Habitica Todos
 *
 * By Mike Truax
 * MIT Licensed.
 */

Module.register("MMM-Habitica-Todos", {

    // Default module config.
    defaults: {
        apiKey: null,
        userID: null,
        sortKey: 'date', // value, date
        order: 'ASC', // DESC
        showNotes: false,
        showDueDate: true
    },
    todos: null,

    // Define start sequence.
    start: function () {
        Log.info("Starting module:" + this.name);
        if (!this.config.apiKey || !this.config.userID) {
            this.todos = [{text: "API Key and UserID are required"}]
            return this.updateDom();
        }
        if (!this.config.sortKey) {
            this.config.sortKey = this.defaults.sortKey
        }
        if (!this.config.order) {
            this.config.order = this.defaults.order
        }
        if (typeof this.config.showNotes !== "boolean") {
            this.config.showNotes = this.defaults.showNotes
        }
        if(typeof this.config.showDueDate !== "boolean"){
            this.config.showDueDate = this.defaults.showDueDate;
        }
        this.getTodos()
    },
    getStyles: function () {
        return ["MMM-Habitica-Todos.css"];
    },

    getTodos: function () {
        let self = this;
        let headers = new Headers({
            "Content-Type": "application/json",
            "x-api-user": this.config.userID,
            "x-api-key": this.config.apiKey
        })
        fetch("https://habitica.com/api/v3/tasks/user?type=todos", { headers: headers })
            .then(res => res.json())
            .then(json => json.data)
            .then(data => {
                data.sort((a, b) => {
                    if (a[this.config.sortKey] < b[this.config.sortKey]) {
                        return -1
                    }
                    else if (a[this.config.sortKey] > b[this.config.sortKey]) {
                        return 1
                    }
                    return 0;
                })
                self.todos = self.config.sort == 'ASC' ? data : data.reverse();
                self.updateDom();
            })
    },
    // Override dom generator.
    getDom: function () {
        let wrapper = document.createElement("div");
        wrapper.classList.add("habitica-wrapper");
        let title = document.createElement("div");
        title.classList.add("habitica-title");
        title.innerText = "Habitica Todos";
        wrapper.appendChild(title);
        if(!this.todos){
            return wrapper;
        }
        let self = this;
        this.todos.forEach(todo=>{
            let todoCont = self.buildTodoEl("habitica-todo-container")
            todoCont.classList.add(this.getTodoClass(todo.value));
            let title = self.buildTodoEl("habitica-todo-title", todo.text);
            todoCont.appendChild(title);
            if(self.config.showDueDate){
                let formattedDate = self.formatTodoDate(todo.date)
                let date = self.buildTodoEl("habitica-todo-date", formattedDate)
                todoCont.appendChild(date);   
            }
            if(todo.notes && self.config.showNotes){
                let note = self.buildTodoEl("habitica-todo-note", todo.notes)
                todoCont.appendChild(note);
            }
            wrapper.appendChild(todoCont);
        })
        return wrapper;
    },
    buildTodoEl(elClass, text = ""){
        let el = document.createElement("div");
        el.innerText = text;
        el.classList.add(elClass);
        return el;
    },
    getTodoClass(val){
        if(val >= 12) return "bright-blue";
        if(val >= 6) return "light-blue";
        if(val > 0) return "green";
        if(val == 0) return 'yellow';
        if(val > -9) return 'orange'
        if(val >= -16) return 'red';
        return 'dark-red'
    },
    formatTodoDate(date){
        let todoDate = new Date(date);
        let month = format(todoDate . getMonth() + 1);
        let day = format(todoDate . getDate());
        let year = format(todoDate . getFullYear());
        return month + "/" + day + "/" + year;
    }
});