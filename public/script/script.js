function createissuetable(id) {

    //Initialise site

    var contentdiv = document.getElementById(id); //Content comes here
    var issuelinks = [{
            "name": "PA application",
            "link": "pa_application"
        },
        {
            "name": "CSO application",
            "link": "ngo_application"
        },
        {
            "name": "Migrant application",
            "link": "migrant_application"
        }
    ]; //Links to the repositories queried


    //Setting up empty divs for the content
    //Selector
    var selectdiv = contentdiv.appendChild(document.createElement("div"));
    selectdiv.id = "selectdiv";
    selectdiv.classList.add("selectdiv");

    var selectform = selectdiv.appendChild(document.createElement("select"));
    selectform.id = "selectform";
    selectform.value = "pa_application";

    for (issue in issuelinks) {
        let opt = selectform.appendChild(document.createElement("option"));
        opt.value = issuelinks[issue].link;
        opt.innerHTML = issuelinks[issue].name;
    };

    //Button that starts querying
    var button = selectdiv.appendChild(document.createElement("button"));
    button.id = "selectbutton";
    button.innerHTML = "Query Issues";
    button.addEventListener("click", function() {
        tablediv.innerHTML = "";
        issuetable = tablediv.appendChild(document.createElement("table"));
        appendtable(selectform.value, page);
        createheads(heads)
    });



    //Table (main content)
    var tablediv = contentdiv.appendChild(document.createElement("div"));
    tablediv.id = "tablediv";
    tablediv.classList.add("tablediv");

    //Tooltip hovering over labels
    var tooltipdiv = contentdiv.appendChild(document.createElement("div"));
    tooltipdiv.id = "tooltipdiv";
    tooltipdiv.classList.add("tooltipdiv");
    tooltipdiv.classList.add("invisible");

    //Filtering entries
    var filterdiv = contentdiv.appendChild(document.createElement("div"));
    filterdiv.id = "filterdiv";
    filterdiv.classList.add("filterdiv");
    filterdiv.classList.add("invisible");

    var page = 1; //Github queries max 100 entries, this variable increases after the query automatically
    var labeldict = new Object(); //links the label codes to the label names
    labeldict["empty"]="empty";
    var labelcollection = new Object(); //categorises labels
    var invisiblelabels = new Set(); //contains the features that contain the class appendinvisible

    var invislabels = new Object();


    //headers of table
    var heads = {
        "id": "ID",
        "title": "Title",
        "raised_by": "Raised by",
        "assignees": "Assignee(s)",
        "city": "Cities",
        "feature": "Feature",
        "relevance": "Relevance",
        "other_labels": "Other labels",
        "status": "Status",
        "created": "Created at",
        "updated": "Last update"
    };

    //These heads have a filter option
    var filterheads = ["city", "raised_by", "assignees", "feature", "relevance", "other_labels", "status"];

    //Assigns labels to categories (=columns)
    var labelcats = {
        "Hamburg": "city",
        "Antwerp": "city",
        "Bologna": "city",
        "Madrid": "city",
        "UX": "feature",
        "general": "feature",
        "migration situation monitor": "feature",
        "migrant management": "feature",
        "cso admin management": "feature",
        "guided processes": "feature",
        "information centre": "feature",
        "events": "feature",
        "MICADO stats": "feature",
        "glossary": "feature",
        "chatbot": "feature",
        "app settings": "feature",
        "my documents": "feature",
        "integration plan": "feature",
        "validations": "feature",
        "WP4": "relevance",
        "WP5": "relevance",
        "LESC": "relevance",
    };

    //Appends label attributes to the parent cell
    function appendData(elem,id,inp){
      if (elem.getAttribute(id) == null){               //If entry does not exist, it will be generated
        elem.setAttribute(id,inp);
      } else if (elem.getAttribute(id)== "empty") {    //Resets attribute and replaces empty
        elem.setAttribute(id,inp)
      }else {
        let attr = elem.getAttribute(id).split(","); //appends entry to the array
        attr.push(inp);
        elem.setAttribute(id,attr.join())
      }
    }



    function appendinvisible2(key,value){

      if (invislabels[key].has(value)){
        invislabels[key].delete(value);
      }else{
        invislabels[key].add(value);
      }

      resettable();


    }

    function resettable(){
      let tablerows = document.getElementsByClassName("tablerow");
      for (var t = 0; t < tablerows.length; t++) {
          tablerows[t].classList.remove("invisible");
          tablerows[t].classList.remove("selected"); ///delete

      }
    }

    function generatequery(item,index,array){
      var query
      if (invislabels[item].size > 0){
        query="."+item+"."+[...invislabels[item]].join(', .'+item+".");
        let entries = document.querySelectorAll(query);

        for (var e = 0; e < entries.length; e++) {
          let counter = 0;
          let dataentries = entries[e].parentNode.getAttribute("data-entries").split(",");
          for (i in dataentries){
            if (invislabels[item].has(dataentries[i])){
              counter=counter+1;
            }
          }
          if (counter == dataentries.length){
            entries[e].parentNode.parentNode.classList.add("invisible")
          }

        }
      };
    };




    //Generates the filter in the table heads
    function generatefilter(head) {

        var cells = document.getElementsByClassName("cell " + head.target.id);
        // var cells = document.getElementsByClassName("cell cities")
        let labelset = new Set();

        for (var c = 0; c < cells.length; c++) {
          // cells[c].classList.add("selected");
          let entrylist = cells[c].getAttribute("data-entries").split(",");
          for (var e=0; e < entrylist.length; e++){
            labelset.add(entrylist[e])
          }
        }

        // let labels = Array.from(labelcollection[head.target.id]);
        let labels = Array.from(labelset).sort(function(a,b){return a.toLowerCase().localeCompare(b.toLowerCase());});
        labels.push(labels.splice(labels.indexOf("empty"), 1)[0]);

        //Setting up filterdiv
        filterdiv.classList.remove("invisible");
        filterdiv.innerHTML = "";
        var filterwindow = document.createElement("div");
        var closebar = document.createElement("div");
        closebar.classList.add("closebar");
        var closebarx = document.createElement("div")
        closebarx.classList.add("closebarx");
        var closetitle = document.createElement("div")
        closetitle.innerHTML = heads[head.target.id];
        closetitle.classList.add("closetitle");


        closebar.appendChild(closetitle);
        closebar.appendChild(closebarx);
        filterdiv.appendChild(closebar);
        closebar.addEventListener("click", function() {
            filterdiv.innerHTML = "";
            filterdiv.classList.add("invisible");
        })
        filterdiv.appendChild(filterwindow);

        var deselect = document.createElement("div");
        var des_button = document.createElement("button");
        des_button.innerHTML = "Deselect all";
        des_button.addEventListener("click",function(){
          invislabels[head.target.id]=new Set(labels);
          resettable();
          Object.keys(invislabels).forEach(generatequery);
          let checklists = filterwindow.getElementsByClassName('checkentry');
          for (var c = 0; c < checklists.length; c++) {
            checklists[c].getElementsByTagName("input")[0].checked = false;
            checklists[c].classList.add("inactive");
          }
        });
        var sel_button = document.createElement("button");
        sel_button.innerHTML = "Select all";
        sel_button.addEventListener("click",function(){
          invislabels[head.target.id]=new Set();
          resettable();
          Object.keys(invislabels).forEach(generatequery);
          let checklists = filterwindow.getElementsByClassName('checkentry');
          for (var c = 0; c < checklists.length; c++) {
            checklists[c].getElementsByTagName("input")[0].checked = true;
            checklists[c].classList.remove("inactive");
          }
        });
        deselect.appendChild(sel_button);
        deselect.appendChild(des_button);
        filterwindow.appendChild(deselect);


        //Filterdiv set up
        //Generating content

        var list = document.createElement("div");
        list.classList.add("checkboxlist");

        for (l in labels) {
            let entry = document.createElement("div");
            entry.classList.add("checkentry");
            let lab = labels[l];
            let checkbox = document.createElement("input");

            checkbox.type = "checkbox";
            checkbox.name = lab;
            checkbox.value = lab;
            checkbox.id = lab;
            checkbox.checked = true;

            if (invislabels[head.target.id].has(lab)) {
                checkbox.checked = false;
                entry.classList.add("inactive");

            }


            let content = document.createElement("label");
            // content.htmlFor = lab+" ("+document.querySelectorAll(".cell."+lab+":not(invisible)").length+")";
            content.htmlFor = lab;
            content.appendChild(document.createTextNode(labeldict[lab]));
            entry.appendChild(checkbox);
            entry.appendChild(content);

            list.appendChild(entry);

            checkbox.addEventListener("click", function() {
                checkbox.classList.toggle("inactive");
                entry.classList.toggle("inactive");
                appendinvisible2(head.target.id,checkbox.id);
                Object.keys(invislabels).forEach(generatequery)
            });

        }
        filterwindow.appendChild(list);

        let position = head.srcElement.getBoundingClientRect();
        let poselem = filterdiv.getBoundingClientRect();



        filterdiv.style.left = position.left + window.scrollX + (position.width / 2) - (poselem.width / 2) + "px";
        filterdiv.style.top = position.top + window.scrollY + "px";


    }


    //   Creating table heads
    function createheads(heads) {
        var tablehead = issuetable.appendChild(document.createElement("tr"));
        tablehead.classList.add("head");
        for (head in heads) {
            invislabels[head]=new Set();
            let entry = document.createElement("th");
            entry.id = head;
            entry.innerHTML = heads[head];
            if (filterheads.includes(head)) {
                entry.classList.add("filterable");
                entry.addEventListener("click", function(head) {
                    generatefilter(head)
                });
            };
            tablehead.appendChild(entry);
            labelcollection[head] = new Set();
            labelcollection["status"] = new Set(["open", "closed"]);
        };
    };





    //Page initialised


    function appendtable(q, page) {


        //Define how many results should be loaded per query (max 100, 30 by standard)
        var perpage = 100;
        //Link to the repository
        var repolink = "https://api.github.com/repos/micado-eu/REPONAME/issues?state=all&per_page=PERPAGE&page=".replace("REPONAME", q).replace("PERPAGE", perpage) + page;


        var request = new XMLHttpRequest();
        request.onload = addtotable;
        request.open('get', repolink, true);
        request.send();


        function addtotable() {



            var responseObj = JSON.parse(this.responseText);



            //Creating table rows
            function createrows(rows) {
                for (row in rows) {

                    //Setss up empty cells
                    function initrows(item, index, arr) {
                        var cell = document.createElement("td");
                        appendData(cell,"data-entries","empty");
                        cell.classList.add("cell",item)
                        var entry = document.createElement("div");
                        entry.classList.add("empty", "entry", item);
                        curr_row.appendChild(cell).appendChild(entry);
                    };

                    //Populates the cell with content
                    function populatecell(index, content) {
                        if (content.length > 0) {
                            var cell = curr_row.childNodes[index];
                            cell.innerHTML = "";
                            var cont = document.createElement("div");
                            cont.innerHTML = content.toString();
                            cont.classList.add(Object.keys(heads)[index], "entry");
                            cont.classList.add(content.replace(/([^a-z0-9]+)/gi, '_'));
                            appendData(cell,"data-entries",content.replace(/([^a-z0-9]+)/gi, '_'))
                            labeldict[content.replace(/([^a-z0-9]+)/gi, '_')] = content;
                            cell.appendChild(cont);

                        };
                    };
                    //Gets the column number of entries
                    function getindex(lookup) {
                        return Object.keys(heads).indexOf(lookup);
                    }
                    //Removes the empty class if new data is assigned
                    function removeempty(index) {
                        var emp = curr_row.childNodes[index].getElementsByClassName("empty " + Object.keys(heads)[index])[0];
                        if (emp != undefined) {
                            emp.parentNode.removeChild(emp);
                        };
                    };
                    //Iterates through the assignees
                    function getassignees(item, index, arr) {
                        labeldict[item.login.replace(/([^a-z0-9]+)/gi, '_')] = item.login;

                        let assignee = document.createElement("div");
                        assignee.classList.add("entry", "assignees", item.login.replace(/([^a-z0-9]+)/gi, '_'));
                        assignee.innerHTML = item.login;

                        curr_row.childNodes[getindex("assignees")].appendChild(assignee);
                      appendData(curr_row.childNodes[getindex("assignees")],"data-entries",item.login.replace(/([^a-z0-9]+)/gi, '_'))
                    };
                    //Iterates through the labels and assigns them to the right columns
                    function assignlabels(item, index, arr) {

                        labeldict[item.node_id] = item.name;

                        let label = document.createElement("div");
                        label.classList.add("label", "entry", item.node_id);
                        label.innerHTML = item.name;
                        label.style.borderColor = "#" + item.color;


                        //create tooltip
                        label.addEventListener("mouseover", function() {
                            tooltipdiv.classList.remove("invisible")
                            tooltip_content = tooltipdiv.appendChild(document.createElement("div"));
                            tooltip_content.innerHTML = item.description;
                            tooltipdiv.style.left = event.clientX + "px";
                            tooltipdiv.style.top = event.clientY + "px";

                        });
                        //remove tooltip
                        label.addEventListener("mouseout", function() {
                            tooltipdiv.innerHTML = "";
                            tooltipdiv.classList.add("invisible");
                        });

                        //Assigns labels to categories
                        if (Object.keys(labelcats).includes(item.name)) {
                            removeempty(getindex(labelcats[item.name]));
                            labelcollection[labelcats[item.name]].add(item.node_id);
                            label.classList.add(Object.keys(heads)[getindex(labelcats[item.name])]);
                            curr_row.childNodes[getindex(labelcats[item.name])].appendChild(label);
                            appendData(curr_row.childNodes[getindex(labelcats[item.name])],"data-entries",item.node_id);

                        } else {
                            removeempty(getindex("other_labels"));
                            curr_row.childNodes[getindex("other_labels")].appendChild(label);
                            label.classList.add("other_labels");
                            labelcollection["other_labels"].add(item.node_id);
                            appendData(curr_row.childNodes[getindex("other_labels")],"data-entries",item.node_id);
                        };


                    };

                    let curr_row = issuetable.appendChild(document.createElement("tr"));
                    curr_row.classList.add("tablerow");

                    let rowdata = rows[row];

                    Object.keys(heads).forEach(initrows);

                    // populatecell(getindex("id"),"#"+rowdata.number.toString())
                    populatecell(getindex("title"), rowdata.title);
                    populatecell(getindex("raised_by"), rowdata.user.login);
                    populatecell(getindex("created"), (rowdata.created_at).replace("T", " ").replace("Z", ""));
                    populatecell(getindex("updated"), (rowdata.updated_at).replace("T", " ").replace("Z", ""));
                    populatecell(getindex("status"), rowdata.state);

                    if (rowdata.assignees.length > 0) {
                        removeempty(getindex("assignees"));
                        rowdata.assignees.forEach(getassignees);
                    };

                    var link = curr_row.childNodes[getindex("id")].appendChild(document.createElement("a"));
                    link.href = rowdata.html_url;
                    link.target = "_blank";
                    link.innerHTML = "#" + rowdata.number.toString();

                    var stat = curr_row.childNodes[getindex("status")].childNodes[0];
                    stat.classList.add("label");
                    stat.classList.add(stat.innerHTML);
                    var labels = rowdata.labels;


                    labels.forEach(assignlabels);



                }

            }


            createrows(responseObj); //Fills the table

            //If there are more than 100 results, the query continutes
            if (responseObj.length >= perpage) {
                page = page + 1;
                appendtable(selectform.value, page);
            };




        }


    }


}
