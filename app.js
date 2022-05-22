require('dotenv').config();
const { Console } = require('console');
const express = require('express');
const { redirect } = require('express/lib/response');
const app = express();
const _ = require('lodash');
const https = require("https");
const { post } = require('jquery');
app.use(express.urlencoded({extended: true}));
const port = process.env.PORT || 3000;
app.set('view engine', 'ejs');
const mongoose = require('mongoose');


main().catch(err => console.log(err));

app.use(express.static("public"));

async function main() {
    const db = await mongoose.connect('mongodb+srv://admin-mauricio:'+process.env.MONGO_KEY+'@cluster0.bdhma.mongodb.net/todoListDB');
    //const db = await mongoose.connect('mongodb://localhost:27017/todoListDB')
}



const itemsSchema = new mongoose.Schema({
    taskName: {
        type: String,
        required: true},
    taskCompleted: {
        type: Boolean,
        default: false},
    taskDescription: {
        type: String},
    createDate: {
        type: Date,
        required: true},
    dueDate: {
        type: Date},
    taskPosition: {
        type: Number,
        //unique: true,
        required: true},
    taskDescriptionShow: {
        type: Boolean,
        default: false},
    taskDueDateShow: {
        type: Boolean,
        default: false},
})

const Item = mongoose.model("Item", itemsSchema);

const tutorial1 = new Item ({
    taskName: "Welcome to your todolist!",
    createDate: new Date(),
    taskPosition: 0
});

const tutorial2 = new Item ({
    taskName: "Hit the + button to add a new item",
    createDate: new Date(),
    taskPosition: 1
});

const tutorial3 = new Item ({
    taskName: "<--- Hit the checkbox to mar the activity as done",
    createDate: new Date(),
    taskPosition: 2
});

const tutorial4 = new Item ({
    taskName: "Hit the bin icon to delete an activity --->",
    taskCompleted: true,
    createDate: new Date(),
    taskPosition: 3
});

const defaultItems = [tutorial1,tutorial2,tutorial3,tutorial4];

const listSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true},
    items: [itemsSchema]
})

const List = mongoose.model("List", listSchema);

app.get('/', (req,res) => {

    const customListTitle = "Today";
    renderList(customListTitle, res);
})

app.get("/about", (req,res) => {
    res.render('about');
})

app.get("/favicon.ico", (req,res) => {
})

function renderList (listTitle, res) {
    List.findOne({name: listTitle},(err,foundList) => {
        if (err) {
            console.log(err);
        } 
        else {
            if(!foundList) {
                const newList = new List ({name: listTitle, items:defaultItems});
                newList.save((err) => {
                    if (!err) {
                        if (listTitle === "Today") {
                            setTimeout(() => {res.redirect('/')},80)
                        } else {
                            setTimeout(() => {res.redirect('/' + listTitle)},80)
                        }
                    }
                });
            } else {
            res.render('index', {listTitle: foundList.name , items: foundList.items});
            }
        }
    })
}

app.get('/:listTitle', (req,res) => {

    const customListTitle = _.capitalize(_.kebabCase(req.params.listTitle));
    console.log('List requested: ' + customListTitle);

    renderList(customListTitle, res);
    
    
})

app.get('/:listTitle/:itemId', (req,res) => {

    const customListTitle = _.capitalize(_.kebabCase(req.params.listTitle));
    const itemId = req.params.itemId;
    console.log('List requested: ' + customListTitle);
    console.log('Item required: ' + itemId);

    List.findOne({name:customListTitle}, (err, listFound) => {
        if(!err) {
            const currentItem = listFound.items.id(itemId);
            //console.log(currentItem);
            res.render('item', {list: listFound, item: currentItem})
        }
    })

})



app.post('/', (req,res) => {
    
    if(req.body.newToDo) {
        const newItem = req.body.newToDo;
        const listName = _.capitalize(_.kebabCase(req.body.submit));
        console.log("Insert a new item: " + newItem);
        
        
        List.findOne({name:listName}, (err, listFound) => {
            const lastTaskPosition = listFound.items[listFound.items.length-1].taskPosition;
            if(!err) {
                const item = new Item ({
                    taskName: newItem,
                    createDate: new Date(),
                    taskPosition: lastTaskPosition + 1
                });
                listFound.items.push(item);
                listFound.save((err) => {
                    if (!err) {
                        if (listName === "Today") {
                            setTimeout(() => {res.redirect('/')},80)
                        } else {
                            setTimeout(() => {res.redirect('/' + listName)},80)
                        }
                    } else {console.log(err)}
                });
            }
        })
        
    } else {
        console.log('Input Empty');
    }
    
})

app.post('/itemUpdate', (req,res) => {
    List.findById(req.body.listId, (err, listFound) => {
        if(!err) {
            if(listFound) {
                const itemFound = listFound.items.id(req.body.itemId);
                const dueDateDay = itemFound.dueDate.getDate();
                
                itemFound.taskName = req.body.taskTitle;
                itemFound.taskDescription = req.body.taskDescription;
                itemFound.dueDate = req.body.dueDate;
                if(req.body.taskCompleted === 'on') {
                    itemFound.taskCompleted = true
                } else {
                    itemFound.taskCompleted = false
                };
                if(req.body.showDescription === 'on') {
                    itemFound.taskDescriptionShow = true
                } else {
                    itemFound.taskDescriptionShow = false
                };
                if(req.body.showDueDate === 'on') {
                    itemFound.taskDueDateShow = true
                } else {
                    itemFound.taskDueDateShow = false
                };
                listFound.save((err) => {
                    if(err) {
                        console.log(err);
                    }
                    console.log(itemFound);
                    res.redirect('/' + listFound.name);
                })
            } else {console.log('listId: ' + req.body.listId + ' not found!')}
        } else {console.log(err)}
    })
})

app.post('/update', (req,res) => {
    
    if(req.body.delete) {
        
        const deleteId = req.body.delete;
        const listName = _.capitalize(_.kebabCase(req.body.listTitle));
    
        console.log('Deleting item(id): ' + deleteId);
        console.log('From list: ' + listName);
    
        List.findOne({name: listName}, (err, listFound) => {
            if(!err) {
                listFound.items.id(deleteId).remove();
                
                listFound.save((err) => {
                    if (!err) {
                        if (listName === "Today") {
                            setTimeout(() => {res.redirect('/')},80)
                        } else {
                            setTimeout(() => {res.redirect('/' + listName)},80)
                        }
                    }
                });
            } else {
                console.log('Item id(' + deleteId + ') on list ' + listName + ' not found!');
                res.redirect('/' + listName)
            }
        });
        
    } 
    else {
        const updateId = req.body.id;
        const listName = _.capitalize(_.kebabCase(req.body.listTitle));

        console.log('Updating item(id): ' + updateId);
        console.log('From list: ' + listName);

        
        List.findOne({name: listName}, (err, listFound) => {
            if(!err) {
                if (listFound) {
                    listFound.items.id(updateId).taskCompleted = !listFound.items.id(updateId).taskCompleted;
                    
                    listFound.save((err) => {
                        if (!err) {
                            if (listName === "Today") {
                                setTimeout(() => {res.redirect('/')},80)
                            } else {
                                setTimeout(() => {res.redirect('/' + listName)},80)
                            }
                        }
                    });
                } else {
                    console.log('Item id(' + deleteId + ') on list ' + listName + ' not found!');
                    setTimeout(() => {res.redirect('/' + listName)},80);
                }
            }
        })
        
  
    }


    

    
})

app.listen (port, () => {
    console.log("Server is running on port 3000.")
})
