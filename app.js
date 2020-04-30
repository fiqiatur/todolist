const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const _ = require('lodash')

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect('mongodb+srv://akavendetta:akavendetta221096@cluster0-3p2qd.mongodb.net/test?retryWrites=true&w=todolistDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});




const itemsSchema = {
  name: String
};

const Item = mongoose.model('Item', itemsSchema);



const item1 = new Item({
  name: 'selamat datang di catatan harian'
});

const item2 = new Item({
  name: 'selamat datang di catatan mingguan'
});

const item3 = new Item({
  name: 'selamat datang di catatan bulanan'
});



const defaultItems = [item1, item2, item3]

//root Shema
const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model('List', listSchema);



app.get('/', function (req, res) {

  Item.find({}, (err, foundItems) => {

    if (foundItems.length === 0) {

      Item.insertMany(defaultItems, (err => {
        if (err) {
          console.log(err);
        } else {
          console.log('berhasil bos');
        }
      }));
      res.redirect('/')
    } else {
      res.render("list", {
        listTitle: 'Today',
        newListItems: foundItems
      })
    }
  });
});

app.get('/:customListName', (req, res) => {
  const customListName = _.capitalize(req.params.customListName)

  List.findOne({
    name: customListName
  }, (err, foundList) => {
    if (!err) {
      if (!foundList) {
        const list = new List({
          name: customListName,
          items: defaultItems
        })
        list.save();
        res.redirect('/' + customListName)
      } else {
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items
        })

      }
    }
  })
});


// app.post("/", function (req, res) {

//   const itemName = req.body.newItem;
//   const listName = req.body.list;

//   const item = new Item({
//     name: itemName
//   });

//   if (listName === 'Today') {
//     item.save();
//     res.redirect('/');
//   } else {
//     List.findOne({
//       name: listName
//     }, (err, foundList) => {
//       foundList.items.push(item);
//       foundList.save();
//       res.redirect('/' + listName);
//     });
//   };
// });

app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({
      name: listName
    }, function (err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});









//delete
app.post("/delete", function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, function (err) {
      if (!err) {
        console.log("Successfully deleted checked item.");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({
      name: listName
    }, {
      $pull: {
        items: {
          _id: checkedItemId
        }
      }
    }, function (err, foundList) {
      if (!err) {
        res.redirect("/" + listName);
      }
    });
  }


});







app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});