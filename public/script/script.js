function createissuetable(id){

  //Initialis esite
  var contentdiv = document.getElementById(id);
  var issuelinks = [{"name":"PA application","link":"pa_application"},{"name":"CSO application","link":"ngo_application"},{"name":"Migrant application","link":"migrant_application"}];

  var selectdiv = contentdiv.appendChild(document.createElement("div"));
  selectdiv.id="selectdiv";
  selectdiv.classList.add("selectdiv");

  var tablediv = contentdiv.appendChild(document.createElement("div"));
  tablediv.id="tablediv";
  tablediv.classList.add("tablediv");


  var tooltipdiv = contentdiv.appendChild(document.createElement("div"));
  tooltipdiv.id="tooltipdiv";
  tooltipdiv.classList.add("tooltipdiv");
  tooltipdiv.classList.add("invisible")


  var selectform = selectdiv.appendChild(document.createElement("select"));
  selectform.id="selectform";
  selectform.value="pa_application"

  var filterdiv = contentdiv.appendChild(document.createElement("div"));
  filterdiv.id="filterdiv";
  filterdiv.classList.add("filterdiv");
  filterdiv.classList.add("invisible");

  page=1;
  var labeldict=new Object()
  var labelcollection=new Object()

  var heads={
    "id":"ID",
    "title":"Title",
    "raised_by":"Raised by",
    "assignees":"Assignee(s)",
    "created":"Created at",
    "updated":"Last update",
    "city":"Cities",
    "feature":"Feature",
    "relevance":"Relevance",
    "other_labels":"Other labels",
    "status":"Status"
    }


  var button = selectdiv.appendChild(document.createElement("button"));
  button.id="selectbutton";
  button.innerHTML="Get Issues";
  button.addEventListener("click",function(){
    tablediv.innerHTML="";
    issuetable = tablediv.appendChild(document.createElement("table"));
    appendtable(selectform.value,page);
    createheads(heads)});

  //Table set up, start querying

  function generatefilter (head){
    console.log(labelcollection)
    console.log(labeldict)
    console.log(labelcollection[head.target.id])
    // let rows = document.getElementsByTagName("tr");
    // // console.log(rows)
    // let filtercats = new Set();
    //
    // for (var i in rows){
    //   if (rows[i].childNodes != undefined){
    //     let labels = rows[i].childNodes[7].childNodes;
    //     for (var l in labels){
    //       let label = labels[l].innerHTML
    //       if (label != undefined){
    //         filtercats.add(label)
    //       }
    //     }
    //
    //   }
    // }
    //
    // console.log(filtercats)


  }

  //   //Creating table heads
    function createheads(heads){
      var tablehead = issuetable.appendChild(document.createElement("tr"));
      for (head in heads){
        let entry = document.createElement("th")
        entry.id=head;
        entry.innerHTML=heads[head];
        entry.addEventListener("click",function(head){generatefilter(head)})
        tablehead.appendChild(entry);
        labelcollection[head]=new Set()
      }
    }






  for (issue in issuelinks) {
    let opt = selectform.appendChild(document.createElement("option"));
    opt.value=issuelinks[issue].link;
    opt.innerHTML=issuelinks[issue].name;
  }

  //Page initialised


  function appendtable(q,page){
    //Define how many results should be loaded per query
    var perpage=100;
    //Link to the repository
    var repolink = "https://api.github.com/repos/micado-eu/REPONAME/issues?state=all&per_page=PERPAGE&page=".replace("REPONAME",q).replace("PERPAGE",perpage)+page

    var labelcats = {
      "Hamburg":"city",
      "Antwerp":"city",
      "Bologna":"city",
      "Madrid":"city",
      "UX":"feature",
      "general":"feature",
      "migration situation monitor":"feature",
      "migrant management":"feature",
      "cso admin management":"feature",
      "guided processes":"feature",
      "information centre":"feature",
      "events":"feature",
      "MICADO stats":"feature",
      "glossary":"feature",
      "chatbot":"feature",
      "app settings":"feature",
      "my documents":"feature",
      "integration plan":"feature",
      "validations":"feature",
      "WP4":"relevance",
      "WP5":"relevance",
      "LESC":"relevance",
    }



    var request = new XMLHttpRequest();
    request.onload = addtotable;
    request.open('get', repolink, true)
    request.send()


    function addtotable() {



      var responseObj = JSON.parse(this.responseText);



      //Creating table rows
      function createrows(rows){
        for (row in rows){

          let curr_row = issuetable.appendChild(document.createElement("tr"));
          let rowdata = rows[row];


          Object.keys(heads).forEach(initrows)



          function initrows(item,index,arr){
            curr_row.appendChild(document.createElement("td")).innerHTML;
          }

          function populatecell(index,content){
            curr_row.childNodes[index].appendChild(document.createElement("div")).innerHTML=content;
          }

          function getindex(lookup){
            return Object.keys(heads).indexOf(lookup);
          }


          populatecell(getindex("id"),"<a href="+rowdata.html_url+" target='_blank' >"+rowdata.number+"</a>")
          populatecell(getindex("title"),rowdata.title);
          populatecell(getindex("raised_by"),rowdata.user.login);
          populatecell(getindex("created"),(rowdata.created_at).replace("T"," ").replace("Z",""));
          populatecell(getindex("updated"),(rowdata.updated_at).replace("T"," ").replace("Z",""));
          populatecell(getindex("status"),rowdata.state);
          populatecell(getindex("assignees"),getsubobject(rowdata.assignees,"login"))

          var labels=rowdata.labels;

          let cities = [];
          let others = [];

          labels.forEach(assignlabels);
          function assignlabels(item,index,arr){

            labeldict[item.node_id]=item.name

            let label = document.createElement("div")
            label.classList.add("label",item.node_id);
            label.innerHTML=item.name;
            label.style.borderColor="#"+item.color;

            //create toolt
            label.addEventListener("mouseover",function(){
              tooltipdiv.classList.remove("invisible")
              tooltip_content=tooltipdiv.appendChild(document.createElement("div"));
              tooltip_content.innerHTML=item.description;
              tooltipdiv.style.left=event.clientX+"px";
              tooltipdiv.style.top=event.clientY+"px";

            })
            label.addEventListener("mouseout",function(){
              tooltipdiv.innerHTML="";
              tooltipdiv.classList.add("invisible")
            })


            if (Object.keys(labelcats).includes(item.name)){
              labelcollection[labelcats[item.name]].add(item.node_id)
              curr_row.childNodes[getindex(labelcats[item.name])].appendChild(label)
            }
            else{
              curr_row.childNodes[getindex("other_labels")].appendChild(label)
              labelcollection["other_labels"].add(item.node_id)
            }
          }


        }
      }

      function getsubobject(input,key){
        let output = []
        for (i in input){
          output.push(input[i][key])
        }
        return output.join(', ')
      }

      // createheads(heads)
      createrows(responseObj)


      if (responseObj.length>=perpage){
        page=page+1;
        appendtable(selectform.value,page)
      }




    }


  }


}
