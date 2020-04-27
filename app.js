const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose')

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect('mongodb://localhost:27017/todolistDB', {
  useNewUrlParser: true
});

const itemsSchema = {
  name: String
};

const Item = mongoose.model('Item', itemsSchema); //nama model

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




app.get("/", function (req, res)  {

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

//create
app.post("/", function (req, res) {

  const itemName = req.body.newItem;

  const item = new Item({
    name: itemName
  });

  item.save()
  res.redirect('/')
});

//delete
app.post('/delete', function (req, res)  {
  const checkItemId = req.body.checkbox;

  Item.findOneAndDelete(checkItemId, (err => {   //find by id is not working again
    if (!err) {
      console.log('berhasil dihapus');
      res.redirect('/');
    }
  }))

})


app.get("/work", function (req, res) {
  res.render("list", {
    listTitle: "Work List",
    newListItems: workItems
  });
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});