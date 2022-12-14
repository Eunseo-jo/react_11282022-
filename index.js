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
        #todos; //[{id: ,title: , status: },{}]
        #onChange;

        constructor() {
            this.#todos = [];
        }

        get todos() {
            return this.#todos;
        }

        set todos(newTodo) {
            console.log("this.#onChange?");
            this.#todos = newTodo;
            this.#onChange?.();
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
    const finishedEl = document.querySelector(".finished"); //finished To-do list
    const updateTodoList = (todos) => {

        let template = "";
        let finishedTemplate = "";
        todos.sort((a,b) => b.id - a.id).forEach((todo) => {
            if (todo.status == true) //finished = true
            {
                const todofinTemplate = `<li id= "${todo.id}" class = "checked"> <input class = "todo-input" id= "${todo.id}"> <span id="${todo.id}">${todo.title}</span> <div class="buttons"> <button class="btn--editFin" id="${todo.id}">edit</button><button class="btn--edit" id="${todo.id}">edit</button><button class="btn--delete" id="${todo.id}">remove</button> </div> </li>`;
                finishedTemplate += todofinTemplate;
            }
            else {
                const todoTemplate = `<li id= "${todo.id}" > <input class = "todo-input" id= "${todo.id}"> <span id="${todo.id}">${todo.title}</span><div class="buttons"><button class="btn--editFin" id="${todo.id}">edit</button><button class="btn--edit" id="${todo.id}">edit</button><button class="btn--delete" id="${todo.id}">remove</button></div></li>`;
                template += todoTemplate;
            }
        });
        if(template.length === 0){
            template = "no task to display"
        }
        todoListEl.innerHTML = template;
        finishedEl.innerHTML = finishedTemplate;
        
    };
    
    const editmode = (todos) => {
        todoListEl.addEventListener('click', function(event) {
            const id = event.target.id;
            const todoList = document.getElementById(id);
            todos.forEach((todo) => {
                if (todo.id == id)
                {
                    if(event.target.className === "btn--edit"){
                        todoList.querySelector(".todo-list span").style.display = 'none';
                        todoList.querySelector('.todo-input').style.display = 'block';
                        todoList.querySelector('.btn--editFin').style.display = 'block';
                        todoList.querySelector('.btn--edit').style.display = 'none';
                    }
                }
            });
        })
        finishedEl.addEventListener('click', function(event) {
            const id = event.target.id;
            const List = document.getElementById(id);
            todos.forEach((todo) => {
                if (todo.id == id)
                {
                    if(event.target.className === "btn--edit"){
                        List.querySelector(".finished span").style.display = 'none';
                        List.querySelector('.todo-input').style.display = 'block';
                        List.querySelector('.btn--editFin').style.display = 'block';
                        List.querySelector('.btn--edit').style.display = 'none';
                    }
                }
            });
        })
    };

    return {
        formEl,
        todoListEl,
        finishedEl,
        updateTodoList,
        //statusTodoList,
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
            const title = event.target[0].value;  //input.value
            if(title.trim() === "") {
                alert("please input title!");
                return;
            }
            const newTodo = { title, status: false };
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

    const statusUpdateTodoList = () => {
        View.todoListEl.addEventListener('click', function(event) {
            const id = event.target.getAttribute("id");
            const todoTarget = document.getElementById(id);
            if (event.target.tagName === 'LI') {
                    event.target.classList.toggle('checked');
                    //console.log(event.target.className == 'checked'); //true
                    const title = todoTarget.querySelector('span').innerHTML;
                    console.log("title", event.target.className == 'checked');
                    const newTodo = {
                        id: id,
                        title: title,
                        status: true
                        }
                    Model.editTodo(id,newTodo).then((res) => {
                        state.todos = state.todos.map((todo) => {
                            if (todo.id == id)
                            {
                                todo = res; 
                            }
                            return todo;
                        })
                    })
            }
            

        }, false);
        
        View.finishedEl.addEventListener('click', function(event) {
            const id = event.target.getAttribute("id");
            const todoTarget = document.getElementById(id);
            if (event.target.tagName === 'LI') {
                    event.target.classList.toggle('checked');
                    //console.log(event.target.className == 'checked'); //true
                    const title = todoTarget.querySelector('span').innerHTML;
                    
                        const newTodo = {
                            id: id,
                            title: title,
                            status: false
                        }
                    
                    Model.editTodo(id,newTodo).then((res) => {
                        state.todos = state.todos.map((todo) => {
                            if (todo.id == id)
                            {
                                todo = res; 
                            }
                            return todo;
                        })
                    })

            }

        }, false);

        
    };

    
    const editTodo = () => { // edit to do list
        //finishedEl
        console.log("editTo");
        View.todoListEl.addEventListener("click",(event) => {
            event.preventDefault();
            const id = event.target.getAttribute("id");
            const todoTarget = document.getElementById(id);
            if(event.target.className === "btn--editFin")
            {
                const title = todoTarget.querySelector('.todo-input').value; //new Title
                //create new todo object
                let newTodo = {
                    "id": id,
                    "title": title
                }
                //change css style
                todoTarget.querySelector(".todo-list span").style.display = 'block';
                todoTarget.querySelector('.todo-input').style.display = 'none';
                todoTarget.querySelector('.btn--editFin').style.display = 'none';
                todoTarget.querySelector('.btn--edit').style.display = 'block';
                //The list is not updated...
                Model.editTodo(id,newTodo).then((res) => {
                    state.todos = state.todos.map((todo) => {
                        if (todo.id == id)
                        {
                            todo = res; 
                        }
                        return todo;
                    })
                })
                .catch((err) => {
                    alert(`Edit task failed: ${err}`);
                });
            }    
               
        })

        View.finishedEl.addEventListener("click",(event) => {
            event.preventDefault();
            const id = event.target.getAttribute("id");
            const todoTarget = document.getElementById(id);
            if(event.target.className === "btn--editFin")
            {
                const title = todoTarget.querySelector('.todo-input').value; //new Title
                //create new todo object
                let newTodo = {
                    "id": id,
                    "title": title
                }
                //change css style
                todoTarget.querySelector(".finished span").style.display = 'block';
                todoTarget.querySelector('.todo-input').style.display = 'none';
                todoTarget.querySelector('.btn--editFin').style.display = 'none';
                todoTarget.querySelector('.btn--edit').style.display = 'block';
                //The list is not updated...
                Model.editTodo(id,newTodo).then((res) => {
                    state.todos = state.todos.map((todo) => {
                        if (todo.id == id)
                        {
                            todo = res; 
                        }
                        return todo;
                    })
                })
                .catch((err) => {
                    alert(`Edit task failed: ${err}`);
                });
            }    
               
        })
    };

    const removeTodo = () => {
        //event bubbling: event listener from parent element can receive event emitted from its child
        View.todoListEl.addEventListener("click",(event)=>{
            const id = event.target.id;
            if(event.target.className === "btn--delete"){
                Model.removeTodo(id).then(res=>{
                    state.todos = state.todos.filter(todo => +todo.id !== +id)
                }).catch(err=>alert(`delete todo failed: ${err}`))
            }
        })
        View.finishedEl.addEventListener("click",(event)=>{
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
        statusUpdateTodoList();
        state.subscribe(() => {
            View.updateTodoList(state.todos);
            //View.statusTodoList(state.todos);
            View.editmode(state.todos);
        });
    };

    return {
        bootstrap,
    };
})(View, Model);

ViewModel.bootstrap();
