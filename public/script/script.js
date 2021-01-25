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

  var loadmorediv = contentdiv.appendChild(document.createElement("div"));
  loadmorediv.id="loadmorediv";
  loadmorediv.classList.add("loadmorediv");


  var selectform = selectdiv.appendChild(document.createElement("select"));
  selectform.id="selectform";
  selectform.value="pa_application"

  page=1;

  // var heads=["Id","Title","Raised by","Created","Last update","Assignee(s)","Cities","Feature","Criticality","Labels","Status"];
  // var heads = []
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
    "essential":"Essential",
    "other_labels":"Other labels",
    "status":"Status"
    }


  var button = selectdiv.appendChild(document.createElement("button"));
  button.id="selectbutton";
  button.innerHTML="Get Issues";
  button.addEventListener("click",function(){
    tablediv.innerHTML="";
    loadmorediv.innerHTML="";
    issuetable = tablediv.appendChild(document.createElement("table"));
    appendtable(selectform.value,page);
    createheads(heads)});

  //Table set up, start querying



    //Creating table heads
    function createheads(heads){
      var tablehead = issuetable.appendChild(document.createElement("tr"));
      for (head in heads){
        tablehead.appendChild(document.createElement("th")).innerHTML=heads[head];
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
    var perpage=30;
    //Link to the repository
    var repolink = "https://api.github.com/repos/micado-eu/REPONAME/issues?state=all&per_page=PERPAGE&page=".replace("REPONAME",q).replace("PERPAGE",perpage)+page

    var labelcats = {
      "Hamburg":"city",
      "Antwerp":"city",
      "Bologna":"city",
      "Madrid":"city",
      "enhancement":"city",
      "help wanted":"city",
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
      "WP4":"relevance",
      "WP5":"relevance",
      "LESC":"relevance",
      "essential":"essential"
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

          // console.log(Object.keys(heads).indexOf("title"))

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
            let label = document.createElement("div")
            label.classList.add("label");
            label.innerHTML=item.name;
            label.style.backgroundColor="#"+item.color;
            if (Object.keys(labelcats).includes(item.name)){
              curr_row.childNodes[getindex(labelcats[item.name])].appendChild(label)
            }
            else{
              curr_row.childNodes[getindex("other_labels")].appendChild(label)
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
        // var loadmore = loadmorediv.appendChild(document.createElement("div"));
        // var loadmoretext = loadmore.appendChild(document.createElement("p")).innerHTML="load more";
        // loadmore.classList.add("loadmore");
        // loadmore.addEventListener("click",function(){page=page+1;loadmorediv.innerHTML=""; appendtable(selectform.value,page)})
      }




    }


  }


}
