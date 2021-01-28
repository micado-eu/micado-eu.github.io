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
  //links the label codes to the label names
  var labeldict=new Object()
  labeldict["open"]="open";
  labeldict["closed"]="closed";
  //categorises labels
  var labelcollection=new Object()
  //contains the features that contain the class appendinvisible
  var invisiblelabels=new Set()

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

  function appendinvisible(inp){
    if (invisiblelabels.has(inp)){
      invisiblelabels.delete(inp);
    } else {
      invisiblelabels.add(inp)
    }
    toggleinvisble()
  }

  function toggleinvisble(){
    let tablerows = document.getElementsByClassName("tablerow");

    for(var t=0; t < tablerows.length; t++)
    {
        tablerows[t].classList.remove("invisible");
    }


    if (invisiblelabels.size>0){
      let entries = document.querySelectorAll("."+[...invisiblelabels].join(', .'))


      for(var e=0; e < tablerows.length; e++)
      {
          if (entries[e]!=undefined){
            entries[e].parentNode.parentNode.classList.add("invisible");

          }
      }
    }


  }

  function generatefilter (head){
    filterdiv.classList.remove("invisible");
    let labels = Array.from(labelcollection[head.target.id]);
    labels.push("empty_"+head.target.id)
    labeldict["empty_"+head.target.id]="empty";
    filterdiv.innerHTML="";
    var filterwindow = document.createElement("div");
    var closebar = document.createElement("div");
    closebar.classList.add("closebar")
    var closebarx = document.createElement("div");
    closebarx.innerHTML="✖"
    closebarx.classList.add("closebarx")
    closebar.appendChild(closebarx)
    filterdiv.appendChild(closebar)
    closebar.addEventListener("click",function(){filterdiv.innerHTML="";filterdiv.classList.add("invisible")})

    filterdiv.appendChild(filterwindow);
    filterdiv.style.left=event.clientX+"px";
    filterdiv.style.top=event.clientY+"px";
    var list = document.createElement("ul");
    for (l in labels){
      let entry = document.createElement("li")
      entry.classList.add("filterentry")
      var lab = labels[l]
      if(invisiblelabels.has(lab)){
        entry.classList.add("inactive");
      }
      entry.innerHTML = labeldict[lab];
      entry.labelid = lab
      entry.addEventListener("click",function(){
        entry.classList.toggle("inactive");

        appendinvisible(entry.labelid);
      })
      list.appendChild(entry);
    }
    filterwindow.appendChild(list)

  }

  var filterheads = ["city","feature","relevance","other_labels","status"]

  //   //Creating table heads
    function createheads(heads){
      var tablehead = issuetable.appendChild(document.createElement("tr"));
      for (head in heads){
        let entry = document.createElement("th")
        entry.id=head;
        entry.innerHTML=heads[head];
        if (filterheads.includes(head)){
          entry.classList.add("filterable")
          entry.addEventListener("click",function(head){generatefilter(head)})
        }
        tablehead.appendChild(entry);
        labelcollection[head]=new Set()
        labelcollection["status"]=new Set(["open","closed"])
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
          curr_row.classList.add("tablerow");


          let rowdata = rows[row];

          Object.keys(heads).forEach(initrows)

          function initrows(item,index,arr){
            curr_row.appendChild(document.createElement("td")).appendChild(document.createElement("div")).classList.add("empty_"+item);
          }

          function populatecell(index,content){
            if (content.length>0){
              var cell = curr_row.childNodes[index]
              cell.innerHTML="";
              var cont=document.createElement("div")
              cont.innerHTML=content
              cell.appendChild(cont);

            }
          }

          function getindex(lookup){
            return Object.keys(heads).indexOf(lookup);
          }

          function removeempty(index){
            var emp = curr_row.childNodes[index].getElementsByClassName("empty_"+Object.keys(heads)[index])[0]
            if (emp != undefined){
              emp.parentNode.removeChild(emp)
            }
          }


          populatecell(getindex("id"),"<a href="+rowdata.html_url+" target='_blank' >"+rowdata.number+"</a>")
          populatecell(getindex("title"),rowdata.title);
          populatecell(getindex("raised_by"),rowdata.user.login);
          populatecell(getindex("created"),(rowdata.created_at).replace("T"," ").replace("Z",""));
          populatecell(getindex("updated"),(rowdata.updated_at).replace("T"," ").replace("Z",""));
          populatecell(getindex("status"),rowdata.state);
          populatecell(getindex("assignees"),getsubobject(rowdata.assignees,"login"))

          var stat = curr_row.childNodes[getindex("status")].childNodes[0]
          stat.classList.add("label")
          stat.classList.add(stat.innerHTML)
          //
          var labels=rowdata.labels;
          //
          //
          labels.forEach(assignlabels);
          function assignlabels(item,index,arr){

            labeldict[item.node_id]=item.name

            let label = document.createElement("div")
            label.classList.add("label",item.node_id);
            label.innerHTML=item.name;
            label.style.borderColor="#"+item.color;

            //create tooltip
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
               removeempty(getindex(labelcats[item.name]))
              labelcollection[labelcats[item.name]].add(item.node_id)
              curr_row.childNodes[getindex(labelcats[item.name])].appendChild(label)
            }
            else{
              removeempty(getindex("other_labels"))
              curr_row.childNodes[getindex("other_labels")].appendChild(label)
              labelcollection["other_labels"].add(item.node_id)
            }
          }


        }

      }
      //end of createrows

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
