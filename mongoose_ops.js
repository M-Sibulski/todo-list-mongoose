const mongoose = require('mongoose');

main().catch(err => console.log(err));

async function main() {
    const db = await mongoose.connect('mongodb://localhost:27017/todoListDB');


    const itemsSchema = new mongoose.Schema({
        name: {
            type: String,
            required: true},
        done: {
            type: Boolean,
            required: true}
    })

    const Item = mongoose.model("Item", itemsSchema);

    const listSchema = new mongoose.Schema({
      name: {
          type: String,
          required: true},
      items: [itemsSchema]
    })

    const List = mongoose.model("List", listSchema);

    /* Item.updateOne({name: "Do something"}, {done: true}, (err) => {
        if (err) {
          console.log(err);
        } else {console.log("Succesfully updated the document from fruitsDB")}
      }); */

    List.deleteMany({'name': 'favicon.ico'}, function(err) {
      if (err) {
        console.log(err);
      } else {
        if (err === null) {
          console.log(err)
          console.log("None objects matched the description");
        } else {
          console.log(err)
          console.log("Succesfully removed " + err + " docs from fruitsDB");
        }
      }
    });

    const timeoutID = setTimeout(() => {db.connection.close()},200);

}