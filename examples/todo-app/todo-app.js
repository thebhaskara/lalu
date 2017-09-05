// Making the app instance
var app = lalu.view.makeViewInstance({
    html: document.getElementById('pageHtml').innerHTML
});

// bootstraping app's DOM elements onto the page
lalu.view.strap(app, document.getElementById('page'));

// Making view factory for creating todo item
var TodoItem = lalu.view.makeView({
    html: document.getElementById('todoItemHtml').innerHTML,
    	// function to focus the text box
    focus: function() {
        this.get('textElement').focus();
    },
    initWatches: {
    	// watching keydown event
        'keydown': function(event) {

            var key = event.keyCode || event.charCode;

            // if key is return then create new item after this item
            if (key == 13) {
                event.preventDefault();
                addItem(this);
                return false;
                // if key is delete or backspace after text box is empty 
                // then delete this item.
            } else if ((key == 8 || key == 46) &&
                (!event.target.value || event.target.value == "")) {
                event.preventDefault();
                removeItem(this);
                return false;
            }
        }
    }
});

// function to add a todo item
var addItem = function(after) {
    var todo = new TodoItem();
    app.getSet('todos', function(todos) {
        todos = todos || [];
        if (after) {
            var index = _.findIndex(todos, after);
            todos.splice(index + 1, 0, todo);
        } else {
            todos.push(todo);
        }
        return todos;
    });
    todo.focus();
}

// function to remove a todo item from list
var removeItem = function(item) {
    var todos = app.get('todos');
    var index = _.findIndex(todos, item);
    var todo = todos[index];
    todos.splice(index, 1);
    app.set('todos', todos);
    todo.destroy();

    if (todos.length > 0) {
        if (index == 0) {
            todos[index].focus();
        } else {
            todos[index - 1].focus();
        }
    }
}

// adding event listener for click event on add button
app.watch('event.add', function() {
    addItem();
});

// putting the first todo item on page load.
addItem();
