$('document').ready(function () {
    init()
    function init() {
        var defaultTermsList = ["Heat", "Angel", "DARKNESS", "RACE", "DISEASE", "Motion", "ENERGY", "MACHINE", "MAZE", "MEDICINE", "BUILDING", "COMPETITION"]
        buildSuggestedItemList(defaultTermsList)
        all_source_word_list = "Heat, Motion,Angel,Journey,CONFINEMENT,GAME,Place,MONSTER,PLANT,A_RIGHT,CRIME,GAP,Hunger, MORAL_DUTY,PORTAL,ABYSS,Plants,CROP,GEOGRAPHIC_FEATURE,MOVEMENT,ADDICTION,DARKNESS,GREED,NATURAL_PHYSICAL_FORCE,RACE,ANIMAL,DESTROYER,HUMAN_BODY,OBESITY,RESOURCE,BATTLE,DISEASE,IMPURITY,PARASITE,STAGE,BLOOD_STREAM,ENERGY,LIGHT,PATHWAY,STRUGGLE,BODY_OF_WATER,ENSLAVEMENT,MACHINE,PHYSICAL_BURDEN,THEFT,BUILDING,FOOD,MAZE,PHYSICAL_HARM,VISION,COMPETITION,FORCEFUL_EXTRACTION,MEDICINE,PHYSICAL_LOCATION,WAR"
        all_source_word_list = all_source_word_list.replace(/,\s*$/, "")
        $('#sourceWordListContainer').val(all_source_word_list)
    }

    function buildSuggestedItemList(termsList) {
        var btnClassList = ["primary", "info", "warning", "danger", "success", "default"]
        var result = ""
        var btnNumber = 0
        var iteration = 0
        if (termsList.length < 5) {
            iteration = termsList.length
        }
        else {
            iteration = 4
        }
        for (let i = 0; i < iteration; i++) {
            btnNumber = Math.floor(Math.random() * (5 - 0 + 1) + 0)
            result += "<button class='source-term-item btn btn-lg btn-" + btnClassList[btnNumber] + "'> " + termsList[i] + "</button > "
        }
        $('#suggest-item-box').html(result)
    }

    $('#source-term').keyup(function () {
        var alltermList = $('#sourceWordListContainer').val().split(',')
        var term = $(this).val()
        var search = new RegExp(term, 'i'); // prepare a regex object
        let allResult = alltermList.filter(item => search.test(item));
        let finalResult = allResult.slice(0, 12)
        var defaultTermsList = ["Heat", "Motion", "DARKNESS", "RACE", "DISEASE", "ENERGY", "MACHINE", "MAZE", "MEDICINE", "BUILDING", "COMPETITION"]
        if (finalResult.length > 0) {
            buildSuggestedItemList(finalResult)
        } else {
            buildSuggestedItemList(defaultTermsList)
        }
    })

    $(document).on('click', '.source-term-item', function () {
        var source_dict_type = $('#source_dict_type').val()
        hyponym_count = 0
        var source_term = $(this).text()
        $('#selected_hyponym_term').val(source_term)
        $('#source-term').val(source_term)
        var hyponym_result = []
        var concept_net_terms = []
        var temp = ""
        var n
        var english = /^[A-Za-z0-9]*$/
        /* call hyponym function from python here */
        if(source_dict_type == 'w') {
          $.ajax({
              type: 'POST',
              url: 'hypo_list/',
              data: {
                  name: source_term.toString().trim(),
                  csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val()
              },
              success: function (data) {
                  hyponym_result = data.split(',')
                  var btn_data = '<span style="color:gray; font-style:italic;font-size: 14px;">Hyponyms:</span><br>'
                  for (let i = 0; i < hyponym_result.length; i++) {
                      if(hyponym_result[i] != "") {
                          btn_data += "<button class='hyponym-item btn btn-secondary'>" + hyponym_result[i].slice(0, -5) + "</button>"
                      }
                  }
                  $('#hyponym-list-box').html(btn_data)
                  $('#hyponym-list-box').slideDown()
              }
          })
        } else {
          $.ajax({
            type: 'GET',
            url: 'http://api.conceptnet.io/related/c/en/' + source_term.toString().toLowerCase().trim(),
            success: function (data) {
              concept_net_data = data.related
              for(let i = 0; i < concept_net_data.length; i++) {
                	temp = concept_net_data[i]['@id']
                  n = temp.lastIndexOf('/');
                  temp = temp.substring(n + 1);
                  console.log(temp)
                  if (english.test(temp)) {
                    concept_net_terms.push(temp.slice(' '))
                  }
              }
              var btn_data = '<span style="color:gray; font-style:italic;font-size: 14px;">Concepts:</span><br>'
              for (let i = 0; i < concept_net_terms.length; i++) {
                  if(concept_net_terms[i] != "") {
                      btn_data += "<button class='hyponym-item btn btn-secondary'>" + concept_net_terms[i] + "</button>"
                  }
              }
              $('#hyponym-list-box').html(btn_data)
              $('#hyponym-list-box').slideDown()
              console.log(concept_net_data.length)
            }
          })
        }

        /* */
        //hyponym_result = ["Fire", "Water", "Earth", "Devil", "Human", "Girl", "Cow", "Money", "Gold", "Silver", "Spoon", "Knife", "Gun"]
    });

    var hyponym_count = 0
    var selected_hyponyms = ""

    $(document).on('click', '.hyponym-item', function () {
        if (hyponym_count < 4 || $(this).hasClass('active')) {
            if (!$(this).hasClass('active')) {
                $(this).addClass('active')
                hyponym_count = hyponym_count + 1
            } else {
                $(this).removeClass('active')
                hyponym_count = hyponym_count - 1
            }
        } else {
            alert("You can not select more than 4 items!!")
        }
    })

    // draw left graph
    $(document).on('click', '#draw-source-graph', function (e) {
        var hyponym_list_final = ""
        $('.hyponym-item.active').each(function (index, obj) {
            hyponym_list_final += $(this).text() + ",";
        })
        hyponym_list_final = hyponym_list_final.slice(0, -1)
        if(hyponym_list_final != "") {
          $('#selected_hyponyms_listContainer').val(hyponym_list_final)
          var hyponyms = hyponym_list_final.split(',')
          $('#hyponym-list-box').slideUp()
          console.log(hyponyms)
          var source_term = $('#selected_hyponym_term').val().toLowerCase().toString().trim()
          graph_html = buildGraph(source_term, hyponyms)
          $('.left-graph').html(graph_html).slideDown()
        } else {
          alert('Please select atleast 1 hyponym!!')
        }
    })

    // Draw right Graph
    $(document).on('click', '#draw-target-graph', function (e) {
      $('#targetWordListContainer').html('')
      var source_term = $('#selected_hyponym_term').val().toLowerCase().toString().trim()
      var target_term = $('#target-term-input').val().toString().trim()
      var selected_hyponyms_arr = $('#selected_hyponyms_listContainer').val().toString().trim().split(',')
      var target_term_string = ""
      counter = 0
      for(let i = 0; i < selected_hyponyms_arr.length; i++) {
        $.ajax({
            type: 'POST',
            url: 'most_similar/',
            data: {
                name: source_term + "," + selected_hyponyms_arr[i] + "," + target_term,
                csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val()
            },
            success: function (data) {
              $('#edit-target-graph').show()
              data = data + "^"
              $('#targetWordListContainer').append(data)
              counter = counter + 1
              console.log(data)
              console.log("Counter--" + counter)
              if(counter == selected_hyponyms_arr.length) {
                raw_result = $('#targetWordListContainer').html()
                item_raw_arr = raw_result.split('^')
                target_graph_item_arr = []
                target_graph_item_suggestion_arr = []
                for(let k = 0; k < selected_hyponyms_arr.length; k++) {
                  if(item_raw_arr[k] != "NA") {
                    l = item_raw_arr[k].replace(/\[/g, '').replace(/\(/g, '').replace(/\)/g, '|').replace(/\'/g, '').replace(/\]/g, '').slice(0, -1)
                    target_graph_item_suggestion_arr.push(l)
                    suggest_items_with_score = l.split('|')
                    first_item = suggest_items_with_score[0].split(',')[0]
                    target_graph_item_arr.push(first_item)
                  } else {
                    target_graph_item_arr.push("NA")
                    target_graph_item_suggestion_arr.push("")
                  }
                }
                graph_html = buildGraph(target_term, target_graph_item_arr)
                $('.right-graph').html(graph_html).slideDown()

                var edit_target_html = ""
                for(let k = 0; k < target_graph_item_suggestion_arr.length; k++) {
                  if(target_graph_item_suggestion_arr[k] != "") {
                    edit_target_html += "<ul class='item_" + (k+1) + "'>"
                    x = target_graph_item_suggestion_arr[k].split('|,')
                    for (let z = 0; z < x.length; z++) {
                      x_arr = x[z].split(',')
                      edit_target_html += "<li class='alternate_item' caption='" + x_arr[0] + "'>" + x_arr[0] + " (" + x_arr[1].substring(0, 4)*100 + "%)</li>"
                    }
                    edit_target_html += "</ul>"
                  }
                }
                $('#edit_target_graph_modal .modal-body').html(edit_target_html)
                console.log(target_graph_item_suggestion_arr)
              }
            }
        })
      }
    })

    // load Dataset
    $(document).on('click', '#load-dataset', function (e) {
      var dataset = $('#selected_data_set').val()
      console.log('Loading ' + dataset)
      $('#dataset_load_status').html("Loading '" + dataset + "'")
      // Loading the model
      $.ajax({
          type: 'POST',
          url: 'load_model/',
          data: {
              dataset: dataset,
              csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val()
          },
          success: function (data) {
              $('#dataset_load_status').html("'" + dataset + "' Loaded!")
              console.log('Dataset Loaded')
          }
      })
    })

    // change domain graph items
    $(document).on('click', '.alternate_item', function (e) {
      var data = $(this).html()
      data = data.substr(0, data.indexOf('(')).trim(' ');
      parent_class = $(this).parent().attr('class')
      switch (parent_class) {
        case 'item_1':
          $('.item_1 li').css('background', '#e0e0e0').css('color','#333')
          $('.right-graph #box-u-1').html(data)
          break;
        case 'item_2':
          $('.item_2 li').css('background', '#e0e0e0').css('color','#333')
          $('.right-graph #box-u-2').html(data)
          break;
        case 'item_3':
          $('.item_3 li').css('background', '#e0e0e0').css('color','#333')
          $('.right-graph #box-d-1').html(data)
          break;
        case 'item_4':
          $('.item_4 li').css('background', '#e0e0e0').css('color','#333')
          $('.right-graph #box-d-2').html(data)
          break;
        default:
      }
      $(this).css('background', 'rgba(0,0,0,0.8)').css('color', '#fff')
    })

    // Build graph
    function buildGraph(term, items) {
        var output = ""
        for (let i = 0; i < items.length; i++) {
          output += '<div class="line line-' + (i+1) + '"></div>'
        }
        output += '<div class="graph-level-div level-up-1">' +
                      '  <div class="container-fluid">' +
                      '	  <div class="row">' +
                      '		  <div class="bubble-box col-md-3" id="box-u-1">' + items[0] + '</div>'
        if(items.length > 1) {
          output +=   '		  <div class="bubble-box col-md-3 col-md-offset-5" id="box-u-2">' + items[1] + '</div>'
        }
        output +=     '	  </div>' +
                      '  </div>' +
                      '</div>' +
                      '<div class="graph-level-div level-0">' +
                      '  <div class="rectangle-box" id="box-0">' + term + '</div>' +
                      '</div>'
        if(items.length > 2) {
          output +=   '<div class="graph-level-div level-down-1">' +
                      '  <div class="container-fluid">' +
                      '	  <div class="row">' +
                      '		  <div class="bubble-box col-md-3" id="box-d-1">'+ items[2] + '</div>'
        }
        if(items.length > 3) {
          output +=   '		  <div class="bubble-box col-md-3 col-md-offset-5" id="box-d-2">' + items[3] + '</div>'
        }
        output +=     '	  </div>' +
                      '  </div>' +
                      '</div>'

        return output
    }
});
