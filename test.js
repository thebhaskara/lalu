var body = document.body;

var pageElement = document.getElementById('page');

var TodoApp = new lalu.view({
    elements: [pageElement],

});

TodoApp.addItem = function(that) {
    var todo = new TodoItem();
    todo.set('text', 'asd');
    var todos = this.get('todos');
    var res = [];
    if (that) {
        _.each(todos, function(item) {
            res.push(item);
            if (item == that) {
                res.push(todo);
            }
        })
    } else {
        res = todos
        res.push(todo);
    }
    this.set('todos', res);
    return todo;
};

TodoApp.removeItem = function(that) {
    var todos = this.get('todos');
    var res = [];
    var todo, i;
    _.each(todos, function(item, index) {
        if (item == that) {
            i = index;
        } else {
            res.push(item);
        }
    });
    if (i > 0) i--;
    this.set('todos', res);
    that.destroy();
    res[i].focus();
}

var TodoItem = lalu.extend({
    html: document.getElementById('todoItemHtml').innerHTML,
    init: function() {},
    initWatches: {
        'keydown': function(event) {

            var key = event.keyCode || event.charCode;

            if (key == 13) {
                event.preventDefault();
                TodoApp.addItem(this).focus();
                return false;
            } else if ((key == 8 || key == 46) &&
                (!event.target.value || event.target.value == "")) {
                event.preventDefault();
                TodoApp.removeItem(this);
                return false;
            }
        }
    },
    focus: function() {
        var textElement = this.get('textElement');
        textElement.focus();
    }
}, lalu.view);

TodoApp.set('todos', []);

TodoApp.addItem().focus();

TodoApp.watch('addManyEvent', function(addManyEvent) {
    for (var i = 0; i < 100; i++) {
        TodoApp.addItem();
    }
})

TodoApp.watch('removeManyEvent', function(removeManyEvent) {
    var todos = TodoApp.get('todos');
    TodoApp.set('todos', []);
    _.each(todos, function(todo) {
        todo.destroy();
    });
});

TodoApp.watchAll('addManyEvent', 'removeManyEvent', function(addManyEvent, removeManyEvent){
    console.log(addManyEvent, removeManyEvent);
});
