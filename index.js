/* 
    get(id optionally): read
    post: write
    put(id): update, replace
    patch(id): update, partial replace
    delete(id): remove a row
*/

const APIs = (() => {

    const URL = "http://localhost:3000/todos";

    const addTodo = (newTodo) => { //create task
        return fetch(URL, {
            method: "POST",
            body: JSON.stringify(newTodo),
            headers: { "Content-Type": "application/json" },
        }).then((res) => res.json());
    };

    const editTodo = (id, newTodo) => { //update task
        
        return fetch(URL + `/${id}`, {
            method: "PATCH",
            body: JSON.stringify(newTodo),
            headers: { "Content-Type": "application/json" },

        }).then((res) => res.json());
        
    };

    const removeTodo = (id) => { //delete task
        return fetch(URL + `/${id}`, {
            method: "DELETE",
        }).then((res) => res.json());
    };

    const getTodos = () => { //get task list
        return fetch(URL).then((res) => res.json());
    };
    return {
        addTodo,
        editTodo,
        removeTodo,
        getTodos,
    };
})();

const Model = (() => {
    //todolist
    class State {
        #todos; //[{id: ,title: },{}]
        #onChange;
        #setStatus;

        constructor() {
            this.#todos = [];
            this.#setStatus = "pending";
        }

        get todos() {
            return this.#todos;
        }

        set todos(newTodo) {
            console.log("setter");
            this.#todos = newTodo;
            this.#onChange?.();
        }

        get todostatus() //return status
        {
            return this.#setStatus;
        }

        set todostatus(newStatus) {
            console.log("set status");
            this.#setStatus = newStatus;
            this.#setStatus?.();
        }
        subscribe(callback) {
            this.#onChange = callback;
            this.setStatus = callback;
        }
    }
    let { getTodos, removeTodo, addTodo, editTodo } = APIs;

    return {
        State,
        getTodos,
        removeTodo,
        addTodo,
        editTodo,
    };
})();

//BEM, block element modifier methodology
const View = (() => {
    const formEl = document.querySelector(".form"); //querying
    const todoListEl = document.querySelector(".todo-list");

    const updateTodoList = (todos) => {

        let template = "";
        todos.forEach((todo) => {
            const todoTemplate = `<li> <input class = "todo-input" id= ${todo.id}> <span>${todo.title}</span><button class="btn--editFin" id="${todo.id}">edit</button><button class="btn--edit" id="${todo.id}">edit</button><button class="btn--delete" id="${todo.id}">remove</button></li>`;
            template += todoTemplate;
        });
        if(todos.length === 0){
            template = "no task to display"
        }
        todoListEl.innerHTML = template;
        
    };

    const statusTodoList = (todos) => {
        todoListEl.addEventListener('click', function(event) {
            if (event.target.tagName === 'LI') {
                event.target.classList.toggle('checked');
            }
          }, false);
    };

    const editmode = (todos) => {
        todoListEl.addEventListener('click', function(event) {
            const id = event.target.id;
            
            if(event.target.className === "btn--edit"){

                document.querySelector(".todo-list span").style.display = 'none';
                document.querySelector('.todo-input').style.display = 'block';
                document.querySelector('.btn--editFin').style.display = 'block';
                document.querySelector('.btn--edit').style.display = 'none';
            }
        })
    };

    return {
        formEl,
        todoListEl,
        updateTodoList,
        statusTodoList,
        editmode,
    };
})();

//window.console.log

/* 
    prevent the refresh
    get the value from input
    save the new task to the database(could fail)
    save new task object to state, update the page
*/

const ViewModel = ((View, Model) => {
    console.log("model", Model);
    const state = new Model.State();

    const getTodos = () => {
        Model.getTodos().then((res) => {
            state.todos = res;
        });
    };

    const addTodo = () => {
        View.formEl.addEventListener("submit", (event) => {
            event.preventDefault();
            console.log(event.target); //form
            const title = event.target[0].value;  //input.value
            if(title.trim() === "") {
                alert("please input title!");
                return;
            }
            console.log("title", title);
            const newTodo = { title };
            Model.addTodo(newTodo)
                .then((res) => {
                    console.log(res);
                    state.todos = [res, ...state.todos];
                    console.log(state.todos);
                    event.target[0].value = ""
                })
                .catch((err) => {
                    alert(`add new task failed: ${err}`);
                });
        });
    };

    
    const editTodo = () => { // edit to do list
       
        View.todoListEl.addEventListener("click",(event) => {
            event.preventDefault();
            const id = event.target.id;
            console.log(id);
            console.log("current target ",event.currentTarget.id = id)
            if (event.currentTarget.id = id){
                if(event.target.className === "btn--editFin")
                {
                        console.log("ednit fin");
                        const title = document.querySelector('.todo-input').value;
                        console.log("todoInput", title);
                        const newTodo = { title };
                        console.log("newTodo", newTodo);

                        document.querySelector(".todo-list span").style.display = 'block';
                        document.querySelector('.todo-input').style.display = 'none';
                        document.querySelector('.btn--editFin').style.display = 'none';
                        document.querySelector('.btn--edit').style.display = 'block';

                        Model.editTodo(id,newTodo)
                        .then((res) => {
                            console.log("res", res);
                            state.todos = [res, ...state.todos];
                        })
                        .catch((err) => {
                            alert(`Edit task failed: ${err}`);
                        });
                }    
            }      
        })
    };

    const statusTodo = () => {
        View.todoListEl.addEventListener("click",(event)=>{
            const id = event.target.id;
            if (event.target.tagName === 'LI') {
                event.target.classList.toggle('checked');
            }
            
        },false)
    };

    const removeTodo = () => {
        //event bubbling: event listener from parent element can receive event emitted from its child
        View.todoListEl.addEventListener("click",(event)=>{
            //console.log(event.target/* emit the event */, event.currentTarget/* receive the event */);
            const id = event.target.id;
            if(event.target.className === "btn--delete"){
                Model.removeTodo(id).then(res=>{
                    state.todos = state.todos.filter(todo => +todo.id !== +id)
                }).catch(err=>alert(`delete todo failed: ${err}`))
            }
        })
    };

    const bootstrap = () => {
        addTodo();
        getTodos();
        removeTodo();
        editTodo();
        statusTodo();
        state.subscribe(() => {
            View.updateTodoList(state.todos);
            View.statusTodoList(state.todos);
            View.editmode(state.todos);
        });
    };

    return {
        bootstrap,
    };
})(View, Model);

ViewModel.bootstrap();
