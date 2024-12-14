window.onload = function() {

    fetch('appleHistory.json')
 
    .then(function(response) {
       return response.json();
    })
   
    .then(function(json) {
 
       var tableCode = '<table><caption>A Brief History of Apple Inc.</caption><thead><tr><th>Event</th><th>Year</th><th>Location</th><th>Description</th></tr></thead><tbody>';
 
       for (var i = 0; i < json.length; i++) {
          tableCode += '<tr><td>' + json[i].name + '</td><td>' + json[i].year + '</td><td>' + json[i].location + '</td><td>' + json[i].description + '</td></tr>';
       }
 
       tableCode += '</tbody><tfoot><tr><td colspan="4">Source: Apple Inc.</td></tr></tfoot></table>';
 
       document.getElementById('appleHistory').innerHTML = tableCode;
   })
 }
