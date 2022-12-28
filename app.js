//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose=require("mongoose");
const _=require("lodash");
mongoose.set("strictQuery", false);
const mongodb="mongodb+srv://lakshay:Lak162003@cluster0.9dmp94p.mongodb.net/todolistDB";



mongoose.connect(mongodb,(err)=>{
    if(err){
        console.log("Unsuccess !!"+err);
    }
    else{
        console.log("MongoDb is connected !!")
    }
})


const modelSchema=new mongoose.Schema({
    name:{
      type:String,
      unique:false
    }
},{versionKey:false})




const Item=mongoose.model("Item",modelSchema);
const List=mongoose.model("List",new mongoose.Schema
({name:String,items:[modelSchema]}));
// Super imp : list schema jisme : ek hoga naam and ek hoga 
// items ki arrays jiska : schema == modelSchema !!
// eg of 1:many embedded relationships !!

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

let item1={
  name:"Welcome to TO-DO-LIST !!"
}

let item2={
  name:"Click at + Sign to Add !!"
};

let item3={
  name:"<--Check this to delete !!"
};

const defaultItems=[item1,item2,item3];

// Note : these documents will not be inserted into the collection Items
// ye sirf document creation ke liye tha !!!

  // Item.insertMany([item1,item2,item3],function(err){
  //   if(err){
  //     console.log(err);
  //   }
  //   else{
  //     console.log("Successs in addition !!");
  //   }
  // });

// WE CAN USE : ROUTE PARAMETERS !! 
// TO CREATE : DYNAMIC URLS !!
app.get("/:name",function(req,res){
  const day = date.getDate();
  let collectionName=_.capitalize(req.params.name);

  // List collection will contain everything !!
  List.find({name:collectionName},function(err,db){
    if(err){
      console.log("Failure !!");
    }
    else{
        if(db.length==0){
          let obj={
            name:collectionName,
            items:defaultItems
          }
          List.insertMany([obj],function(err){
            if(err){
                console.log("Unsucces in creating new List !!");
            }
            else{
                console.log("New List Created !!");
                res.render("list",{listTitle:collectionName,newListItems:obj.items});
            }
          })
        }
        else{
          // this fnc creates : an array that is why db[0]
          // se access karna padega !
          res.render("list",{listTitle:collectionName,newListItems:db[0].items});
        }
    }
  })


})
const day = date.getDate();
app.get("/", function(req, res) {


  Item.find({},function(err,tasks){
    if(err){
      console.log("Could Not Load !!");
    }
    else{
        // console.log("Fetch Success !!");

         res.render("list", {listTitle: "Today", newListItems:tasks});
    }
  })
});


app.post("/delete/:name",function(req,res){
  // perform deletion
  if(req.params.name==="Today"){
    let obj=req.body;
    console.log(obj);
    Item.find({},function(err,tasks){
      if(err){
        console.log("Could Not Load !!");
        return;
      }
      else{
          tasks.forEach((tasks)=>{
            if(tasks._id==obj.check){
                Item.deleteOne({_id:obj.check},function(err){
                  if(err){
                    console.log("unsuccess !!");
                  }
                  else{
                    res.redirect("/");
                  }
                });
                
            }
          })
      }
    })
  }
  else{
    List.find({name:req.params.name},function(err,db){
        if(err){
          console.log("Error !!");
        }
        else{
        
          const idToRemove = req.body.check;
          const filteredItems = db[0].items.filter
          ((item) => item._id != idToRemove);
          db[0].items=filteredItems;
          db[0].save();
          res.redirect("/"+req.params.name);
        }
    })
  }

  // res.redirect("/");
})



app.post("/", function(req, res){
  // firstly add
  let newItem={
    name:req.body.newItem
  }
  if(req.body.list==="Today"){
    Item.insertMany([newItem],function(err){
      if(err){
        console.log("Unsuccess in Addition !!");
      }
      else{
        console.log("Item Added !!");
        res.redirect("/");
      }
    })
  }
  else{
    List.find({name:req.body.list},function(err,db){
      if(err){
        console.log("Failure !!");
      }
      else{
            // this fnc creates : an array that is why db[0]
            // se access karna padega !!
            db[0].items.push(newItem);
            db[0].save();
            // JABHI KISI COLLECTION ME PADI EMBEDDED ARRAY
            // ME CHANGES KAROGE : USE : SAVE() METHOD TO SAVE THOSE CHANGES !!
            res.redirect("/"+req.body.list);
      }
    })
    
  }

});


// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

// app.get("/about", function(req, res){
//   res.render("about");
// });

app.listen( process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
