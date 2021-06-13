var loadJS = function(url, implementationCode, location){
    //url is URL of external file, implementationCode is the code
    //to be called from the file, location is the location to 
    //insert the <script> element
  
    var scriptTag = document.createElement('script');
    scriptTag.src = url;
  
    scriptTag.onload = implementationCode;
    scriptTag.onreadystatechange = implementationCode;
  
    location.appendChild(scriptTag);
  };
  var yourCodeToBeCalled = function(){
    run()
  }
  
  loadJS('//mozilla.github.io/pdf.js/build/pdf.js', yourCodeToBeCalled, document.body);
  